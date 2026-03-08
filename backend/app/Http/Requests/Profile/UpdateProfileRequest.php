<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['sometimes', 'string', 'max:50'],
            'last_name'  => ['sometimes', 'string', 'max:50'],
            'bio'        => ['sometimes', 'nullable', 'string', 'max:500'],
            'avatar'     => ['sometimes', 'nullable', 'image', 'max:2048'], // 2 Mo max
            'email'      => [
                'sometimes',
                'email',
                Rule::unique('users', 'email')->ignore($this->user()->id),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.max' => 'Le prénom ne peut pas dépasser 50 caractères.',
            'last_name.max'  => 'Le nom ne peut pas dépasser 50 caractères.',
            'bio.max'        => 'La bio ne peut pas dépasser 500 caractères.',
            'avatar.image'   => "L'avatar doit être une image (JPG, PNG, WEBP).",
            'avatar.max'     => "L'avatar ne peut pas dépasser 2 Mo.",
            'email.email'    => "L'adresse e-mail n'est pas valide.",
            'email.unique'   => 'Cette adresse e-mail est déjà utilisée.',
        ];
    }
}
