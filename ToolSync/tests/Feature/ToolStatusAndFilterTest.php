<?php

/**
 * Tests for tool status (Available vs Borrowed) and catalog filtering.
 *
 * Explains why a tool may still show "Available" after borrowing (quantity > 1)
 * and proves that when the last unit is borrowed, status becomes BORROWED and
 * the tool is returned by GET /api/tools and by GET /api/tools?status=BORROWED.
 *
 * Run: php artisan test tests/Feature/ToolStatusAndFilterTest.php
 */

use App\Models\BusinessHour;
use App\Models\Tool;
use App\Models\ToolAllocation;
use App\Models\ToolCategory;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
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

test('when tool has quantity 1 and user borrows it, DB status becomes BORROWED and GET /api/tools returns status BORROWED', function () {
    $user = User::factory()->create(['role' => 'USER']);
    Sanctum::actingAs($user);

    $category = ToolCategory::create(['name' => 'Office Equipment']);
    $printer = Tool::create([
        'name' => 'Printer',
        'description' => null,
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'AVAILABLE',
        'quantity' => 1,
    ]);

    expect($printer->status)->toBe('AVAILABLE');
    expect($printer->quantity)->toBe(1);

    $this->postJson('/api/tool-allocations', [
        'tool_id' => $printer->id,
        'user_id' => $user->id,
        'borrow_date' => now()->addDays(1)->toDateString(),
        'expected_return_date' => now()->addDays(3)->toDateString(),
        'note' => 'Print handouts',
    ])->assertCreated();

    $printer->refresh();
    expect($printer->status)->toBe('BORROWED');
    expect($printer->quantity)->toBe(0);

    $list = $this->getJson('/api/tools')->json('data');
    $found = collect($list)->firstWhere('id', $printer->id);
    expect($found)->not->toBeNull();
    expect($found['status'])->toBe('BORROWED');
});

test('when tool has quantity 2 and user borrows one, status stays AVAILABLE (explains printer still showing Available)', function () {
    $user = User::factory()->create(['role' => 'USER']);
    Sanctum::actingAs($user);

    $category = ToolCategory::create(['name' => 'Office Equipment']);
    $printer = Tool::create([
        'name' => 'Printer',
        'description' => null,
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'AVAILABLE',
        'quantity' => 2,
    ]);

    $this->postJson('/api/tool-allocations', [
        'tool_id' => $printer->id,
        'user_id' => $user->id,
        'borrow_date' => now()->addDays(1)->toDateString(),
        'expected_return_date' => now()->addDays(3)->toDateString(),
        'note' => 'Print handouts',
    ])->assertCreated();

    $printer->refresh();
    expect($printer->status)->toBe('AVAILABLE');
    expect($printer->quantity)->toBe(1);

    $list = $this->getJson('/api/tools')->json('data');
    $found = collect($list)->firstWhere('id', $printer->id);
    expect($found)->not->toBeNull();
    expect($found['status'])->toBe('AVAILABLE');
});

test('GET /api/tools?status=BORROWED returns only tools with status BORROWED in DB (catalog filter)', function () {
    $category = ToolCategory::create(['name' => 'Office Equipment']);

    $available = Tool::create([
        'name' => 'Available Printer',
        'description' => null,
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'AVAILABLE',
        'quantity' => 1,
    ]);

    $borrowed = Tool::create([
        'name' => 'Borrowed Printer',
        'description' => null,
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'BORROWED',
        'quantity' => 0,
    ]);

    $borrowedList = $this->getJson('/api/tools?status=BORROWED')->json('data');
    expect($borrowedList)->toHaveCount(1);
    expect($borrowedList[0]['id'])->toBe($borrowed->id);
    expect($borrowedList[0]['status'])->toBe('BORROWED');

    $availableList = $this->getJson('/api/tools?status=AVAILABLE')->json('data');
    $ids = collect($availableList)->pluck('id')->toArray();
    expect($ids)->toContain($available->id);
    expect($ids)->not->toContain($borrowed->id);
});

test('borrowed tool appears in BORROWED filter and not in AVAILABLE after allocation when quantity was 1', function () {
    $user = User::factory()->create(['role' => 'USER']);
    Sanctum::actingAs($user);

    $category = ToolCategory::create(['name' => 'Office Equipment']);
    $tool = Tool::create([
        'name' => 'Single Printer',
        'description' => null,
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'AVAILABLE',
        'quantity' => 1,
    ]);

    $this->postJson('/api/tool-allocations', [
        'tool_id' => $tool->id,
        'user_id' => $user->id,
        'borrow_date' => now()->addDays(1)->toDateString(),
        'expected_return_date' => now()->addDays(3)->toDateString(),
        'note' => 'Test',
    ])->assertCreated();

    $borrowedList = $this->getJson('/api/tools?status=BORROWED')->json('data');
    $foundBorrowed = collect($borrowedList)->firstWhere('id', $tool->id);
    expect($foundBorrowed)->not->toBeNull();
    expect($foundBorrowed['status'])->toBe('BORROWED');

    $availableList = $this->getJson('/api/tools?status=AVAILABLE')->json('data');
    $foundAvailable = collect($availableList)->firstWhere('id', $tool->id);
    expect($foundAvailable)->toBeNull();
});

test('GET /api/tools/{id} returns current status from DB (detail page uses this)', function () {
    $category = ToolCategory::create(['name' => 'Office Equipment']);
    $tool = Tool::create([
        'name' => 'Printer',
        'description' => null,
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'BORROWED',
        'quantity' => 0,
    ]);

    $res = $this->getJson('/api/tools/'.$tool->id);
    $res->assertOk();
    expect($res->json('data.id'))->toBe($tool->id);
    expect($res->json('data.status'))->toBe('BORROWED');
});
