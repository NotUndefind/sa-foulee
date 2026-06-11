<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;

/**
 * Autorisations du blog. Centralise les règles auparavant dupliquées entre
 * UpdatePostRequest::authorize() et les checks inline du controller.
 * Le middleware role:admin|founder|coach|bureau filtre déjà l'accès aux routes.
 */
class PostPolicy
{
    /**
     * Modifier : admin/founder partout, coach/bureau sur leurs propres posts.
     */
    public function update(User $user, Post $post): bool
    {
        if ($user->hasAnyRole(['admin', 'founder'])) {
            return true;
        }

        return $user->hasAnyRole(['coach', 'bureau']) && $post->author_id === $user->id;
    }

    /**
     * Supprimer : admin/founder partout, sinon uniquement l'auteur.
     */
    public function delete(User $user, Post $post): bool
    {
        return $user->hasAnyRole(['admin', 'founder']) || $post->author_id === $user->id;
    }

    /**
     * Épingler : admin/founder uniquement.
     */
    public function pin(User $user, Post $post): bool
    {
        return $user->hasAnyRole(['admin', 'founder']);
    }
}
