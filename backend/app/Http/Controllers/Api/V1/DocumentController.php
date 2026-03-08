<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Document\StoreDocumentRequest;
use App\Models\User;
use App\Models\UserDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentController extends Controller
{
    /**
     * GET /users/{user}/documents
     * Un membre voit ses propres documents. Un admin voit ceux de n'importe qui.
     */
    public function index(Request $request, User $user): JsonResponse
    {
        $this->authorizeAccess($request, $user);

        $documents = $user->documents()->orderBy('created_at', 'desc')->get();

        return response()->json($documents->map(fn($doc) => $this->formatDocument($doc)));
    }

    /**
     * POST /users/{user}/documents
     * Upload d'un document vers Cloudflare R2.
     */
    public function store(StoreDocumentRequest $request, User $user): JsonResponse
    {
        $this->authorizeAccess($request, $user);

        $file = $request->file('file');
        $extension = $file->getClientOriginalExtension();
        $filename  = $request->type . '_' . Str::uuid() . '.' . $extension;
        $path      = "documents/{$user->id}/{$filename}";

        // Upload vers R2
        Storage::disk('r2')->putFileAs(
            "documents/{$user->id}",
            $file,
            $filename
        );

        $document = $user->documents()->create([
            'type'       => $request->type,
            'filename'   => $file->getClientOriginalName(),
            'r2_path'    => $path,
            'status'     => 'pending',
            'expires_at' => $request->expires_at,
        ]);

        return response()->json($this->formatDocument($document), 201);
    }

    /**
     * GET /documents/{document}/download
     * Retourne une URL signée R2 valide 15 minutes.
     */
    public function download(Request $request, UserDocument $document): JsonResponse
    {
        $this->authorizeAccess($request, $document->user);

        return response()->json([
            'url'        => $document->getSignedUrl(),
            'expires_at' => now()->addMinutes(15)->toIso8601String(),
        ]);
    }

    /**
     * DELETE /documents/{document}
     * Supprime le fichier dans R2 et l'enregistrement en BDD.
     */
    public function destroy(Request $request, UserDocument $document): JsonResponse
    {
        $this->authorizeAccess($request, $document->user);

        Storage::disk('r2')->delete($document->r2_path);
        $document->delete();

        return response()->json(null, 204);
    }

    // ---- Helpers ----

    /**
     * Un membre ne peut accéder qu'à ses propres documents.
     * Un admin peut accéder à ceux de tous les membres.
     */
    private function authorizeAccess(Request $request, User $owner): void
    {
        $currentUser = $request->user();

        if ($currentUser->id !== $owner->id && ! $currentUser->hasRole('admin')) {
            abort(403, 'Accès refusé.');
        }
    }

    private function formatDocument(UserDocument $doc): array
    {
        return [
            'id'         => $doc->id,
            'type'       => $doc->type,
            'filename'   => $doc->filename,
            'status'     => $doc->isExpired() ? 'expired' : $doc->status,
            'expires_at' => $doc->expires_at?->toDateString(),
            'created_at' => $doc->created_at,
        ];
    }
}
