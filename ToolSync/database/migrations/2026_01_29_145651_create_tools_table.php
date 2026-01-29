<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tools', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->text('description')->nullable();
            $table->string('image_path', 255)->nullable();
            $table->foreignId('category_id')->constrained('tool_categories')->restrictOnDelete()->cascadeOnUpdate();
            $table->enum('status', ['AVAILABLE', 'BORROWED', 'MAINTENANCE'])->default('AVAILABLE');
            $table->integer('quantity')->default(1);
            $table->timestamps();

            $table->index('status');
            $table->index('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tools');
    }
};
