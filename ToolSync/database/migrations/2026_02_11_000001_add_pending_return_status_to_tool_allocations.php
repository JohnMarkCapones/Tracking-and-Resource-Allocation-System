<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $driver = DB::getDriverName();
        if ($driver === 'sqlite') {
            return;
        }

        DB::statement("ALTER TABLE tool_allocations MODIFY status ENUM('BORROWED','PENDING_RETURN','RETURNED') NOT NULL DEFAULT 'BORROWED'");
    }

    public function down(): void
    {
        $driver = DB::getDriverName();
        if ($driver === 'sqlite') {
            return;
        }

        DB::statement("ALTER TABLE tool_allocations MODIFY status ENUM('BORROWED','RETURNED') NOT NULL DEFAULT 'BORROWED'");
    }
};
