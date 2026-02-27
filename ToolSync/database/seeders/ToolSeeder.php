<?php

namespace Database\Seeders;

use App\Models\Tool;
use App\Models\ToolCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class ToolSeeder extends Seeder
{
    /**
     * Seed a representative catalog of tools for local development.
     *
     * This implementation clears the `tools` table before inserting records so
     * developers always start from a known-good dataset. Avoid running this in
     * production, as it will delete existing tools.
     */
    public function run(): void
    {
        if (! Schema::hasTable('tool_categories') || ! Schema::hasTable('tools')) {
            return;
        }

        $this->seedTools();
    }

    private function seedTools(): void
    {
        $getCategoryId = fn (string $name): ?int => ToolCategory::where('name', $name)->first()?->id;

        $tools = [
            // IT Equipment
            ['name' => 'Laptop', 'category' => 'IT Equipment', 'description' => 'Business laptop for work', 'image_path' => 'images/tools/laptop.png'],
            ['name' => 'Desktop PC', 'category' => 'IT Equipment', 'description' => 'Office desktop computer', 'image_path' => null],
            ['name' => 'Keyboard', 'category' => 'IT Equipment', 'description' => 'Ergonomic office keyboard', 'image_path' => 'images/tools/keyboard.png'],
            ['name' => 'Mouse', 'category' => 'IT Equipment', 'description' => 'Wireless optical mouse', 'image_path' => 'images/tools/mouse.png'],
            ['name' => 'Monitor', 'category' => 'IT Equipment', 'description' => '24" LED monitor', 'image_path' => null],
            ['name' => 'Docking Station', 'category' => 'IT Equipment', 'description' => 'USB-C laptop docking station', 'image_path' => null],
            ['name' => 'Webcam', 'category' => 'IT Equipment', 'description' => 'HD webcam for video calls', 'image_path' => null],
            ['name' => 'USB Hub', 'category' => 'IT Equipment', 'description' => '4-port USB 3.0 hub', 'image_path' => null],
            ['name' => 'External SSD', 'category' => 'IT Equipment', 'description' => '500GB portable SSD', 'image_path' => null],
            ['name' => 'Tablet', 'category' => 'IT Equipment', 'description' => '10" tablet for field work', 'image_path' => null],

            // Office Equipment
            ['name' => 'Printer', 'category' => 'Office Equipment', 'description' => 'High-quality office printer', 'image_path' => 'images/tools/printer.png'],
            ['name' => 'Scanner', 'category' => 'Office Equipment', 'description' => 'Document scanner', 'image_path' => null],
            ['name' => 'Shredder', 'category' => 'Office Equipment', 'description' => 'Paper shredder', 'image_path' => null],
            ['name' => 'Label Maker', 'category' => 'Office Equipment', 'description' => 'Electronic label maker', 'image_path' => null],
            ['name' => 'Stapler', 'category' => 'Office Equipment', 'description' => 'Heavy-duty stapler', 'image_path' => null],
            ['name' => 'Whiteboard', 'category' => 'Office Equipment', 'description' => 'Mobile whiteboard', 'image_path' => null],
            ['name' => 'Flip Chart', 'category' => 'Office Equipment', 'description' => 'Stand with flip chart pad', 'image_path' => null],
            ['name' => 'Binding Machine', 'category' => 'Office Equipment', 'description' => 'Document binding machine', 'image_path' => null],

            // Multimedia
            ['name' => 'Projector', 'category' => 'Multimedia', 'description' => 'Multimedia projector for presentations', 'image_path' => 'images/tools/projector-device.png'],
            ['name' => 'Projector Screen', 'category' => 'Multimedia', 'description' => 'Portable projector screen', 'image_path' => 'images/tools/projector-screen.png'],
            ['name' => 'Headset', 'category' => 'Multimedia', 'description' => 'Wireless headset for calls', 'image_path' => 'images/tools/headset.png'],
            ['name' => 'Camera', 'category' => 'Multimedia', 'description' => 'Digital camera for photography', 'image_path' => 'images/tools/camera.png'],
            ['name' => 'Video Camera', 'category' => 'Multimedia', 'description' => 'Camcorder for recording', 'image_path' => null],
            ['name' => 'Microphone', 'category' => 'Multimedia', 'description' => 'USB condenser microphone', 'image_path' => null],
            ['name' => 'Speaker System', 'category' => 'Multimedia', 'description' => 'Portable Bluetooth speaker', 'image_path' => null],
            ['name' => 'Conference Phone', 'category' => 'Multimedia', 'description' => 'Speakerphone for meetings', 'image_path' => null],

            // Safety & PPE
            ['name' => 'Safety Helmet', 'category' => 'Safety & PPE', 'description' => 'Hard hat', 'image_path' => null],
            ['name' => 'Safety Glasses', 'category' => 'Safety & PPE', 'description' => 'Protective eyewear', 'image_path' => null],
            ['name' => 'High-Vis Vest', 'category' => 'Safety & PPE', 'description' => 'Reflective safety vest', 'image_path' => null],
            ['name' => 'Safety Gloves', 'category' => 'Safety & PPE', 'description' => 'Work gloves (pair)', 'image_path' => null],
            ['name' => 'Ear Defenders', 'category' => 'Safety & PPE', 'description' => 'Hearing protection', 'image_path' => null],
            ['name' => 'First Aid Kit', 'category' => 'Safety & PPE', 'description' => 'Portable first aid kit', 'image_path' => null],

            // Furniture
            ['name' => 'Office Chair', 'category' => 'Furniture', 'description' => 'Ergonomic office chair', 'image_path' => null],
            ['name' => 'Standing Desk', 'category' => 'Furniture', 'description' => 'Adjustable standing desk', 'image_path' => null],
            ['name' => 'Filing Cabinet', 'category' => 'Furniture', 'description' => '2-drawer filing cabinet', 'image_path' => null],
            ['name' => 'Bookshelf', 'category' => 'Furniture', 'description' => '5-tier bookshelf', 'image_path' => null],
            ['name' => 'Monitor Arm', 'category' => 'Furniture', 'description' => 'Desk monitor mount', 'image_path' => null],

            // Power & Electrical
            ['name' => 'Power Strip', 'category' => 'Power & Electrical', 'description' => '6-outlet surge protector', 'image_path' => null],
            ['name' => 'Extension Cord', 'category' => 'Power & Electrical', 'description' => '10m extension cord', 'image_path' => null],
            ['name' => 'Battery Pack', 'category' => 'Power & Electrical', 'description' => 'Portable power bank', 'image_path' => null],
            ['name' => 'Cable Tray', 'category' => 'Power & Electrical', 'description' => 'Desk cable organizer', 'image_path' => null],

            // Hand Tools
            ['name' => 'Screwdriver Set', 'category' => 'Hand Tools', 'description' => 'Phillips and flat head set', 'image_path' => null],
            ['name' => 'Wrench Set', 'category' => 'Hand Tools', 'description' => 'Adjustable wrenches', 'image_path' => null],
            ['name' => 'Hammer', 'category' => 'Hand Tools', 'description' => 'Claw hammer', 'image_path' => null],
            ['name' => 'Drill', 'category' => 'Hand Tools', 'description' => 'Cordless power drill', 'image_path' => null],
            ['name' => 'Toolbox', 'category' => 'Hand Tools', 'description' => 'Portable tool storage', 'image_path' => null],

            // Cleaning & Janitorial
            ['name' => 'Vacuum Cleaner', 'category' => 'Cleaning & Janitorial', 'description' => 'Upright vacuum', 'image_path' => null],
            ['name' => 'Mop and Bucket', 'category' => 'Cleaning & Janitorial', 'description' => 'Wet mop set', 'image_path' => null],
            ['name' => 'Pressure Washer', 'category' => 'Cleaning & Janitorial', 'description' => 'Electric pressure washer', 'image_path' => null],

            // Lab & Scientific
            ['name' => 'Microscope', 'category' => 'Lab & Scientific', 'description' => 'Compound microscope', 'image_path' => null],
            ['name' => 'Multimeter', 'category' => 'Lab & Scientific', 'description' => 'Digital multimeter', 'image_path' => null],
            ['name' => 'Hot Plate', 'category' => 'Lab & Scientific', 'description' => 'Laboratory hot plate', 'image_path' => null],

            // Sports & Recreation
            ['name' => 'Projector (Events)', 'category' => 'Sports & Recreation', 'description' => 'Outdoor event projector', 'image_path' => null],
            ['name' => 'Portable Speaker', 'category' => 'Sports & Recreation', 'description' => 'Large portable speaker', 'image_path' => null],

            // Kitchen & Break Room
            ['name' => 'Coffee Machine', 'category' => 'Kitchen & Break Room', 'description' => 'Espresso machine', 'image_path' => null],
            ['name' => 'Microwave', 'category' => 'Kitchen & Break Room', 'description' => 'Countertop microwave', 'image_path' => null],
            ['name' => 'Water Cooler', 'category' => 'Kitchen & Break Room', 'description' => 'Standing water cooler', 'image_path' => null],

            // Storage & Packaging
            ['name' => 'Hand Truck', 'category' => 'Storage & Packaging', 'description' => 'Dolly hand truck', 'image_path' => null],
            ['name' => 'Storage Cart', 'category' => 'Storage & Packaging', 'description' => 'Rolling storage cart', 'image_path' => null],
            ['name' => 'Packing Tape Gun', 'category' => 'Storage & Packaging', 'description' => 'Dispenser with tape', 'image_path' => null],

            // Gardening & Outdoor
            ['name' => 'Lawn Mower', 'category' => 'Gardening & Outdoor', 'description' => 'Push lawn mower', 'image_path' => null],
            ['name' => 'Leaf Blower', 'category' => 'Gardening & Outdoor', 'description' => 'Cordless leaf blower', 'image_path' => null],
            ['name' => 'Wheelbarrow', 'category' => 'Gardening & Outdoor', 'description' => 'Heavy-duty wheelbarrow', 'image_path' => null],

            // Medical & First Aid
            ['name' => 'Defibrillator', 'category' => 'Medical & First Aid', 'description' => 'AED defibrillator', 'image_path' => null],
            ['name' => 'Blood Pressure Monitor', 'category' => 'Medical & First Aid', 'description' => 'Digital BP monitor', 'image_path' => null],
        ];

        Schema::disableForeignKeyConstraints();
        Tool::query()->delete();
        Schema::enableForeignKeyConstraints();

        $created = 0;
        foreach ($tools as $row) {
            $categoryId = $getCategoryId($row['category']);
            if ($categoryId === null) {
                continue;
            }
            Tool::create([
                'name' => $row['name'],
                'description' => $row['description'] ?? null,
                'image_path' => $row['image_path'] ?? null,
                'category_id' => $categoryId,
                'status' => 'AVAILABLE',
                'quantity' => 1,
            ]);
            $created++;
        }

        $this->command->info("Created {$created} tool(s).");
    }
}
