<?php

namespace App\Http\Requests\Event;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        $event = $this->route('event');
        $user  = $this->user();

        // Admin/founder peut tout modifier, bureau seulement ses propres events
        return $user->hasAnyRole(['admin', 'founder'])
            || ($user->hasRole('bureau') && $event->created_by === $user->id);
    }

    public function rules(): array
    {
        return [
            'title'       => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string', 'max:5000'],
            'type'        => ['sometimes', 'in:race,outing,competition,other'],
            'event_date'  => ['sometimes', 'date'],
            'location'    => ['sometimes', 'string', 'max:255'],
            'is_public'   => ['sometimes', 'boolean'],
        ];
    }
}
