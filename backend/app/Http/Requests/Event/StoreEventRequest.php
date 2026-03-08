<?php

namespace App\Http\Requests\Event;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['admin', 'founder', 'bureau']);
    }

    public function rules(): array
    {
        return [
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:5000'],
            'type'        => ['required', 'in:race,outing,competition,other'],
            'event_date'  => ['required', 'date', 'after:now'],
            'location'    => ['required', 'string', 'max:255'],
            'is_public'   => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required'      => 'Le titre est obligatoire.',
            'description.required'=> 'La description est obligatoire.',
            'type.required'       => 'Le type d\'événement est obligatoire.',
            'type.in'             => 'Le type doit être : course, sortie, compétition ou autre.',
            'event_date.required' => 'La date est obligatoire.',
            'event_date.after'    => 'La date doit être dans le futur.',
            'location.required'   => 'Le lieu est obligatoire.',
        ];
    }
}
