<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin');
    }

    public function rules(): array
    {
        return [
            'role' => ['required', 'in:admin,founder,coach,bureau,member'],
        ];
    }

    public function messages(): array
    {
        return [
            'role.required' => 'Le rôle est obligatoire.',
            'role.in' => 'Rôle invalide. Valeurs acceptées : admin, founder, coach, bureau, member.',
        ];
    }
}
