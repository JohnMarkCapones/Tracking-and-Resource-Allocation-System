<?php

use App\Models\BusinessHour;
use App\Models\Favorite;
use App\Models\Tool;
use App\Models\ToolCategory;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    // Set up business hours for any date validation
    for ($d = 0; $d <= 6; $d++) {
        BusinessHour::query()->updateOrInsert(
            ['day_of_week' => $d],
            [
                'enabled' => true,
                'open_time' => '09:00',
                'close_time' => '17:00',
                'updated_at' => now(),
            ]
        );
    }
});

test('GET /api/favorites returns tools with borrow information', function () {
    $user = User::factory()->create(['role' => 'USER']);
    Sanctum::actingAs($user);

    $category = ToolCategory::create(['name' => 'IT Equipment']);
    $tool = Tool::create([
        'name' => 'Test Laptop',
        'description' => 'A test laptop',
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'AVAILABLE',
        'quantity' => 3,
        'condition' => 'Good',
    ]);

    // Add tool to favorites
    Favorite::create([
        'user_id' => $user->id,
        'tool_id' => $tool->id,
    ]);

    $response = $this->getJson('/api/favorites');

    $response->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $tool->id)
        ->assertJsonPath('data.0.name', 'Test Laptop')
        ->assertJsonPath('data.0.status', 'AVAILABLE')
        ->assertJsonPath('data.0.condition', 'Good')
        ->assertJsonPath('data.0.quantity', 3)
        ->assertJsonPath('data.0.availableQuantity', 3)
        ->assertJsonPath('data.0.borrowedQuantity', 0);
});

test('GET /api/favorites includes borrowed count for borrowed tools', function () {
    $user = User::factory()->create(['role' => 'USER']);
    Sanctum::actingAs($user);

    $category = ToolCategory::create(['name' => 'IT Equipment']);
    $tool = Tool::create([
        'name' => 'Borrowed Laptop',
        'description' => 'A borrowed laptop',
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'BORROWED',
        'quantity' => 2,
        'condition' => 'Good',
    ]);

    // Create a borrowed allocation
    \App\Models\ToolAllocation::create([
        'tool_id' => $tool->id,
        'user_id' => $user->id,
        'borrow_date' => now(),
        'expected_return_date' => now()->addDays(3),
        'status' => 'BORROWED',
    ]);

    // Add tool to favorites
    Favorite::create([
        'user_id' => $user->id,
        'tool_id' => $tool->id,
    ]);

    $response = $this->getJson('/api/favorites');

    $response->assertOk()
        ->assertJsonPath('data.0.id', $tool->id)
        ->assertJsonPath('data.0.status', 'BORROWED')
        ->assertJsonPath('data.0.quantity', 2)
        ->assertJsonPath('data.0.borrowedQuantity', 1)
        ->assertJsonPath('data.0.availableQuantity', 1);
});

test('GET /api/favorites returns empty list for user with no favorites', function () {
    $user = User::factory()->create(['role' => 'USER']);
    Sanctum::actingAs($user);

    $response = $this->getJson('/api/favorites');

    $response->assertOk()
        ->assertJsonCount(0, 'data')
        ->assertJsonPath('data', []);
});

test('GET /api/favorites without auth returns 401', function () {
    $response = $this->getJson('/api/favorites');

    $response->assertUnauthorized();
});
