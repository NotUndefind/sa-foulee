<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Crée les 5 rôles de l'association.
     * Ordre hiérarchique : admin > founder > coach > bureau > member
     */
    public function run(): void
    {
        $roles = ['admin', 'founder', 'coach', 'bureau', 'member'];

        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
        }

        $this->command->info('✓ Rôles créés : '.implode(', ', $roles));
    }
}
