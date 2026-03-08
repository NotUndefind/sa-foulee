<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('performances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('strava_activity_id', 100)->nullable()->unique(); // Évite les doublons Strava
            $table->decimal('distance_km', 8, 3);
            $table->unsignedInteger('duration_sec');
            $table->unsignedSmallInteger('elevation_m')->nullable();
            $table->date('date');
            $table->enum('source', ['strava', 'manual'])->default('manual');
            $table->timestamps();

            // Index pour le leaderboard (agrégation par user et période)
            $table->index(['user_id', 'date'], 'idx_performances_user_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('performances');
    }
};
