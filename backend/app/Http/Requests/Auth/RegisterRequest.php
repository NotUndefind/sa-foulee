<?php

namespace App\Http\Requests\Auth;

use App\Rules\PasswordPolicy;
use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:50'],
            'last_name' => ['required', 'string', 'max:50'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => [
                'required',
                'string',
                new PasswordPolicy,
                'confirmed',
            ],
            'consent' => ['required', 'accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required' => 'Le prénom est obligatoire.',
            'first_name.max' => 'Le prénom ne peut pas dépasser 50 caractères.',
            'last_name.required' => 'Le nom est obligatoire.',
            'last_name.max' => 'Le nom ne peut pas dépasser 50 caractères.',
            'email.required' => "L'adresse e-mail est obligatoire.",
            'email.email' => "L'adresse e-mail n'est pas valide.",
            'email.unique' => 'Cette adresse e-mail est déjà utilisée.',
            'password.required' => 'Le mot de passe est obligatoire.',
            'password.confirmed' => 'La confirmation du mot de passe ne correspond pas.',
            'consent.required' => "Vous devez accepter les conditions d'utilisation.",
            'consent.accepted' => "Vous devez accepter les conditions d'utilisation.",
        ];
    }
}
