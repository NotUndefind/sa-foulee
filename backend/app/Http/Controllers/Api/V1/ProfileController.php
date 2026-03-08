<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\UpdateProfileRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * GET /me — Retourne l'utilisateur connecté avec ses rôles.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user()->load('documents');

        return response()->json($this->formatUser($user));
    }

    /**
     * PATCH /me — Met à jour le profil.
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        // Upload avatar vers R2 si présent
        if ($request->hasFile('avatar')) {
            // Supprimer l'ancien avatar si existant
            if ($user->avatar) {
                Storage::disk('r2')->delete($user->avatar);
            }

            $path = $request->file('avatar')->store(
                "avatars/{$user->id}",
                'r2'
            );
            $data['avatar'] = $path;
        }

        $user->update($data);

        return response()->json($this->formatUser($user->fresh()->load('documents')));
    }

    /**
     * DELETE /me — Supprime le compte (soft delete + révocation tokens).
     */
    public function destroy(Request $request): JsonResponse
    {
        $user = $request->user();

        // Révoquer tous les tokens Sanctum
        $user->tokens()->delete();

        // Soft delete
        $user->delete();

        return response()->json(['message' => 'Compte supprimé avec succès.']);
    }

    // ---- Helper ----

    private function formatUser($user): array
    {
        return [
            'id'                     => $user->id,
            'first_name'             => $user->first_name,
            'last_name'              => $user->last_name,
            'email'                  => $user->email,
            'avatar'                 => $user->avatar
                ? Storage::disk('r2')->temporaryUrl($user->avatar, now()->addHour())
                : null,
            'bio'                    => $user->bio,
            'roles'                  => $user->getRoleNames(),
            'has_complete_documents' => $user->hasCompleteDocuments(),
            'document_completion'    => $user->documentCompletion(),
            'email_verified_at'      => $user->email_verified_at,
            'created_at'             => $user->created_at,
        ];
    }
}
