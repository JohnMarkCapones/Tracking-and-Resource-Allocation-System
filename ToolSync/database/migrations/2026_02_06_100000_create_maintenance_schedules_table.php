<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tool_id')->constrained('tools')->cascadeOnDelete()->cascadeOnUpdate();
            $table->string('type', 50); // routine, repair, inspection, calibration
            $table->date('scheduled_date');
            $table->date('completed_date')->nullable();
            $table->string('assignee', 150);
            $table->string('status', 30)->default('scheduled'); // scheduled, in_progress, completed, overdue
            $table->text('notes')->nullable();
            $table->unsignedInteger('usage_count')->default(0);
            $table->unsignedInteger('trigger_threshold')->default(50);
            $table->timestamps();

            $table->index('status');
            $table->index('scheduled_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_schedules');
    }
};
