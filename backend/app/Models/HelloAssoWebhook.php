<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HelloAssoWebhook extends Model
{
    protected $fillable = [
        'event_type',
        'payer_email',
        'amount',
        'order_id',
        'status',
        'payload',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
        ];
    }
}
