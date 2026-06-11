<?php

use App\Models\Post;

it('génère automatiquement un slug unique à la création', function () {
    $a = Post::factory()->create(['title' => 'Sortie du dimanche']);
    $b = Post::factory()->create(['title' => 'Sortie du dimanche']);

    expect($a->slug)->toBe('sortie-du-dimanche');
    expect($b->slug)->toBe('sortie-du-dimanche-2');
});

it('expose un article publié via son slug', function () {
    $post = Post::factory()->create(['title' => 'Cross de la Neuville']);

    $this->getJson("/api/v1/posts/slug/{$post->slug}")
        ->assertOk()
        ->assertJsonPath('slug', $post->slug)
        ->assertJsonPath('title', 'Cross de la Neuville');
});

it('renvoie 404 pour un brouillon accédé par slug', function () {
    $draft = Post::factory()->draft()->create(['title' => 'Brouillon secret']);

    $this->getJson("/api/v1/posts/slug/{$draft->slug}")->assertStatus(404);
});
