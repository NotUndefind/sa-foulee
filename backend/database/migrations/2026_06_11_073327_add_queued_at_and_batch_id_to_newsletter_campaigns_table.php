<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('newsletter_campaigns', function (Blueprint $table) {
            // queued_at : la campagne a été mise en file (batch dispatché) mais
            // pas encore confirmée envoyée. Empêche un double envoi pendant le
            // traitement. sent_at n'est posé qu'à la complétion du batch.
            $table->timestamp('queued_at')->nullable()->after('body_html');
            $table->string('batch_id')->nullable()->after('queued_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('newsletter_campaigns', function (Blueprint $table) {
            $table->dropColumn(['queued_at', 'batch_id']);
        });
    }
};
