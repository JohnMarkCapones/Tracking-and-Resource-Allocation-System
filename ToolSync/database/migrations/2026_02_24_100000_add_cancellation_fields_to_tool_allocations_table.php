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
            if (! Schema::hasColumn('tool_allocations', 'cancelled_at')) {
                $table->dateTime('cancelled_at')->nullable()->after('actual_return_date');
            }

            if (! Schema::hasColumn('tool_allocations', 'cancellation_reason')) {
                $table->text('cancellation_reason')->nullable()->after('cancelled_at');
            }

            $table->enum('status', ['SCHEDULED', 'BORROWED', 'PENDING_RETURN', 'RETURNED', 'CANCELLED'])
                ->default('BORROWED')
                ->change();
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('tool_allocations')) {
            return;
        }

        DB::table('tool_allocations')
            ->where('status', 'CANCELLED')
            ->update(['status' => 'SCHEDULED']);

        Schema::table('tool_allocations', function (Blueprint $table): void {
            $table->enum('status', ['SCHEDULED', 'BORROWED', 'PENDING_RETURN', 'RETURNED'])
                ->default('BORROWED')
                ->change();

            if (Schema::hasColumn('tool_allocations', 'cancellation_reason')) {
                $table->dropColumn('cancellation_reason');
            }

            if (Schema::hasColumn('tool_allocations', 'cancelled_at')) {
                $table->dropColumn('cancelled_at');
            }
        });
    }
};

