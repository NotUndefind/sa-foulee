<?php

use App\Models\NewsletterCampaign;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

it('marque la campagne envoyée seulement après le traitement du batch, puis bloque le réenvoi', function () {
    Mail::fake();

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    User::factory()->create([
        'newsletter_subscribed_at' => now(),
        'newsletter_unsubscribe_token' => Str::random(64),
    ]);

    $campaign = NewsletterCampaign::create([
        'created_by' => $admin->id,
        'subject' => 'Newsletter de juin',
        'body_html' => '<p>Bonjour à tous</p>',
    ]);

    $this->actingAs($admin)
        ->postJson("/api/v1/admin/newsletter/campaigns/{$campaign->id}/send")
        ->assertOk()
        ->assertJsonPath('recipient_count', 1);

    // Queue sync en tests : le batch est traité immédiatement, le callback
    // then() a posé sent_at — la campagne est réellement envoyée.
    $campaign->refresh();
    expect($campaign->sent_at)->not->toBeNull();
    expect($campaign->queued_at)->not->toBeNull();

    // Un second envoi est refusé.
    $this->actingAs($admin)
        ->postJson("/api/v1/admin/newsletter/campaigns/{$campaign->id}/send")
        ->assertStatus(422);
});
