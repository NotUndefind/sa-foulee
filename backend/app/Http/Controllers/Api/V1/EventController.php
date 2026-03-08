<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Event\StoreEventRequest;
use App\Http\Requests\Event\UpdateEventRequest;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventController extends Controller
{
    /**
     * Liste des événements avec filtres optionnels.
     */
    public function index(Request $request): JsonResponse
    {
        $user  = $request->user(); // null si non authentifié (route publique)
        $query = Event::query()
            ->withCount('participants')
            ->orderBy('event_date');

        // Filtre type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filtre à venir (par défaut : true)
        if ($request->boolean('upcoming', true)) {
            $query->where('event_date', '>=', now());
        }

        // Sans auth ou membre simple : uniquement événements publics
        $canSeePrivate = $user && $user->hasAnyRole(['admin', 'founder', 'bureau']);
        if (!$canSeePrivate) {
            $query->where('is_public', true);
        }

        $events = $query->paginate(12);

        $data = $events->map(fn(Event $event) => $this->formatEvent($event, $user?->id));

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $events->currentPage(),
                'last_page'    => $events->lastPage(),
                'total'        => $events->total(),
                'per_page'     => $events->perPage(),
            ],
        ]);
    }

    /**
     * Détail d'un événement.
     */
    public function show(Request $request, Event $event): JsonResponse
    {
        $user = $request->user(); // null si non authentifié

        $canSeePrivate = $user && $user->hasAnyRole(['admin', 'founder', 'bureau']);
        if (!$event->is_public && !$canSeePrivate) {
            abort(403, 'Cet événement est privé.');
        }

        $event->loadCount('participants');

        return response()->json($this->formatEvent($event, $user?->id));
    }

    /**
     * Créer un événement.
     */
    public function store(StoreEventRequest $request): JsonResponse
    {
        $event = Event::create([
            ...$request->validated(),
            'is_public'  => $request->boolean('is_public', true),
            'created_by' => $request->user()->id,
        ]);

        $event->loadCount('participants');

        return response()->json($this->formatEvent($event, $request->user()->id), 201);
    }

    /**
     * Modifier un événement.
     */
    public function update(UpdateEventRequest $request, Event $event): JsonResponse
    {
        $event->update($request->validated());
        $event->loadCount('participants');

        return response()->json($this->formatEvent($event, $request->user()->id));
    }

    /**
     * Supprimer un événement.
     */
    public function destroy(Request $request, Event $event): JsonResponse
    {
        $user = $request->user();

        if (!$user->hasAnyRole(['admin', 'founder'])
            && !($user->hasRole('bureau') && $event->created_by === $user->id)) {
            abort(403);
        }

        $event->delete();

        return response()->json(['message' => 'Événement supprimé.']);
    }

    /**
     * Liste des participants d'un événement.
     */
    public function participants(Event $event): JsonResponse
    {
        $participants = $event->participants()
            ->select('users.id', 'first_name', 'last_name', 'avatar')
            ->get()
            ->map(fn($u) => [
                'id'         => $u->id,
                'first_name' => $u->first_name,
                'last_name'  => $u->last_name,
                'avatar'     => $u->avatar,
            ]);

        return response()->json(['data' => $participants]);
    }

    /**
     * S'inscrire à un événement.
     */
    public function register(Request $request, Event $event): JsonResponse
    {
        $user = $request->user();

        if ($event->participants()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'Déjà inscrit.'], 409);
        }

        $event->participants()->attach($user->id, ['registered_at' => now()]);
        $event->loadCount('participants');

        return response()->json([
            'message'             => 'Inscription confirmée.',
            'registrations_count' => $event->participants_count,
        ]);
    }

    /**
     * Se désinscrire d'un événement.
     */
    public function unregister(Request $request, Event $event): JsonResponse
    {
        $user    = $request->user();
        $detached = $event->participants()->detach($user->id);

        if (!$detached) {
            return response()->json(['message' => 'Vous n\'étiez pas inscrit.'], 404);
        }

        $event->loadCount('participants');

        return response()->json([
            'message'             => 'Désinscription effectuée.',
            'registrations_count' => $event->participants_count,
        ]);
    }

    // -------------------------------------------------------------------------

    private function formatEvent(Event $event, ?int $currentUserId): array
    {
        return [
            'id'                 => $event->id,
            'title'              => $event->title,
            'description'        => $event->description,
            'type'               => $event->type,
            'event_date'         => $event->event_date->toIso8601String(),
            'location'           => $event->location,
            'created_by'         => $event->created_by,
            'is_public'          => $event->is_public,
            'registrations_count'=> $event->participants_count ?? 0,
            'is_registered'      => $currentUserId
                ? $event->participants()->where('user_id', $currentUserId)->exists()
                : false,
            'created_at'         => $event->created_at->toIso8601String(),
        ];
    }
}
