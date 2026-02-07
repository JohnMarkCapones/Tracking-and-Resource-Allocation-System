<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tool_deprecations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tool_id')->constrained('tools')->cascadeOnDelete()->cascadeOnUpdate();
            $table->string('reason');
            $table->date('retire_date');
            $table->foreignId('replacement_tool_id')->nullable()->constrained('tools')->nullOnDelete()->cascadeOnUpdate();
            $table->string('status', 30)->default('pending'); // pending, approved, retired
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tool_deprecations');
    }
};
