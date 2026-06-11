<?php

use App\Models\User;

it('inscrit un nouveau membre et renvoie un token', function () {
    $response = $this->postJson('/api/v1/auth/register', [
        'first_name' => 'Alice',
        'last_name' => 'Martin',
        'email' => 'alice@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
        'consent' => true,
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure(['user' => ['id', 'email'], 'token']);

    $user = User::where('email', 'alice@example.com')->first();
    expect($user)->not->toBeNull();
    expect($user->hasRole('member'))->toBeTrue();
});

it('connecte un membre avec des identifiants valides', function () {
    User::factory()->create([
        'email' => 'bob@example.com',
        'password' => bcrypt('Password123!'),
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'bob@example.com',
        'password' => 'Password123!',
    ]);

    $response->assertOk()->assertJsonStructure(['user', 'token']);
});

it('refuse la connexion avec un mauvais mot de passe', function () {
    User::factory()->create([
        'email' => 'bob@example.com',
        'password' => bcrypt('Password123!'),
    ]);

    $this->postJson('/api/v1/auth/login', [
        'email' => 'bob@example.com',
        'password' => 'mauvais',
    ])->assertStatus(422);
});
