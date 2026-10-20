<?php

use App\Exceptions\CampaignNotSendableException;
use App\Models\NewsletterCampaign;
use App\Models\User;
use App\Services\NewsletterCampaignService;
use Illuminate\Support\Facades\DB;
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

it('termine la campagne même si un envoi échoue (pas de verrou permanent)', function () {
    // Queue database (comme en prod) : la queue sync relance l'exception au dispatch.
    config(['queue.default' => 'database']);

    // Simule un rejet SMTP pour un seul destinataire.
    Mail::shouldReceive('send')->andReturnUsing(function ($view, array $data) {
        if ($data['recipientName'] === 'Bounce') {
            throw new RuntimeException('550 mailbox unavailable');
        }
    });

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    foreach (['Alice', 'Bounce', 'Charlie'] as $firstName) {
        User::factory()->create([
            'first_name' => $firstName,
            'newsletter_subscribed_at' => now(),
            'newsletter_unsubscribe_token' => Str::random(64),
        ]);
    }

    $campaign = NewsletterCampaign::create([
        'created_by' => $admin->id,
        'subject' => 'Newsletter',
        'body_html' => '<p>Bonjour</p>',
    ]);

    $this->actingAs($admin)
        ->postJson("/api/v1/admin/newsletter/campaigns/{$campaign->id}/send")
        ->assertOk();

    $this->artisan('queue:work', ['--stop-when-empty' => true])->assertExitCode(0);

    $campaign->refresh();
    expect($campaign->sent_at)->not->toBeNull();
    expect($campaign->failed_count)->toBe(1);
    expect($campaign->isQueued())->toBeFalse();
});

it('refuse un second envoi concurrent grâce au verrou atomique', function () {
    config(['queue.default' => 'database']);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    User::factory()->create([
        'newsletter_subscribed_at' => now(),
        'newsletter_unsubscribe_token' => Str::random(64),
    ]);

    $campaign = NewsletterCampaign::create([
        'created_by' => $admin->id,
        'subject' => 'Newsletter',
        'body_html' => '<p>Bonjour</p>',
    ]);

    // Simule une requête concurrente qui a déjà réservé la campagne entre le
    // chargement du modèle et la réservation.
    $stale = NewsletterCampaign::find($campaign->id);
    NewsletterCampaign::whereKey($campaign->id)->update(['queued_at' => now()]);

    expect(fn () => app(NewsletterCampaignService::class)->queue($stale))
        ->toThrow(CampaignNotSendableException::class);

    expect(DB::table('job_batches')->count())->toBe(0);
});
