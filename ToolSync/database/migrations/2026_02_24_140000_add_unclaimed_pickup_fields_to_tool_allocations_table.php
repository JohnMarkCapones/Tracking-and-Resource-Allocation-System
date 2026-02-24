<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('tool_allocations')) {
            return;
        }

        Schema::table('tool_allocations', function (Blueprint $table): void {
            if (! Schema::hasColumn('tool_allocations', 'unclaimed_at')) {
                $table->dateTime('unclaimed_at')->nullable()->after('cancelled_at');
            }

            if (! Schema::hasColumn('tool_allocations', 'penalty_until')) {
                $table->dateTime('penalty_until')->nullable()->after('unclaimed_at');
            }
        });

        if (
            Schema::hasColumn('tool_allocations', 'missed_pickup_at')
            && Schema::hasColumn('tool_allocations', 'unclaimed_at')
        ) {
            DB::table('tool_allocations')
                ->whereNull('unclaimed_at')
                ->whereNotNull('missed_pickup_at')
                ->update(['unclaimed_at' => DB::raw('missed_pickup_at')]);
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('tool_allocations')) {
            return;
        }

        Schema::table('tool_allocations', function (Blueprint $table): void {
            if (Schema::hasColumn('tool_allocations', 'penalty_until')) {
                $table->dropColumn('penalty_until');
            }

            if (Schema::hasColumn('tool_allocations', 'unclaimed_at')) {
                $table->dropColumn('unclaimed_at');
            }
        });
    }
};
