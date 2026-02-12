<?php

namespace Database\Seeders;

use App\Models\ToolCategory;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'IT Equipment'],
            ['name' => 'Office Equipment'],
            ['name' => 'Multimedia'],
        ];

        foreach ($categories as $category) {
            ToolCategory::firstOrCreate(['name' => $category['name']]);
        }
    }
}
