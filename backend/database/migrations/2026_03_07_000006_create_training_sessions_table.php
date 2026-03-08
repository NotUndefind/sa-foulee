<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('title', 255);
            $table->enum('type', ['running', 'interval', 'fartlek', 'recovery', 'strength', 'other']);
            $table->decimal('distance_km', 5, 2)->nullable();
            $table->unsignedSmallInteger('duration_min')->nullable();
            $table->enum('intensity', ['low', 'medium', 'high'])->default('medium');
            $table->json('exercises')->nullable(); // [{name, sets, reps, duration, rest}]
            $table->text('description')->nullable();
            $table->boolean('is_template')->default(false);
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index('is_template');
            $table->index('published_at');
        });

        Schema::create('session_participations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained('training_sessions')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('participated_at')->useCurrent();

            $table->unique(['session_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('session_participations');
        Schema::dropIfExists('training_sessions');
    }
};
