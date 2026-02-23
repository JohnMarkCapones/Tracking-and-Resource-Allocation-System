<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tool_allocations', function (Blueprint $table): void {
            // When a borrower actually picks up / claims the tool
            $table->dateTime('claimed_at')->nullable()->after('expected_return_date');

            // Who claimed the tool (may differ from the original requester)
            $table->foreignId('claimed_by')
                ->nullable()
                ->after('claimed_at')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->nullOnDelete();

            // Borrower-reported condition and optional proof image when returning
            $table->string('reported_condition', 50)->nullable()->after('note');
            $table->string('return_proof_image_path', 255)->nullable()->after('reported_condition');

            // Admin review of the returned condition
            $table->string('admin_condition', 50)->nullable()->after('return_proof_image_path');
            $table->text('admin_review_note')->nullable()->after('admin_condition');
            $table->dateTime('admin_reviewed_at')->nullable()->after('admin_review_note');
        });
    }

    public function down(): void
    {
        Schema::table('tool_allocations', function (Blueprint $table): void {
            if (Schema::hasColumn('tool_allocations', 'claimed_by')) {
                $table->dropConstrainedForeignId('claimed_by');
            }

            foreach ([
                'claimed_at',
                'reported_condition',
                'return_proof_image_path',
                'admin_condition',
                'admin_review_note',
                'admin_reviewed_at',
            ] as $column) {
                if (Schema::hasColumn('tool_allocations', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};

