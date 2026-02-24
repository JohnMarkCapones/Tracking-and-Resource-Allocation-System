<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('reservations')) {
            return;
        }

        DB::table('reservations')
            ->where('status', 'UPCOMING')
            ->update(['status' => 'PENDING']);
    }

    public function down(): void
    {
        // No-op: this normalization is intentionally one-way.
    }
};

