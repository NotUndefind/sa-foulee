<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventPhoto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EventPhotoController extends Controller
{
    /**
     * GET /events/{event}/photos
     * Liste des photos d'un événement — accessible sans authentification.
     */
    public function index(Event $event): JsonResponse
    {
        $photos = $event->photos()->get();

        return response()->json($photos->map(fn ($photo) => [
            'id' => $photo->id,
            'url' => $photo->url,
            'uploaded_by' => $photo->uploaded_by,
            'created_at' => $photo->created_at->toIso8601String(),
        ]));
    }

    /**
     * POST /events/{event}/photos
     * Upload d'une photo. Réservé à admin, fondateur ou créateur de l'événement.
     */
    public function store(Request $request, Event $event): JsonResponse
    {
        $user = $request->user();

        // Authorization : admin, founder, ou créateur de l'événement
        if (! $user->hasAnyRole(['admin', 'founder']) && $event->created_by !== $user->id) {
            abort(403, 'Seuls les administrateurs, fondateurs ou créateurs peuvent ajouter des photos.');
        }

        // Limite de 20 photos par événement
        if ($event->photos()->count() >= 20) {
            return response()->json(['message' => 'Maximum 20 photos par événement.'], 422);
        }

        $request->validate([
            'photo' => ['required', 'image', 'mimes:jpg,jpeg,png,gif,webp', 'max:10240'],
        ]);

        $file = $request->file('photo');
        $extension = $file->getClientOriginalExtension();
        $filename = Str::uuid().'.'.$extension;
        $path = "event-photos/{$event->id}/{$filename}";

        Storage::disk(config('filesystems.default'))->putFileAs(
            "event-photos/{$event->id}",
            $file,
            $filename
        );

        $url = Storage::disk(config('filesystems.default'))->url($path);

        $photo = EventPhoto::create([
            'event_id' => $event->id,
            'uploaded_by' => $user->id,
            'r2_path' => $path,
            'url' => $url,
        ]);

        return response()->json([
            'id' => $photo->id,
            'url' => $photo->url,
            'uploaded_by' => $photo->uploaded_by,
            'created_at' => $photo->created_at->toIso8601String(),
        ], 201);
    }

    /**
     * DELETE /event-photos/{photo}
     * Supprime une photo — admin, fondateur, créateur de l'événement ou uploadeur.
     */
    public function destroy(Request $request, EventPhoto $photo): JsonResponse
    {
        $user = $request->user();
        $event = $photo->event;

        if (! $user->hasAnyRole(['admin', 'founder'])
            && $event->created_by !== $user->id
            && $photo->uploaded_by !== $user->id) {
            abort(403, 'Vous n\'avez pas le droit de supprimer cette photo.');
        }

        Storage::disk(config('filesystems.default'))->delete($photo->r2_path);
        $photo->delete();

        return response()->json(null, 204);
    }
}
