<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * Ordre important : rôles avant utilisateurs (FK).
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
            SettingsSeeder::class,
        ]);

        $this->command->info('');
        $this->command->info('🎉 Base de données saFoulee initialisée !');
        $this->command->info('   → php artisan migrate:fresh --seed pour réinitialiser');
    }
}
