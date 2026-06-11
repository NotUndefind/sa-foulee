<?php

use App\Models\Post;
use App\Models\User;

it("interdit à un coach de supprimer le post d'un autre auteur", function () {
    $author = User::factory()->create();
    $author->assignRole('bureau');
    $coach = User::factory()->create();
    $coach->assignRole('coach');

    $post = Post::factory()->create(['author_id' => $author->id]);

    $this->actingAs($coach)
        ->deleteJson("/api/v1/posts/{$post->id}")
        ->assertStatus(403);
});

it('autorise un coach à supprimer son propre post', function () {
    $coach = User::factory()->create();
    $coach->assignRole('coach');

    $post = Post::factory()->create(['author_id' => $coach->id]);

    $this->actingAs($coach)
        ->deleteJson("/api/v1/posts/{$post->id}")
        ->assertOk();
});

it("interdit à un coach d'épingler un post", function () {
    $coach = User::factory()->create();
    $coach->assignRole('coach');

    $post = Post::factory()->create(['author_id' => $coach->id]);

    $this->actingAs($coach)
        ->patchJson("/api/v1/posts/{$post->id}/pin")
        ->assertStatus(403);
});

it('autorise un admin à épingler un post', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $post = Post::factory()->create();

    $this->actingAs($admin)
        ->patchJson("/api/v1/posts/{$post->id}/pin")
        ->assertOk()
        ->assertJsonPath('is_pinned', true);
});

it("interdit à un bureau de modifier le post d'un autre auteur", function () {
    $author = User::factory()->create();
    $author->assignRole('coach');
    $bureau = User::factory()->create();
    $bureau->assignRole('bureau');

    $post = Post::factory()->create(['author_id' => $author->id]);

    $this->actingAs($bureau)
        ->patchJson("/api/v1/posts/{$post->id}", ['title' => 'Titre modifié'])
        ->assertStatus(403);
});
