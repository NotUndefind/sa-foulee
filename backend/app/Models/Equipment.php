<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Equipment extends Model
{
    protected $table = 'equipment';

    protected $fillable = [
        'created_by',
        'name',
        'category',
        'quantity',
        'status',
        'notes',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(EquipmentAssignment::class);
    }

    public function activeAssignments(): HasMany
    {
        return $this->hasMany(EquipmentAssignment::class)->whereNull('returned_at');
    }

    /** Nombre d'unités actuellement attribuées */
    public function assignedCount(): int
    {
        return $this->activeAssignments()->count();
    }

    /** Nombre d'unités disponibles */
    public function availableCount(): int
    {
        return max(0, $this->quantity - $this->assignedCount());
    }
}
