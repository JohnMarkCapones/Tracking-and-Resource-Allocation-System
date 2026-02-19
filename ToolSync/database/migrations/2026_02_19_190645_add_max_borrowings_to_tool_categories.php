<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Add per-category max_borrowings override.
 * When set, this takes precedence over the system-wide max_borrowings setting.
 * Null means "use the system default".
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tool_categories', function (Blueprint $table): void {
            $table->unsignedTinyInteger('max_borrowings')->nullable()->after('name')
                ->comment('Per-category borrow slot limit. Null = use system default.');
        });
    }

    public function down(): void
    {
        Schema::table('tool_categories', function (Blueprint $table): void {
            $table->dropColumn('max_borrowings');
        });
    }
};
