<?php

it('limite forgot-password à 6 requêtes par minute et par IP', function () {
    for ($i = 1; $i <= 6; $i++) {
        $this->postJson('/api/v1/auth/forgot-password', [
            'email' => "membre{$i}@example.com",
        ])->assertSuccessful();
    }

    // 7e tentative dans la même minute : throttle IP.
    $this->postJson('/api/v1/auth/forgot-password', [
        'email' => 'membre7@example.com',
    ])->assertStatus(429);
});
