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

    /** Génère une URL d'accès valable 15 minutes (signée sur R2, directe en local) */
    public function getSignedUrl(): string
    {
        $disk = Storage::disk(config('filesystems.default'));

        try {
            return $disk->temporaryUrl($this->r2_path, now()->addMinutes(15));
        } catch (\RuntimeException) {
            // Le disque local ne supporte pas temporaryUrl — URL directe
            return $disk->url($this->r2_path);
        }
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }
}
