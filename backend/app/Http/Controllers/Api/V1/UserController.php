<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateRoleRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * GET /users — Liste paginée des membres (admin uniquement).
     * Paramètres : ?search=&role=&page=&per_page=
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::withTrashed(false) // exclure soft-deleted
            ->with('roles')
            ->orderBy('created_at', 'desc');

        // Recherche par nom ou email
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filtre par rôle
        if ($role = $request->query('role')) {
            $query->whereHas('roles', fn($q) => $q->where('name', $role));
        }

        $perPage = min((int) $request->query('per_page', 20), 100);
        $users   = $query->paginate($perPage);

        return response()->json([
            'data' => collect($users->items())->map(fn($u) => $this->formatUser($u)),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page'    => $users->lastPage(),
                'per_page'     => $users->perPage(),
                'total'        => $users->total(),
            ],
        ]);
    }

    /**
     * GET /users/{user} — Détail d'un membre.
     */
    public function show(User $user): JsonResponse
    {
        $user->load(['roles', 'documents']);

        return response()->json(array_merge(
            $this->formatUser($user),
            [
                'document_completion'    => $user->documentCompletion(),
                'has_complete_documents' => $user->hasCompleteDocuments(),
                'documents'              => $user->documents->map(fn($d) => [
                    'id'         => $d->id,
                    'type'       => $d->type,
                    'filename'   => $d->filename,
                    'status'     => $d->isExpired() ? 'expired' : $d->status,
                    'expires_at' => $d->expires_at?->toDateString(),
                ]),
            ]
        ));
    }

    /**
     * PATCH /users/{user}/role — Changer le rôle d'un membre.
     * Un admin ne peut pas modifier son propre rôle.
     */
    public function updateRole(UpdateRoleRequest $request, User $user): JsonResponse
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Vous ne pouvez pas modifier votre propre rôle.'], 422);
        }

        // Spatie : retirer tous les rôles actuels et assigner le nouveau
        $user->syncRoles([$request->role]);

        return response()->json($this->formatUser($user->fresh()->load('roles')));
    }

    /**
     * DELETE /users/{user} — Soft-delete d'un membre.
     * Un admin ne peut pas supprimer son propre compte depuis ici.
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Utilisez /me pour supprimer votre propre compte.'], 422);
        }

        // Révoquer les tokens Sanctum
        $user->tokens()->delete();

        // Soft delete
        $user->delete();

        return response()->json(null, 204);
    }

    /**
     * GET /users/export — Export CSV des membres (admin).
     * Implémenté dans une story future si nécessaire.
     */
    public function export(): JsonResponse
    {
        return response()->json(['message' => 'Export non encore implémenté.'], 501);
    }

    // ---- Helper ----

    private function formatUser(User $user): array
    {
        return [
            'id'            => $user->id,
            'first_name'    => $user->first_name,
            'last_name'     => $user->last_name,
            'email'         => $user->email,
            'avatar'        => $user->avatar,
            'roles'         => $user->getRoleNames(),
            'email_verified_at' => $user->email_verified_at,
            'created_at'    => $user->created_at,
        ];
    }
}
