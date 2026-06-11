<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Post extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'content',
        'image',
        'author_id',
        'is_pinned',
        'published_at',
    ];

    protected static function booted(): void
    {
        // Slug généré depuis le titre, suffixé si collision (soft-deleted inclus
        // pour respecter l'index unique).
        static::creating(function (Post $post) {
            if (empty($post->slug)) {
                $base = Str::slug($post->title) ?: 'article';
                $slug = $base;
                $n = 2;
                while (static::withTrashed()->where('slug', $slug)->exists()) {
                    $slug = "{$base}-{$n}";
                    $n++;
                }
                $post->slug = $slug;
            }
        });
    }

    protected function casts(): array
    {
        return [
            'is_pinned' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function isPublished(): bool
    {
        return $this->published_at !== null && $this->published_at->isPast();
    }

    /** Scope pour les posts publiés uniquement */
    public function scopePublished($query)
    {
        return $query->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    /** Scope pour afficher les épinglés en premier */
    public function scopeOrderedFeed($query)
    {
        return $query->orderByDesc('is_pinned')
            ->orderByDesc('published_at');
    }
}
