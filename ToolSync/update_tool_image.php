<?php
/**
 * Example: How to update an existing tool's image
 * 
 * Usage: php update_tool_image.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Find the tool you want to update
$toolId = 1;  // ← Change this to your tool's ID

$tool = \App\Models\Tool::find($toolId);

if (!$tool) {
    echo "Error: Tool not found with ID {$toolId}\n";
    exit(1);
}

// Update the image path
// Make sure the file exists at: storage/app/public/images/tools/new-image.png
$tool->update([
    'image_path' => 'images/tools/new-image.png',  // ← Change this to your image filename
]);

echo "✓ Tool image updated successfully!\n";
echo "  Tool: {$tool->name}\n";
echo "  New Image Path: {$tool->image_path}\n";
echo "  Image URL: " . asset('storage/' . $tool->image_path) . "\n";
echo "\nMake sure the image file exists at:\n";
echo "  storage/app/public/{$tool->image_path}\n";
