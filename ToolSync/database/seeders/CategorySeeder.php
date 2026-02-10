<?php

namespace Database\Seeders;

use App\Models\ToolCategory;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Printers'],
            ['name' => 'Projectors'],
            ['name' => 'Laptops'],
            ['name' => 'Keyboards'],
            ['name' => 'Headsets'],
            ['name' => 'Cameras'],
            ['name' => 'Mice'],
        ];

        foreach ($categories as $category) {
            ToolCategory::firstOrCreate(['name' => $category['name']]);
        }
    }
}
