<?php

namespace Database\Factories;

use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Post>
 */
class PostFactory extends Factory
{
    protected $model = Post::class;

    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(),
            'content' => '<p>'.$this->faker->paragraph().'</p>',
            'author_id' => User::factory(),
            'is_pinned' => false,
            'published_at' => now(),
        ];
    }

    /**
     * Brouillon non publié (invisible publiquement).
     */
    public function draft(): static
    {
        return $this->state(fn () => ['published_at' => null]);
    }
}
