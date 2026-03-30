<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('membership_paid_at')->nullable()->after('bio');
            $table->decimal('membership_paid_amount', 8, 2)->nullable()->after('membership_paid_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['membership_paid_at', 'membership_paid_amount']);
        });
    }
};
