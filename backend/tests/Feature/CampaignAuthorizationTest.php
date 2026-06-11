<?php

use App\Models\NewsletterCampaign;
use App\Models\User;

it("interdit l'envoi d'une campagne à un simple membre", function () {
    $member = User::factory()->create();
    $member->assignRole('member');

    $campaign = NewsletterCampaign::create([
        'created_by' => $member->id,
        'subject' => 'Test',
        'body_html' => '<p>Bonjour</p>',
    ]);

    $this->actingAs($member)
        ->postJson("/api/v1/admin/newsletter/campaigns/{$campaign->id}/send")
        ->assertStatus(403);
});
