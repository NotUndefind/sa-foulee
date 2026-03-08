<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class UserDocument extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'filename',
        'r2_path',
        'status',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Génère une URL signée R2 valable 15 minutes */
    public function getSignedUrl(): string
    {
        return Storage::disk('r2')->temporaryUrl(
            $this->r2_path,
            now()->addMinutes(15)
        );
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }
}
