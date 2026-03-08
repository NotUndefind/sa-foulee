<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin principal
        $admin = User::firstOrCreate(
            ['email' => 'admin@safoulee.fr'],
            [
                'first_name' => 'Admin',
                'last_name' => 'saFoulée',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'consent_given_at' => now(),
            ]
        );
        $admin->assignRole('admin');

        // Fondateur
        $founder = User::firstOrCreate(
            ['email' => 'fondateur@safoulee.fr'],
            [
                'first_name' => 'Jean',
                'last_name' => 'Dupont',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'consent_given_at' => now(),
                'bio' => 'Fondateur de sa Foulée, passionné de course à pied depuis 10 ans.',
            ]
        );
        $founder->assignRole('founder');

        // Entraîneur
        $coach = User::firstOrCreate(
            ['email' => 'coach@safoulee.fr'],
            [
                'first_name' => 'Marie',
                'last_name' => 'Martin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'consent_given_at' => now(),
            ]
        );
        $coach->assignRole('coach');

        // Membres simples (x3)
        $members = [
            ['email' => 'pierre@safoulee.fr', 'first_name' => 'Pierre', 'last_name' => 'Bernard'],
            ['email' => 'sophie@safoulee.fr', 'first_name' => 'Sophie', 'last_name' => 'Leroy'],
            ['email' => 'lucas@safoulee.fr', 'first_name' => 'Lucas', 'last_name' => 'Petit'],
        ];

        foreach ($members as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                array_merge($data, [
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'consent_given_at' => now(),
                ])
            );
            $user->assignRole('member');
        }

        $this->command->info('✓ Utilisateurs créés : 1 admin, 1 fondateur, 1 entraîneur, 3 membres');
        $this->command->info('  Mot de passe : password (dev uniquement)');
    }
}
