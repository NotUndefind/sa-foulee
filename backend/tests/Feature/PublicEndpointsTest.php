<?php

use App\Models\Post;

it('expose la liste des articles publiés sans authentification', function () {
    Post::factory()->count(2)->create();
    Post::factory()->draft()->create();

    $this->getJson('/api/v1/posts')->assertOk();
});
