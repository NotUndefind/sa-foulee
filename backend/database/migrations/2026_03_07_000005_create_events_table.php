<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title', 255);
            $table->text('description');
            $table->enum('type', ['race', 'outing', 'competition', 'other'])->default('outing');
            $table->dateTime('event_date');
            $table->string('location', 255);
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->boolean('is_public')->default(true);
            $table->softDeletes();
            $table->timestamps();

            // Index pour le calendrier (tri par date)
            $table->index('event_date', 'idx_events_date');
        });

        Schema::create('event_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('registered_at')->useCurrent();

            $table->unique(['event_id', 'user_id']); // Pas de double inscription
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_registrations');
        Schema::dropIfExists('events');
    }
};
