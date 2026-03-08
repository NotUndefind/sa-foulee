<?php

namespace App\Http\Requests\Post;

use Illuminate\Foundation\Http\FormRequest;

class StorePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['admin', 'founder', 'coach', 'bureau']);
    }

    public function rules(): array
    {
        return [
            'title'        => ['required', 'string', 'max:255'],
            'content'      => ['required', 'string'],
            'image'        => ['nullable', 'url', 'max:500'],
            'published_at' => ['nullable', 'date'],
            'is_pinned'    => ['nullable', 'boolean'],
        ];
    }
}
