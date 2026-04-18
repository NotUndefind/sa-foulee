<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    /**
     * Liste des commentaires d'un post (public).
     */
    public function index(Post $post): JsonResponse
    {
        if (! $post->isPublished()) {
            abort(404);
        }

        $comments = $post->comments()
            ->with('user:id,first_name,last_name')
            ->orderBy('created_at')
            ->paginate(20);

        return response()->json([
            'data' => $comments->map(fn (Comment $c) => $this->formatComment($c)),
            'meta' => [
                'current_page' => $comments->currentPage(),
                'last_page' => $comments->lastPage(),
                'total' => $comments->total(),
            ],
        ]);
    }

    /**
     * Ajouter un commentaire.
     */
    public function store(Request $request, Post $post): JsonResponse
    {
        if (! $post->isPublished()) {
            abort(404);
        }

        $data = $request->validate([
            'content' => ['required', 'string', 'max:2000'],
        ]);

        $comment = $post->comments()->create([
            'user_id' => $request->user()->id,
            'content' => $data['content'],
        ]);

        $comment->load('user:id,first_name,last_name');

        return response()->json($this->formatComment($comment), 201);
    }

    /**
     * Supprimer un commentaire.
     */
    public function destroy(Request $request, Comment $comment): JsonResponse
    {
        $user = $request->user();

        if (! $user->hasAnyRole(['admin', 'founder'])
            && $comment->user_id !== $user->id) {
            abort(403);
        }

        $comment->delete();

        return response()->json(['message' => 'Commentaire supprimé.']);
    }

    // -------------------------------------------------------------------------

    private function formatComment(Comment $comment): array
    {
        return [
            'id' => $comment->id,
            'content' => $comment->content,
            'created_at' => $comment->created_at->toIso8601String(),
            'user' => $comment->user ? [
                'id' => $comment->user->id,
                'name' => "{$comment->user->first_name} {$comment->user->last_name}",
            ] : null,
        ];
    }
}
