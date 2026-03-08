<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('uploaded_by')->constrained('users')->restrictOnDelete();
            $table->string('r2_path');
            $table->string('url'); // URL publique directe (photos sont accessibles sans auth)
            $table->timestamps();

            $table->index('event_id', 'idx_event_photos_event_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_photos');
    }
};
