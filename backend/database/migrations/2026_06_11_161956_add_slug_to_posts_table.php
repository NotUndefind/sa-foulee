<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            // Nullable d'abord : backfill des posts existants avant l'index unique.
            $table->string('slug', 280)->nullable()->after('title');
        });

        // Backfill : slug = titre slugifié + '-' + id (unicité garantie par l'id).
        // Inclut les posts soft-deleted pour préserver l'unicité globale.
        DB::table('posts')->orderBy('id')->each(function ($post) {
            DB::table('posts')
                ->where('id', $post->id)
                ->update(['slug' => Str::slug($post->title).'-'.$post->id]);
        });

        Schema::table('posts', function (Blueprint $table) {
            $table->unique('slug', 'posts_slug_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropUnique('posts_slug_unique');
            $table->dropColumn('slug');
        });
    }
};
