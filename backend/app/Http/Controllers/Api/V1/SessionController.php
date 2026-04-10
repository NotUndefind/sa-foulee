<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Session\StoreSessionRequest;
use App\Http\Requests\Session\UpdateSessionRequest;
use App\Models\TrainingSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SessionController extends Controller
{
    /**
     * Liste des sessions publiées (non-templates).
     */
    public function index(Request $request): JsonResponse
    {
        $query = TrainingSession::query()
            ->where('is_template', false)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->withCount('participants')
            ->orderByDesc('published_at');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $sessions = $query->paginate(12);

        $userId = $request->user()->id;

        $data = $sessions->map(fn (TrainingSession $s) => $this->formatSession($s, $userId));

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $sessions->currentPage(),
                'last_page' => $sessions->lastPage(),
                'total' => $sessions->total(),
                'per_page' => $sessions->perPage(),
            ],
        ]);
    }

    /**
     * Liste des templates disponibles.
     * Admins/founders/coaches voient tous les templates.
     * Les autres ne voient que leurs propres templates (cas rare).
     */
    public function templates(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = TrainingSession::where('is_template', true)
            ->orderByDesc('created_at');

        // Filtre par type optionnel
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Si pas gestionnaire, seulement ses propres templates
        if (! $user->hasAnyRole(['admin', 'founder', 'coach'])) {
            $query->where('created_by', $user->id);
        }

        $sessions = $query->get();

        return response()->json([
            'data' => $sessions->map(fn (TrainingSession $s) => $this->formatSession($s, $user->id)),
        ]);
    }

    /**
     * Détail d'une session.
     */
    public function show(Request $request, TrainingSession $session): JsonResponse
    {
        $session->loadCount('participants');

        return response()->json($this->formatSession($session, $request->user()->id));
    }

    /**
     * Créer une session.
     */
    public function store(StoreSessionRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['created_by'] = $request->user()->id;

        // is_template et is_published depuis request
        $data['is_template'] = $request->boolean('is_template', false);
        $data['published_at'] = $request->input('published_at');

        $session = TrainingSession::create($data);
        $session->loadCount('participants');

        return response()->json($this->formatSession($session, $request->user()->id), 201);
    }

    /**
     * Modifier une session.
     */
    public function update(UpdateSessionRequest $request, TrainingSession $session): JsonResponse
    {
        $session->update($request->validated());
        $session->loadCount('participants');

        return response()->json($this->formatSession($session, $request->user()->id));
    }

    /**
     * Supprimer une session.
     */
    public function destroy(Request $request, TrainingSession $session): JsonResponse
    {
        $user = $request->user();

        if (! $user->hasAnyRole(['admin', 'founder'])
            && ! ($user->hasRole('coach') && $session->created_by === $user->id)) {
            abort(403);
        }

        $session->delete();

        return response()->json(['message' => 'Session supprimée.']);
    }

    /**
     * Marquer / démarquer sa participation.
     */
    public function participate(Request $request, TrainingSession $session): JsonResponse
    {
        $user = $request->user();

        $alreadyParticipated = $session->participants()
            ->where('user_id', $user->id)
            ->exists();

        if ($alreadyParticipated) {
            $session->participants()->detach($user->id);
            $participated = false;
        } else {
            $session->participants()->attach($user->id, ['participated_at' => now()]);
            $participated = true;
        }

        $session->loadCount('participants');

        return response()->json([
            'has_participated' => $participated,
            'participants_count' => $session->participants_count,
        ]);
    }

    // -------------------------------------------------------------------------

    private function formatSession(TrainingSession $session, int $userId): array
    {
        return [
            'id' => $session->id,
            'title' => $session->title,
            'type' => $session->type,
            'distance_km' => $session->distance_km ? (float) $session->distance_km : null,
            'duration_min' => $session->duration_min,
            'intensity' => $session->intensity,
            'exercises' => $session->exercises ?? [],
            'description' => $session->description,
            'is_template' => $session->is_template,
            'created_by' => $session->created_by,
            'published_at' => $session->published_at?->toIso8601String(),
            'created_at' => $session->created_at->toIso8601String(),
            'participants_count' => $session->participants_count ?? 0,
            'has_participated' => $session->participants()
                ->where('user_id', $userId)
                ->exists(),
        ];
    }
}
