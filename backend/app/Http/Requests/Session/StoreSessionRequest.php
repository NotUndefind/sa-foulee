<?php

namespace App\Http\Requests\Session;

use Illuminate\Foundation\Http\FormRequest;

class StoreSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['admin', 'founder', 'coach']);
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:running,interval,fartlek,recovery,strength,other'],
            'distance_km' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'duration_min' => ['nullable', 'integer', 'min:1', 'max:1440'],
            'intensity' => ['required', 'in:low,medium,high'],
            'exercises' => ['nullable', 'array'],
            'exercises.*.name' => ['required_with:exercises', 'string', 'max:255'],
            'exercises.*.sets' => ['nullable', 'integer', 'min:1'],
            'exercises.*.reps' => ['nullable', 'integer', 'min:1'],
            'exercises.*.duration' => ['nullable', 'integer', 'min:1'],
            'exercises.*.rest' => ['nullable', 'integer', 'min:0'],
            'description' => ['nullable', 'string', 'max:10000'],
            'is_template' => ['boolean'],
            'published_at' => ['nullable', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Le titre est obligatoire.',
            'type.required' => 'Le type de session est obligatoire.',
            'type.in' => 'Type invalide.',
            'intensity.required' => 'L\'intensité est obligatoire.',
            'intensity.in' => 'Intensité invalide (faible, moyenne, élevée).',
            'exercises.*.name.required_with' => 'Chaque exercice doit avoir un nom.',
        ];
    }
}
