<?php

use App\Models\Post;
use App\Models\User;

it('purge le HTML malveillant du contenu à la création', function () {
    $author = User::factory()->create();
    $author->assignRole('founder');

    $payload = [
        'title' => 'Article test',
        'content' => '<p>Bonjour</p><script>alert(1)</script><img src=x onerror="alert(2)">',
    ];

    $this->actingAs($author)
        ->postJson('/api/v1/posts', $payload)
        ->assertStatus(201);

    $stored = Post::latest('id')->first()->content;

    expect($stored)->not->toContain('<script>');
    expect($stored)->not->toContain('onerror');
    expect($stored)->toContain('Bonjour');
});
