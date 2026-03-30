<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('helloasso_webhooks', function (Blueprint $table) {
            $table->id();
            $table->string('event_type', 100);          // ex: 'Payment'
            $table->string('payer_email', 255)->nullable();
            $table->decimal('amount', 10, 2)->nullable(); // montant en euros
            $table->string('order_id', 100)->nullable();  // ID commande HelloAsso
            $table->enum('status', ['processed', 'skipped', 'error', 'user_not_found']);
            $table->text('payload');                      // corps brut du webhook (JSON)
            $table->text('notes')->nullable();            // détails de traitement ou erreur
            $table->timestamps();

            $table->index('payer_email', 'idx_helloasso_email');
            $table->index('status', 'idx_helloasso_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('helloasso_webhooks');
    }
};
