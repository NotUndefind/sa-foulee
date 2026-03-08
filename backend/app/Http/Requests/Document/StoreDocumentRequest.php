<?php

namespace App\Http\Requests\Document;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', 'in:license,registration,medical_certificate,other'],
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png,webp', 'max:5120'], // 5 Mo
            'expires_at' => ['sometimes', 'nullable', 'date', 'after:today'],
        ];
    }

    public function messages(): array
    {
        return [
            'type.required' => 'Le type de document est obligatoire.',
            'type.in'       => 'Type de document invalide.',
            'file.required' => 'Le fichier est obligatoire.',
            'file.file'     => 'Le fichier est invalide.',
            'file.mimes'    => 'Formats acceptés : PDF, JPG, PNG, WEBP.',
            'file.max'      => 'Le fichier ne peut pas dépasser 5 Mo.',
            'expires_at.date'  => "La date d'expiration n'est pas valide.",
            'expires_at.after' => "La date d'expiration doit être dans le futur.",
        ];
    }
}
