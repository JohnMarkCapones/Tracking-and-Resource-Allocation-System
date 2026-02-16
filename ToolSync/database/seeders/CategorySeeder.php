<?php

namespace Database\Seeders;

use App\Models\ToolCategory;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'IT Equipment',
            'Office Equipment',
            'Multimedia',
            'Safety & PPE',
            'Furniture',
            'Power & Electrical',
            'Hand Tools',
            'Cleaning & Janitorial',
            'Transport & Vehicles',
            'Lab & Scientific',
            'Sports & Recreation',
            'Kitchen & Break Room',
            'Storage & Packaging',
            'Gardening & Outdoor',
            'Medical & First Aid',
        ];

        foreach ($categories as $name) {
            ToolCategory::firstOrCreate(['name' => $name]);
        }
    }
}
