<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Event extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'type',
        'event_date',
        'location',
        'created_by',
        'is_public',
    ];

    protected function casts(): array
    {
        return [
            'event_date' => 'datetime',
            'is_public' => 'boolean',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'event_registrations')
            ->withTimestamps()
            ->withPivot('registered_at');
    }

    public function isRegistered(int $userId): bool
    {
        return $this->participants()->where('user_id', $userId)->exists();
    }
}
