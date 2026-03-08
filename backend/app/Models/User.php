<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasRoles, Notifiable, SoftDeletes;

    protected $fillable = [
        'email',
        'password',
        'first_name',
        'last_name',
        'avatar',
        'bio',
        'consent_given_at',
    ];

    protected $hidden = [
        'password',
        'strava_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'consent_given_at' => 'datetime',
            'strava_token' => 'encrypted', // Chiffrement AES-256 via APP_KEY
        ];
    }

    // ---- Relations ----

    public function documents(): HasMany
    {
        return $this->hasMany(UserDocument::class);
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class, 'author_id');
    }

    public function performances(): HasMany
    {
        return $this->hasMany(Performance::class);
    }

    public function notificationPreferences(): HasMany
    {
        return $this->hasMany(NotificationPreference::class);
    }

    // ---- Password Reset ----

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new \App\Notifications\PasswordResetNotification($token));
    }

    // ---- Helpers ----

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function hasCompleteDocuments(): bool
    {
        if ($this->hasAnyRole(['admin', 'founder'])) {
            return true;
        }

        $required = ['license', 'registration', 'medical_certificate'];
        $uploaded = $this->documents()->whereIn('type', $required)->pluck('type')->toArray();

        return count(array_diff($required, $uploaded)) === 0;
    }

    public function documentCompletion(): int
    {
        if ($this->hasAnyRole(['admin', 'founder'])) {
            return 100;
        }

        $required = ['license', 'registration', 'medical_certificate'];
        $uploaded = $this->documents()->whereIn('type', $required)->count();

        return (int) round(($uploaded / count($required)) * 100);
    }
}
