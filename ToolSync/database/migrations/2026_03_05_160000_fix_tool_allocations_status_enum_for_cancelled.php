<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('tool_allocations')) {
            return;
        }

        // MySQL ENUM must include all values. Add CANCELLED and UNCLAIMED if missing.
        DB::statement("ALTER TABLE tool_allocations MODIFY COLUMN status ENUM('SCHEDULED', 'BORROWED', 'PENDING_RETURN', 'RETURNED', 'CANCELLED', 'UNCLAIMED') NOT NULL DEFAULT 'BORROWED'");
    }

    public function down(): void
    {
        if (! Schema::hasTable('tool_allocations')) {
            return;
        }

        DB::table('tool_allocations')
            ->where('status', 'CANCELLED')
            ->update(['status' => 'SCHEDULED']);

        DB::table('tool_allocations')
            ->where('status', 'UNCLAIMED')
            ->update(['status' => 'SCHEDULED']);

        DB::statement("ALTER TABLE tool_allocations MODIFY COLUMN status ENUM('SCHEDULED', 'BORROWED', 'PENDING_RETURN', 'RETURNED') NOT NULL DEFAULT 'BORROWED'");
    }
};
