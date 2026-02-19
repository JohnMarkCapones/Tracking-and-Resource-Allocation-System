<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tool_allocations', function (Blueprint $table): void {
            $table->string('condition', 50)->nullable()->after('note');
        });
    }

    public function down(): void
    {
        Schema::table('tool_allocations', function (Blueprint $table): void {
            $table->dropColumn('condition');
        });
    }
};
