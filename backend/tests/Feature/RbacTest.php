<?php

use App\Models\User;

it('refuse à un simple membre la liste des membres (réservée bureau+)', function () {
    $member = User::factory()->create();
    $member->assignRole('member');

    $this->actingAs($member)
        ->getJson('/api/v1/members')
        ->assertStatus(403);
});

it('autorise un membre du bureau à lister les membres', function () {
    $bureau = User::factory()->create();
    $bureau->assignRole('bureau');

    $this->actingAs($bureau)
        ->getJson('/api/v1/members')
        ->assertOk();
});
