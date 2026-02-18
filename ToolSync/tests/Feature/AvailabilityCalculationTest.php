<?php

use App\Models\BusinessHour;
use App\Models\Reservation;
use App\Models\Tool;
use App\Models\ToolAllocation;
use App\Models\ToolCategory;
use App\Models\User;
use App\Services\ToolAvailabilityService;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    // DateValidationService requires business hours to be open
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

test('calculateAvailability returns correct counts', function () {
    $category = ToolCategory::create(['name' => 'IT']);
    $tool = Tool::create([
        'name' => 'Laptop',
        'description' => null,
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'AVAILABLE',
        'quantity' => 5,
    ]);

    $service = app(ToolAvailabilityService::class);
    $availability = $service->calculateAvailability($tool->id);

    expect($availability['total_quantity'])->toBe(5);
    expect($availability['borrowed_count'])->toBe(0);
    expect($availability['reserved_count'])->toBe(0);
    expect($availability['available_count'])->toBe(5);
});

test('calculateAvailability subtracts borrowed count', function () {
    $user = User::factory()->create(['role' => 'USER']);
    $category = ToolCategory::create(['name' => 'IT']);
    $tool = Tool::create([
        'name' => 'Laptop',
        'description' => null,
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'AVAILABLE',
        'quantity' => 5,
    ]);

    ToolAllocation::create([
        'tool_id' => $tool->id,
        'user_id' => $user->id,
        'borrow_date' => now()->toDateString(),
        'expected_return_date' => now()->addDays(3)->toDateString(),
        'status' => 'BORROWED',
    ]);

    $service = app(ToolAvailabilityService::class);
    $availability = $service->calculateAvailability($tool->id);

    expect($availability['total_quantity'])->toBe(5);
    expect($availability['borrowed_count'])->toBe(1);
    expect($availability['reserved_count'])->toBe(0);
    expect($availability['available_count'])->toBe(4);
});

test('calculateAvailability subtracts reserved count', function () {
    $user = User::factory()->create(['role' => 'USER']);
    $category = ToolCategory::create(['name' => 'IT']);
    $tool = Tool::create([
        'name' => 'Laptop',
        'description' => null,
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'AVAILABLE',
        'quantity' => 5,
    ]);

    Reservation::create([
        'tool_id' => $tool->id,
        'user_id' => $user->id,
        'start_date' => now()->addDays(1)->toDateString(),
        'end_date' => now()->addDays(3)->toDateString(),
        'status' => 'UPCOMING',
    ]);

    $service = app(ToolAvailabilityService::class);
    $availability = $service->calculateAvailability($tool->id);

    expect($availability['total_quantity'])->toBe(5);
    expect($availability['borrowed_count'])->toBe(0);
    expect($availability['reserved_count'])->toBe(1);
    expect($availability['available_count'])->toBe(4);
});

test('calculateAvailability subtracts both borrowed and reserved', function () {
    $user = User::factory()->create(['role' => 'USER']);
    $category = ToolCategory::create(['name' => 'IT']);
    $tool = Tool::create([
        'name' => 'Laptop',
        'description' => null,
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'AVAILABLE',
        'quantity' => 5,
    ]);

    ToolAllocation::create([
        'tool_id' => $tool->id,
        'user_id' => $user->id,
        'borrow_date' => now()->toDateString(),
        'expected_return_date' => now()->addDays(3)->toDateString(),
        'status' => 'BORROWED',
    ]);

    Reservation::create([
        'tool_id' => $tool->id,
        'user_id' => $user->id,
        'start_date' => now()->addDays(5)->toDateString(),
        'end_date' => now()->addDays(7)->toDateString(),
        'status' => 'UPCOMING',
    ]);

    $service = app(ToolAvailabilityService::class);
    $availability = $service->calculateAvailability($tool->id);

    expect($availability['total_quantity'])->toBe(5);
    expect($availability['borrowed_count'])->toBe(1);
    expect($availability['reserved_count'])->toBe(1);
    expect($availability['available_count'])->toBe(3);
});

test('calculateAvailability does not count COMPLETED reservations', function () {
    $user = User::factory()->create(['role' => 'USER']);
    $category = ToolCategory::create(['name' => 'IT']);
    $tool = Tool::create([
        'name' => 'Laptop',
        'description' => null,
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'AVAILABLE',
        'quantity' => 5,
    ]);

    Reservation::create([
        'tool_id' => $tool->id,
        'user_id' => $user->id,
        'start_date' => now()->addDays(1)->toDateString(),
        'end_date' => now()->addDays(3)->toDateString(),
        'status' => 'COMPLETED', // Should not be counted
    ]);

    $service = app(ToolAvailabilityService::class);
    $availability = $service->calculateAvailability($tool->id);

    expect($availability['reserved_count'])->toBe(0);
    expect($availability['available_count'])->toBe(5);
});

test('ToolController includes calculated availability in response', function () {
    $category = ToolCategory::create(['name' => 'IT']);
    $tool = Tool::create([
        'name' => 'Laptop',
        'description' => null,
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'AVAILABLE',
        'quantity' => 5,
    ]);

    $response = $this->getJson('/api/tools');

    $response->assertOk();
    $toolData = collect($response->json('data'))->firstWhere('id', $tool->id);
    expect($toolData)->toHaveKey('calculated_available_count');
    expect($toolData)->toHaveKey('calculated_reserved_count');
    expect($toolData['calculated_available_count'])->toBe(5);
});

test('ToolController includes reserved_count in response', function () {
    $user = User::factory()->create(['role' => 'USER']);
    Sanctum::actingAs($user);

    $category = ToolCategory::create(['name' => 'IT']);
    $tool = Tool::create([
        'name' => 'Laptop',
        'description' => null,
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'AVAILABLE',
        'quantity' => 5,
    ]);

    Reservation::create([
        'tool_id' => $tool->id,
        'user_id' => $user->id,
        'start_date' => now()->addDays(1)->toDateString(),
        'end_date' => now()->addDays(3)->toDateString(),
        'status' => 'UPCOMING',
    ]);

    $response = $this->getJson('/api/tools');

    $response->assertOk();
    $toolData = collect($response->json('data'))->firstWhere('id', $tool->id);
    expect($toolData)->toHaveKey('reserved_count');
    expect($toolData['reserved_count'])->toBe(1);
    expect($toolData['calculated_reserved_count'])->toBe(1);
    expect($toolData['calculated_available_count'])->toBe(4);
});
