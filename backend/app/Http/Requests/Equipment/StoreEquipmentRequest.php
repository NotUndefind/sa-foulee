<?php

namespace App\Http\Requests\Equipment;

use Illuminate\Foundation\Http\FormRequest;

class StoreEquipmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['admin', 'founder', 'bureau']);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'in:dossard,maillot,materiel,autre'],
            'quantity' => ['required', 'integer', 'min:1'],
            'status' => ['required', 'string', 'in:good,worn,broken'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Le nom est obligatoire.',
            'name.max' => 'Le nom ne peut pas dépasser 255 caractères.',
            'category.required' => 'La catégorie est obligatoire.',
            'category.in' => 'Catégorie invalide.',
            'quantity.required' => 'La quantité est obligatoire.',
            'quantity.integer' => 'La quantité doit être un nombre entier.',
            'quantity.min' => 'La quantité minimale est 1.',
            'status.required' => 'L\'état est obligatoire.',
            'status.in' => 'État invalide (bon état, usé ou hors service).',
            'notes.max' => 'Les notes ne peuvent pas dépasser 1000 caractères.',
        ];
    }
}
