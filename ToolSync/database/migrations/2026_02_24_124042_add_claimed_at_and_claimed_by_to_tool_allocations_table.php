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
        Schema::table('tool_allocations', function (Blueprint $table): void {
            $table->dateTime('claimed_at')->nullable()->after('expected_return_date');
            $table->foreignId('claimed_by')->nullable()->after('claimed_at')->constrained('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tool_allocations', function (Blueprint $table): void {
            $table->dropForeign(['claimed_by']);
            $table->dropColumn(['claimed_at', 'claimed_by']);
        });
    }
};
