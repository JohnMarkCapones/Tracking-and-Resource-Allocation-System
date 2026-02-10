<?php

namespace Database\Seeders;

use App\Models\Tool;
use Illuminate\Database\Seeder;

class SetToolQuantitiesToOneSeeder extends Seeder
{
    /**
     * Set quantity = 1 for all tools (for testing: one borrow will then flip status to BORROWED).
     */
    public function run(): void
    {
        $updated = Tool::query()->update([
            'quantity' => 1,
            'status' => 'AVAILABLE',
        ]);

        $this->command->info("Updated {$updated} tool(s) to quantity = 1 and status = AVAILABLE.");
    }
}
