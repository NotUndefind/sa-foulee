<?php

use App\Models\User;

it("interdit à un membre de lister les documents d'un autre membre", function () {
    $alice = User::factory()->create();
    $alice->assignRole('member');
    $bob = User::factory()->create();
    $bob->assignRole('member');

    $this->actingAs($alice)
        ->getJson("/api/v1/users/{$bob->id}/documents")
        ->assertStatus(403);
});

it('autorise un membre à lister ses propres documents', function () {
    $alice = User::factory()->create();
    $alice->assignRole('member');

    $this->actingAs($alice)
        ->getJson("/api/v1/users/{$alice->id}/documents")
        ->assertOk();
});
