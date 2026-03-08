<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['license', 'registration', 'medical_certificate', 'other']);
            $table->string('filename', 255);
            $table->string('r2_path', 500); // Chemin dans Cloudflare R2
            $table->enum('status', ['pending', 'valid', 'expired'])->default('pending');
            $table->date('expires_at')->nullable();
            $table->timestamps();

            // Index pour requêtes fréquentes (suivi dossier par admin)
            $table->index(['user_id', 'status'], 'idx_docs_user_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_documents');
    }
};
