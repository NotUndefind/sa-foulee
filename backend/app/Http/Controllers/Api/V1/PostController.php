<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Post\StorePostRequest;
use App\Http\Requests\Post\UpdatePostRequest;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PostController extends Controller
{
    /**
     * Liste des posts publiés (public).
     */
    public function index(Request $request): JsonResponse
    {
        $posts = Post::published()
            ->orderedFeed()
            ->withCount('comments')
            ->with('author:id,first_name,last_name')
            ->paginate(10);

        return response()->json([
            'data' => $posts->map(fn(Post $p) => $this->formatPost($p)),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page'    => $posts->lastPage(),
                'total'        => $posts->total(),
                'per_page'     => $posts->perPage(),
            ],
        ]);
    }

    /**
     * Détail d'un post (public).
     */
    public function show(Post $post): JsonResponse
    {
        if (! $post->isPublished()) {
            abort(404);
        }

        $post->loadCount('comments')->load('author:id,first_name,last_name');

        return response()->json($this->formatPost($post));
    }

    /**
     * Créer un post.
     */
    public function store(StorePostRequest $request): JsonResponse
    {
        $data                = $request->validated();
        $data['author_id']   = $request->user()->id;
        $data['is_pinned']   = $request->boolean('is_pinned', false);

        $post = Post::create($data);
        $post->loadCount('comments')->load('author:id,first_name,last_name');

        return response()->json($this->formatPost($post), 201);
    }

    /**
     * Modifier un post.
     */
    public function update(UpdatePostRequest $request, Post $post): JsonResponse
    {
        $post->update($request->validated());
        $post->loadCount('comments')->load('author:id,first_name,last_name');

        return response()->json($this->formatPost($post));
    }

    /**
     * Supprimer un post.
     */
    public function destroy(Request $request, Post $post): JsonResponse
    {
        $user = $request->user();

        if (! $user->hasAnyRole(['admin', 'founder'])
            && $post->author_id !== $user->id) {
            abort(403);
        }

        $post->delete();

        return response()->json(['message' => 'Post supprimé.']);
    }

    /**
     * Épingler / désépingler un post (admin/founder uniquement).
     */
    public function pin(Request $request, Post $post): JsonResponse
    {
        if (! $request->user()->hasAnyRole(['admin', 'founder'])) {
            abort(403);
        }

        $post->update(['is_pinned' => ! $post->is_pinned]);

        return response()->json(['is_pinned' => $post->is_pinned]);
    }

    // -------------------------------------------------------------------------

    private function formatPost(Post $post): array
    {
        return [
            'id'             => $post->id,
            'title'          => $post->title,
            'content'        => $post->content,
            'image'          => $post->image,
            'is_pinned'      => $post->is_pinned,
            'published_at'   => $post->published_at?->toIso8601String(),
            'created_at'     => $post->created_at->toIso8601String(),
            'comments_count' => $post->comments_count ?? 0,
            'author'         => $post->author ? [
                'id'   => $post->author->id,
                'name' => "{$post->author->first_name} {$post->author->last_name}",
            ] : null,
        ];
    }
}
