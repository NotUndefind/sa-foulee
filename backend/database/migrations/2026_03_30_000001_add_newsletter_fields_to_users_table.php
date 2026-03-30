<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('newsletter_subscribed_at')->nullable()->after('membership_paid_amount');
            $table->string('newsletter_unsubscribe_token', 64)->nullable()->after('newsletter_subscribed_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['newsletter_subscribed_at', 'newsletter_unsubscribe_token']);
        });
    }
};
