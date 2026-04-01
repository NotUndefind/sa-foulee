<?php

namespace App\Http\Requests\Performance;

use Illuminate\Foundation\Http\FormRequest;

class StorePerformanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Tous les membres connectés
    }

    public function rules(): array
    {
        return [
            'distance_km' => ['required', 'numeric', 'min:0.01', 'max:500'],
            'duration_sec' => ['required', 'integer', 'min:1', 'max:86400'],
            'elevation_m' => ['nullable', 'integer', 'min:0'],
            'date' => ['required', 'date', 'before_or_equal:today'],
        ];
    }
}
