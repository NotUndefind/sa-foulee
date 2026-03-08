<?php

namespace App\Http\Requests\Post;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $post = $this->route('post');

        // Admin/founder peuvent modifier tous les posts
        if ($user->hasAnyRole(['admin', 'founder'])) {
            return true;
        }

        // Coach/bureau uniquement leurs propres posts
        return $user->hasAnyRole(['coach', 'bureau']) && $post->author_id === $user->id;
    }

    public function rules(): array
    {
        return [
            'title'        => ['sometimes', 'string', 'max:255'],
            'content'      => ['sometimes', 'string'],
            'image'        => ['nullable', 'url', 'max:500'],
            'published_at' => ['nullable', 'date'],
            'is_pinned'    => ['nullable', 'boolean'],
        ];
    }
}
