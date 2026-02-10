<?php

namespace Database\Seeders;

use App\Models\Tool;
use App\Models\ToolCategory;
use Illuminate\Database\Seeder;

class ToolSeeder extends Seeder
{
    
    public function run(): void
    {
        \Schema::disableForeignKeyConstraints();
        Tool::truncate();
        \Schema::enableForeignKeyConstraints();

        $itEquipmentCategory = ToolCategory::where('name', 'IT Equipment')->first();
        $officeEquipmentCategory = ToolCategory::where('name', 'Office Equipment')->first();
        $multimediaCategory = ToolCategory::where('name', 'Multimedia')->first();
        
        $tools = [
            [
                'name' => 'Printer',
                'category_id' => $officeEquipmentCategory->id,
                'description' => 'High-quality office printer',
                'image_path' => 'images/tools/printer.png',
                'status' => 'AVAILABLE',
                'quantity' => 1,
            ],
            [
                'name' => 'Projector',
                'category_id' => $multimediaCategory->id,
                'description' => 'Multimedia projector for presentations',
                'image_path' => 'images/tools/projector-device.png',
                'status' => 'AVAILABLE',
                'quantity' => 1,
            ],
            [
                'name' => 'Projector Screen',
                'category_id' => $multimediaCategory->id,
                'description' => 'Portable projector screen',
                'image_path' => 'images/tools/projector-screen.png',
                'status' => 'AVAILABLE',
                'quantity' => 1,
            ],
            [
                'name' => 'Laptop',
                'category_id' => $itEquipmentCategory->id,
                'description' => 'Business laptop for work',
                'image_path' => 'images/tools/laptop.png',
                'status' => 'AVAILABLE',
                'quantity' => 1,
            ],
            [
                'name' => 'Keyboard',
                'category_id' => $itEquipmentCategory->id,
                'description' => 'Ergonomic office keyboard',
                'image_path' => 'images/tools/keyboard.png',
                'status' => 'AVAILABLE',
                'quantity' => 1,
            ],
            [
                'name' => 'Headset',
                'category_id' => $multimediaCategory->id,
                'description' => 'Wireless headset for calls',
                'image_path' => 'images/tools/headset.png',
                'status' => 'AVAILABLE',
                'quantity' => 1,
            ],
            [
                'name' => 'Camera',
                'category_id' => $multimediaCategory->id,
                'description' => 'Digital camera for photography',
                'image_path' => 'images/tools/camera.png',
                'status' => 'AVAILABLE',
                'quantity' => 1,
            ],
            [
                'name' => 'Mouse',
                'category_id' => $itEquipmentCategory->id,
                'description' => 'Wireless optical mouse',
                'image_path' => 'images/tools/mouse.png',
                'status' => 'AVAILABLE',
                'quantity' => 1,
            ],
        ];

        foreach ($tools as $tool) {
            Tool::create($tool);
        }
    }
}
