<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration minimale requise par STORY-V2-P02 (webhook HelloAsso).
 * La table sera enrichie (UI, rapports, export) par STORY-V2-B01 (Sprint 15).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budget_entries', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['recette', 'depense']);
            $table->string('category', 100); // ex: 'cotisation', 'materiel', 'deplacement'
            $table->decimal('amount', 10, 2);
            $table->text('description')->nullable();
            $table->date('entry_date');
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // membre concerné (ex : cotisant)
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('source', 50)->default('manual'); // 'manual' | 'helloasso'
            $table->string('external_ref', 255)->nullable(); // ID externe (ex : order_id HelloAsso)
            $table->timestamps();

            $table->index(['type', 'category'], 'idx_budget_type_cat');
            $table->index('entry_date', 'idx_budget_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budget_entries');
    }
};
