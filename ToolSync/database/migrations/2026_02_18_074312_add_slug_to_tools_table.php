<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tools', function (Blueprint $table) {
            $table->string('slug', 180)->nullable()->after('name');
        });

        // Backfill slug from name; ensure uniqueness by appending id when needed.
        $tools = DB::table('tools')->orderBy('id')->get();
        $used = [];
        foreach ($tools as $t) {
            $base = Str::slug($t->name);
            $slug = $base;
            $n = 0;
            while (in_array($slug, $used, true)) {
                $n++;
                $slug = $base.'-'.$n;
            }
            $used[] = $slug;
            DB::table('tools')->where('id', $t->id)->update(['slug' => $slug]);
        }

        Schema::table('tools', function (Blueprint $table) {
            $table->unique('slug');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tools', function (Blueprint $table) {
            $table->dropUnique(['slug']);
            $table->dropColumn('slug');
        });
    }
};
