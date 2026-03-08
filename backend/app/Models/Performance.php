<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Performance extends Model
{
    protected $fillable = [
        'user_id',
        'strava_activity_id',
        'distance_km',
        'duration_sec',
        'elevation_m',
        'date',
        'source',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'distance_km' => 'decimal:3',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Durée formatée mm:ss/km ou hh:mm */
    public function getFormattedDurationAttribute(): string
    {
        $hours = intdiv($this->duration_sec, 3600);
        $minutes = intdiv($this->duration_sec % 3600, 60);
        $seconds = $this->duration_sec % 60;

        if ($hours > 0) {
            return sprintf('%dh%02d', $hours, $minutes);
        }

        return sprintf('%d:%02d', $minutes, $seconds);
    }
}
