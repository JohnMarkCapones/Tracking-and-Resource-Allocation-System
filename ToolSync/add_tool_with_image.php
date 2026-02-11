<?php
/**
 * Example: How to add a tool with an image
 * 
 * Usage: php add_tool_with_image.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Step 1: First, manually copy your image to: storage/app/public/images/tools/
// Example: storage/app/public/images/tools/my-new-tool.png

// Step 2: Create the tool with the image path
$category = \App\Models\ToolCategory::where('name', 'IT Equipment')->first();

if (!$category) {
    echo "Error: No category found. Please create categories first.\n";
    exit(1);
}

$tool = \App\Models\Tool::create([
    'name' => 'Example Tool',
    'description' => 'A sample tool with an image',
    'image_path' => 'images/tools/my-new-tool.png',  // ← Just the path, not full URL
    'category_id' => $category->id,
    'status' => 'AVAILABLE',
    'quantity' => 1,
]);

echo "✓ Tool created successfully!\n";
echo "  ID: {$tool->id}\n";
echo "  Name: {$tool->name}\n";
echo "  Image Path: {$tool->image_path}\n";
echo "  Image URL: " . asset('storage/' . $tool->image_path) . "\n";
echo "\nMake sure the image file exists at:\n";
echo "  storage/app/public/images/tools/my-new-tool.png\n";
