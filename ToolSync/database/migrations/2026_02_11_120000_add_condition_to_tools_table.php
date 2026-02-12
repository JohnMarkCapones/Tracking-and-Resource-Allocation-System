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
        if (! Schema::hasColumn('tools', 'condition')) {
            Schema::table('tools', function (Blueprint $table) {
                $table->string('condition', 50)->default('Good')->after('status');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('tools', 'condition')) {
            Schema::table('tools', function (Blueprint $table) {
                $table->dropColumn('condition');
            });
        }
    }
};
