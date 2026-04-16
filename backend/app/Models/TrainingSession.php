<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * @property-read Location|null $location
 */
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
        'location_id',
        'session_date',
    ];

    protected function casts(): array
    {
        return [
            'exercises' => 'array',
            'is_template' => 'boolean',
            'session_date' => 'datetime',
            'distance_km' => 'decimal:2',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'session_participations', 'session_id', 'user_id')
            ->withTimestamps()
            ->withPivot('participated_at');
    }
}
