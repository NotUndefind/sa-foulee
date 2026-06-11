<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NewsletterCampaign extends Model
{
    protected $fillable = [
        'created_by',
        'subject',
        'body_html',
        'queued_at',
        'batch_id',
        'sent_at',
        'recipient_count',
    ];

    protected function casts(): array
    {
        return [
            'queued_at' => 'datetime',
            'sent_at' => 'datetime',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function isSent(): bool
    {
        return $this->sent_at !== null;
    }

    /**
     * La campagne a été mise en file mais son envoi n'est pas encore confirmé
     * terminé. Dans cet état, on bloque toute modification et tout réenvoi.
     */
    public function isQueued(): bool
    {
        return $this->queued_at !== null && $this->sent_at === null;
    }
}
