<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tool_status_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tool_id')->constrained('tools')->cascadeOnDelete()->cascadeOnUpdate();
            $table->enum('old_status', ['AVAILABLE', 'BORROWED', 'MAINTENANCE'])->nullable();
            $table->enum('new_status', ['AVAILABLE', 'BORROWED', 'MAINTENANCE'])->nullable();
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete()->cascadeOnUpdate();
            $table->timestamp('changed_at')->useCurrent();
            $table->timestamps();

            $table->index('tool_id');
            $table->index('changed_by');
            $table->index('changed_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tool_status_logs');
    }
};
