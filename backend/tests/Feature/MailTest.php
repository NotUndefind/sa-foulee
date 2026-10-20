<?php

use App\Models\User;
use App\Notifications\PasswordResetNotification;
use App\Notifications\WelcomeNotification;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;

beforeEach(function () {
    config(['app.frontend_url' => 'https://dev.example.fr']);
});

it('envoie un lien de réinitialisation pointant vers le front configuré', function () {
    Notification::fake();
    $user = User::factory()->create(['email' => 'alice@example.com']);

    $this->postJson('/api/v1/auth/forgot-password', ['email' => 'alice@example.com'])
        ->assertOk();

    Notification::assertSentTo($user, PasswordResetNotification::class, function ($notification) use ($user) {
        $url = $notification->toMail($user)->actionUrl;

        return str_starts_with($url, 'https://dev.example.fr/reinitialiser-mot-de-passe?')
            && str_contains($url, 'token=')
            && str_contains($url, 'email=alice%40example.com');
    });
});

it('ne révèle pas si le compte existe et n\'envoie rien', function () {
    Notification::fake();

    $this->postJson('/api/v1/auth/forgot-password', ['email' => 'inconnu@example.com'])
        ->assertOk();

    Notification::assertNothingSent();
});

it('réinitialise le mot de passe avec un jeton valide', function () {
    $user = User::factory()->create(['email' => 'alice@example.com']);
    $token = Password::createToken($user);

    $this->postJson('/api/v1/auth/reset-password', [
        'email' => 'alice@example.com',
        'token' => $token,
        'password' => 'NouveauPass123!',
        'password_confirmation' => 'NouveauPass123!',
    ])->assertOk();

    expect(Hash::check('NouveauPass123!', $user->fresh()->password))->toBeTrue();
});

it('refuse un jeton de réinitialisation invalide', function () {
    User::factory()->create(['email' => 'alice@example.com']);

    $this->postJson('/api/v1/auth/reset-password', [
        'email' => 'alice@example.com',
        'token' => 'faux-jeton',
        'password' => 'NouveauPass123!',
        'password_confirmation' => 'NouveauPass123!',
    ])->assertStatus(422);
});

it('envoie le mail de bienvenue avec un lien vers le front configuré', function () {
    Notification::fake();

    $this->postJson('/api/v1/auth/register', [
        'first_name' => 'Alice',
        'last_name' => 'Martin',
        'email' => 'alice@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
        'consent' => true,
    ])->assertCreated();

    $user = User::where('email', 'alice@example.com')->firstOrFail();

    Notification::assertSentTo($user, WelcomeNotification::class, function ($notification) use ($user) {
        return $notification->toMail($user)->actionUrl === 'https://dev.example.fr/tableau-de-bord';
    });
});

it('envoie un e-mail de test via la commande mail:test', function () {
    $this->artisan('mail:test', ['email' => 'test@example.com'])->assertSuccessful();

    $messages = app('mailer')->getSymfonyTransport()->messages();

    expect($messages)->toHaveCount(1)
        ->and($messages->first()->getOriginalMessage()->getTo()[0]->getAddress())->toBe('test@example.com');
});

it('refuse une adresse invalide dans mail:test', function () {
    $this->artisan('mail:test', ['email' => 'pas-un-email'])->assertFailed();
});
