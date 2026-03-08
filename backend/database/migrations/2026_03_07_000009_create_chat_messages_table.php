<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            // Canal : 'general' ou 'event.{id}'
            $table->string('channel', 100);
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('content');
            $table->timestamp('created_at')->useCurrent();

            // Index pour charger les 50 derniers messages d'un canal
            $table->index(['channel', 'created_at'], 'idx_chat_channel');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
    }
};
