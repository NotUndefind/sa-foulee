<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('training_sessions', function (Blueprint $table) {
            $table->foreignId('location_id')->nullable()->after('created_by')->constrained('locations')->nullOnDelete();
            $table->dateTime('session_date')->nullable()->after('location_id');
            $table->dropColumn('published_at');
        });
    }

    public function down(): void
    {
        Schema::table('training_sessions', function (Blueprint $table) {
            $table->dropForeign(['location_id']);
            $table->dropColumn(['location_id', 'session_date']);
            $table->timestamp('published_at')->nullable();
        });
    }
};
