<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Simplify reservation statuses: PENDING → COMPLETED → CANCELLED.
 *
 * The UPCOMING and ACTIVE statuses were part of a "future scheduling" concept
 * that was never used in the actual flow. All borrow requests go through
 * PENDING → admin approve (COMPLETED) or decline (CANCELLED).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('reservations')) {
            return;
        }

        // Convert any lingering UPCOMING/ACTIVE rows to PENDING so they
        // re-enter the normal admin approval flow.
        DB::table('reservations')
            ->whereIn('status', ['UPCOMING', 'ACTIVE'])
            ->update(['status' => 'PENDING']);

        // Change column default from UPCOMING to PENDING.
        Schema::table('reservations', function ($table): void {
            $table->string('status', 20)->default('PENDING')->change();
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('reservations')) {
            return;
        }

        Schema::table('reservations', function ($table): void {
            $table->string('status', 20)->default('UPCOMING')->change();
        });
    }
};
