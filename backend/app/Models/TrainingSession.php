<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class TrainingSession extends Model
{
    protected $fillable = [
        'title',
        'type',
        'distance_km',
        'duration_min',
        'intensity',
        'exercises',
        'description',
        'is_template',
        'created_by',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'exercises' => 'array',
            'is_template' => 'boolean',
            'published_at' => 'datetime',
            'distance_km' => 'decimal:2',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'session_participations')
            ->withTimestamps()
            ->withPivot('participated_at');
    }

    public function isPublished(): bool
    {
        return $this->published_at !== null && $this->published_at->isPast();
    }
}
