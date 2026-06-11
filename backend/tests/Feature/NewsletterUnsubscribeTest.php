<?php

use App\Models\User;
use Illuminate\Support\Str;

it('désabonne un membre via son token et invalide le lien', function () {
    $token = Str::random(64);
    $user = User::factory()->create([
        'newsletter_subscribed_at' => now(),
        'newsletter_unsubscribe_token' => $token,
    ]);

    $this->postJson('/api/v1/newsletter/unsubscribe', ['token' => $token])
        ->assertOk();

    $user->refresh();
    expect($user->newsletter_subscribed_at)->toBeNull();
    expect($user->newsletter_unsubscribe_token)->toBeNull();
});

it('renvoie 404 pour un token de désabonnement inconnu', function () {
    $this->postJson('/api/v1/newsletter/unsubscribe', [
        'token' => Str::random(64),
    ])->assertStatus(404);
});
