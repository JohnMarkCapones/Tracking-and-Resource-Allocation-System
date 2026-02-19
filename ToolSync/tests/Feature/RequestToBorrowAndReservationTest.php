<?php

/**
 * Tests for the "Request to Borrow" and "Request a Reservation" flow.
 *
 * Run from project root: php artisan test tests/Feature/RequestToBorrowAndReservationTest.php
 * Or: php artisan test --filter=RequestToBorrow
 *
 * These tests call the same API endpoints the frontend uses when the user
 * submits the RequestToolModal (POST /api/tool-allocations and POST /api/reservations).
 */

use App\Models\BusinessHour;
use App\Models\Reservation;
use App\Models\Tool;
use App\Models\ToolCategory;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    // DateValidationService requires business hours to be open; otherwise all days are "closed" and validation fails.
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

test('POST /api/tool-allocations without auth returns 401', function () {
    $user = User::factory()->create(['role' => 'USER']);
    $category = ToolCategory::create(['name' => 'IT']);
    $tool = Tool::create([
        'name' => 'Laptop',
        'description' => null,
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'AVAILABLE',
        'quantity' => 1,
    ]);

    $response = $this->postJson('/api/tool-allocations', [
        'tool_id' => $tool->id,
        'user_id' => $user->id,
        'borrow_date' => now()->addDays(1)->toDateString(),
        'expected_return_date' => now()->addDays(3)->toDateString(),
        'note' => 'For project',
    ]);

    $response->assertUnauthorized();
});

test('POST /api/tool-allocations with admin and valid payload returns 201', function () {
    $admin = User::factory()->create(['role' => 'ADMIN']);
    $user = User::factory()->create(['role' => 'USER']);
    Sanctum::actingAs($admin);

    $category = ToolCategory::create(['name' => 'Laptops']);
    $tool = Tool::create([
        'name' => 'MacBook Pro 14"',
        'description' => 'A powerful laptop.',
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'AVAILABLE',
        'quantity' => 2,
    ]);

    // Same payload shape as DetailPage handleRequestSubmit (YYYY-MM-DD dates)
    $borrowDate = now()->addDays(1)->toDateString();
    $endDate = now()->addDays(5)->toDateString();

    $response = $this->postJson('/api/tool-allocations', [
        'tool_id' => $tool->id,
        'user_id' => $user->id,
        'borrow_date' => $borrowDate,
        'expected_return_date' => $endDate,
        'note' => 'Design work and development',
    ]);

    $response->assertCreated()
        ->assertJsonPath('message', 'Tool allocation created successfully.')
        ->assertJsonPath('data.tool_id', $tool->id)
        ->assertJsonPath('data.user_id', $user->id)
        ->assertJsonPath('data.status', 'BORROWED')
        ->assertJsonPath('data.note', 'Design work and development');

    // API may return date as Y-m-d or full ISO; ensure the date part matches
    $resBorrow = $response->json('data.borrow_date');
    $resReturn = $response->json('data.expected_return_date');
    expect(str_starts_with($resBorrow, $borrowDate) || $resBorrow === $borrowDate)->toBeTrue();
    expect(str_starts_with($resReturn, $endDate) || $resReturn === $endDate)->toBeTrue();

    $this->assertDatabaseHas('tool_allocations', [
        'tool_id' => $tool->id,
        'user_id' => $user->id,
        'status' => 'BORROWED',
    ]);

    $tool->refresh();
    expect($tool->quantity)->toBe(1);
});

test('POST /api/tool-allocations as non-admin returns 403', function () {
    $user = User::factory()->create(['role' => 'USER']);
    Sanctum::actingAs($user);

    $category = ToolCategory::create(['name' => 'IT']);
    $tool = Tool::create([
        'name' => 'Laptop',
        'description' => null,
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'AVAILABLE',
        'quantity' => 1,
    ]);

    $response = $this->postJson('/api/tool-allocations', [
        'tool_id' => $tool->id,
        'user_id' => $user->id,
        'borrow_date' => now()->addDays(1)->toDateString(),
        'expected_return_date' => now()->addDays(3)->toDateString(),
        'note' => 'Test',
    ]);

    $response->assertForbidden();
});

