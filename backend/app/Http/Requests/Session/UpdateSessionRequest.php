<?php

namespace App\Http\Requests\Session;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        $session = $this->route('session');
        $user = $this->user();

        return $user->hasAnyRole(['admin', 'founder'])
            || ($user->hasRole('coach') && $session->created_by === $user->id);
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'type' => ['sometimes', 'in:running,interval,fartlek,recovery,strength,other'],
            'distance_km' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'duration_min' => ['nullable', 'integer', 'min:1', 'max:1440'],
            'intensity' => ['sometimes', 'in:low,medium,high'],
            'exercises' => ['nullable', 'array'],
            'exercises.*.name' => ['required_with:exercises', 'string', 'max:255'],
            'exercises.*.sets' => ['nullable', 'integer', 'min:1'],
            'exercises.*.reps' => ['nullable', 'integer', 'min:1'],
            'exercises.*.duration' => ['nullable', 'integer', 'min:1'],
            'exercises.*.rest' => ['nullable', 'integer', 'min:0'],
            'description' => ['nullable', 'string', 'max:10000'],
            'is_template' => ['sometimes', 'boolean'],
            'published_at' => ['nullable', 'date'],
        ];
    }
}