test('POST /api/tool-allocations with invalid tool_id returns 422', function () {
    $admin = User::factory()->create(['role' => 'ADMIN']);
    $user = User::factory()->create(['role' => 'USER']);
    Sanctum::actingAs($admin);

    $response = $this->postJson('/api/tool-allocations', [
        'tool_id' => 99999,
        'user_id' => $user->id,
        'borrow_date' => now()->addDays(1)->toDateString(),
        'expected_return_date' => now()->addDays(3)->toDateString(),
        'note' => 'Test',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['tool_id']);
});

test('POST /api/tool-allocations when tool is not available returns 409', function () {
    $admin = User::factory()->create(['role' => 'ADMIN']);
    $user = User::factory()->create(['role' => 'USER']);
    Sanctum::actingAs($admin);

    $category = ToolCategory::create(['name' => 'IT']);
    $tool = Tool::create([
        'name' => 'Single Laptop',
        'description' => null,
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'BORROWED',
        'quantity' => 0,
    ]);

    $response = $this->postJson('/api/tool-allocations', [
        'tool_id' => $tool->id,
        'user_id' => $user->id,
        'borrow_date' => now()->addDays(1)->toDateString(),
        'expected_return_date' => now()->addDays(3)->toDateString(),
        'note' => 'Test',
    ]);

    $response->assertStatus(409);
    $message = $response->json('message');
    expect(
        str_contains($message, 'not available') ||
        str_contains($message, 'BORROWED') ||
        str_contains($message, 'not available for borrowing')
    )->toBeTrue();
});

test('POST /api/reservations without auth returns 401', function () {
    $category = ToolCategory::create(['name' => 'IT']);
    $tool = Tool::create([
        'name' => 'Laptop',
        'description' => null,
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'BORROWED',
        'quantity' => 0,
    ]);

    $response = $this->postJson('/api/reservations', [
        'tool_id' => $tool->id,
        'start_date' => now()->addDays(2)->toDateString(),
        'end_date' => now()->addDays(4)->toDateString(),
        'recurring' => false,
    ]);

    $response->assertUnauthorized();
});

test('POST /api/reservations with auth and valid payload (frontend format) returns 201', function () {
    $user = User::factory()->create(['role' => 'USER']);
    Sanctum::actingAs($user);

    $category = ToolCategory::create(['name' => 'Laptops']);
    $tool = Tool::create([
        'name' => 'Dell XPS 15',
        'description' => null,
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'AVAILABLE',
        'quantity' => 1, // Changed: tool must be available for reservation
    ]);

    // Same payload as DetailPage when tool.status === 'Available'
    $startDate = now()->addDays(2)->toDateString();
    $endDate = now()->addDays(5)->toDateString();

    $response = $this->postJson('/api/reservations', [
        'tool_id' => $tool->id,
        'start_date' => $startDate,
        'end_date' => $endDate,
        'recurring' => false,
    ]);

    $response->assertCreated()
        ->assertJsonPath('message', 'Borrow request submitted for approval.')
        ->assertJsonPath('data.tool_id', $tool->id)
        ->assertJsonPath('data.user_id', $user->id)
        ->assertJsonPath('data.status', 'PENDING');

    $this->assertDatabaseHas('reservations', [
        'tool_id' => $tool->id,
        'user_id' => $user->id,
        'status' => 'PENDING',
    ]);
});

test('POST /api/reservations/batch creates multiple borrow requests', function () {
    $user = User::factory()->create(['role' => 'USER']);
    Sanctum::actingAs($user);

    $category = ToolCategory::create(['name' => 'IT']);
    $tool1 = Tool::create([
        'name' => 'Laptop A',
        'description' => null,
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'AVAILABLE',
        'quantity' => 1,
    ]);
    $tool2 = Tool::create([
        'name' => 'Laptop B',
        'description' => null,
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'AVAILABLE',
        'quantity' => 1,
    ]);

    $startDate = now()->addDays(2)->toDateString();
    $endDate = now()->addDays(5)->toDateString();

    $response = $this->postJson('/api/reservations/batch', [
        'tool_ids' => [$tool1->id, $tool2->id],
        'start_date' => $startDate,
        'end_date' => $endDate,
    ]);

    $response->assertCreated()
        ->assertJsonPath('message', '2 borrow request(s) submitted for approval.');

    $data = $response->json('data');
    expect($data)->toHaveCount(2);

    $this->assertDatabaseHas('reservations', [
        'tool_id' => $tool1->id,
        'user_id' => $user->id,
        'status' => 'PENDING',
    ]);
    $this->assertDatabaseHas('reservations', [
        'tool_id' => $tool2->id,
        'user_id' => $user->id,
        'status' => 'PENDING',
    ]);
});

test('POST /api/reservations with invalid tool_id returns 422', function () {
    $user = User::factory()->create(['role' => 'USER']);
    Sanctum::actingAs($user);

    $response = $this->postJson('/api/reservations', [
        'tool_id' => 99999,
        'start_date' => now()->addDays(1)->toDateString(),
        'end_date' => now()->addDays(3)->toDateString(),
        'recurring' => false,
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['tool_id']);
});

test('full flow: borrow then reserve mirrors frontend behavior', function () {
    $admin = User::factory()->create(['role' => 'ADMIN']);
    $user = User::factory()->create(['role' => 'USER']);
    Sanctum::actingAs($admin);

    $category = ToolCategory::create(['name' => 'IT']);
    $tool = Tool::create([
        'name' => 'MacBook Pro 14"',
        'description' => null,
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'AVAILABLE',
        'quantity' => 1,
    ]);

    // 1) Admin directly creates allocation (POST /api/tool-allocations is admin-only)
    $borrowStart = now()->addDays(1)->toDateString();
    $borrowEnd = now()->addDays(4)->toDateString();

    $borrowRes = $this->postJson('/api/tool-allocations', [
        'tool_id' => $tool->id,
        'user_id' => $user->id,
        'borrow_date' => $borrowStart,
        'expected_return_date' => $borrowEnd,
        'note' => 'Project work',
    ]);

    $borrowRes->assertCreated();
    $tool->refresh();
    expect($tool->status)->toBe('BORROWED');
    expect($tool->quantity)->toBe(0);

    // 2) User tries to reserve (tool is BORROWED with quantity 0)
    Sanctum::actingAs($user);
    // Note: With new validation, tool must be AVAILABLE with quantity > 0 to create reservation
    // This test now verifies that BORROWED tools with quantity 0 cannot be reserved
    $reserveStart = now()->addDays(10)->toDateString();
    $reserveEnd = now()->addDays(12)->toDateString();

    $reserveRes = $this->postJson('/api/reservations', [
        'tool_id' => $tool->id,
        'start_date' => $reserveStart,
        'end_date' => $reserveEnd,
        'recurring' => false,
    ]);

    // Tool is BORROWED with quantity 0, so reservation should be rejected
    $reserveRes->assertStatus(409);
    expect($reserveRes->json('message'))->toContain('not available');
});
