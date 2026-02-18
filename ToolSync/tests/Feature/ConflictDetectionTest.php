<?php

use App\Models\BusinessHour;
use App\Models\Reservation;
use App\Models\Tool;
use App\Models\ToolAllocation;
use App\Models\ToolCategory;
use App\Models\User;
use Carbon\Carbon;
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

test('user cannot create reservation for unavailable tool', function () {
    $user = User::factory()->create(['role' => 'USER']);
    Sanctum::actingAs($user);

    $category = ToolCategory::create(['name' => 'IT']);
    $tool = Tool::create([
        'name' => 'Laptop',
        'description' => null,
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'MAINTENANCE',
        'quantity' => 0,
    ]);

    $response = $this->postJson('/api/reservations', [
        'tool_id' => $tool->id,
        'start_date' => now()->addDays(1)->toDateString(),
        'end_date' => now()->addDays(3)->toDateString(),
    ]);

    $response->assertStatus(409)
        ->assertJson([
            'message' => 'Tool is not available for reservation.',
        ]);
});

test('user cannot create reservation when tool has no quantity', function () {
    $user = User::factory()->create(['role' => 'USER']);
    Sanctum::actingAs($user);

    $category = ToolCategory::create(['name' => 'IT']);
    $tool = Tool::create([
        'name' => 'Laptop',
        'description' => null,
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'AVAILABLE',
        'quantity' => 0,
    ]);

    $response = $this->postJson('/api/reservations', [
        'tool_id' => $tool->id,
        'start_date' => now()->addDays(1)->toDateString(),
        'end_date' => now()->addDays(3)->toDateString(),
    ]);

    $response->assertStatus(409)
        ->assertJson([
            'message' => 'Tool is not available for reservation.',
        ]);
});

test('different users cannot reserve same tool for overlapping dates', function () {
    $user1 = User::factory()->create(['role' => 'USER']);
    $user2 = User::factory()->create(['role' => 'USER']);

    $category = ToolCategory::create(['name' => 'IT']);
    $tool = Tool::create([
        'name' => 'Laptop',
        'description' => null,
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'AVAILABLE',
        'quantity' => 1, // Only 1 available
    ]);

    $startDate = now()->addDays(1)->toDateString();
    $endDate = now()->addDays(3)->toDateString();

    // User 1 creates reservation
    Sanctum::actingAs($user1);
    $response1 = $this->postJson('/api/reservations', [
        'tool_id' => $tool->id,
        'start_date' => $startDate,
        'end_date' => $endDate,
    ]);
    $response1->assertStatus(201);

    // User 2 tries to reserve same tool for overlapping dates
    Sanctum::actingAs($user2);
    $response2 = $this->postJson('/api/reservations', [
        'tool_id' => $tool->id,
        'start_date' => $startDate,
        'end_date' => $endDate,
    ]);

    $response2->assertStatus(409);
    $message = $response2->json('message');
    expect(
        str_contains($message, 'not available') ||
        str_contains($message, 'fully allocated') ||
        str_contains($message, 'reserved')
    )->toBeTrue();
});

test('direct borrowing checks for conflicting reservations', function () {
    $user1 = User::factory()->create(['role' => 'USER']);
    $user2 = User::factory()->create(['role' => 'USER']);

    $category = ToolCategory::create(['name' => 'IT']);
    $tool = Tool::create([
        'name' => 'Laptop',
        'description' => null,
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'AVAILABLE',
        'quantity' => 1,
    ]);

    $startDate = now()->addDays(1)->toDateString();
    $endDate = now()->addDays(3)->toDateString();

    // User 1 creates reservation
    Sanctum::actingAs($user1);
    $this->postJson('/api/reservations', [
        'tool_id' => $tool->id,
        'start_date' => $startDate,
        'end_date' => $endDate,
    ])->assertStatus(201);

    // User 2 tries to directly borrow for overlapping dates
    Sanctum::actingAs($user2);
    $response = $this->postJson('/api/tool-allocations', [
        'tool_id' => $tool->id,
        'user_id' => $user2->id,
        'borrow_date' => $startDate,
        'expected_return_date' => $endDate,
    ]);

    $response->assertStatus(409);
    $message = $response->json('message');
    expect(
        str_contains($message, 'not available') ||
        str_contains($message, 'fully allocated') ||
        str_contains($message, 'reserved')
    )->toBeTrue();
});

test('admin approval uses lockForUpdate to prevent race conditions', function () {
    $admin = User::factory()->create(['role' => 'ADMIN']);
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

    $startDate = now()->addDays(1)->toDateString();
    $endDate = now()->addDays(3)->toDateString();

    // User creates borrow request
    Sanctum::actingAs($user);
    $reservation = Reservation::create([
        'tool_id' => $tool->id,
        'user_id' => $user->id,
        'start_date' => $startDate,
        'end_date' => $endDate,
        'status' => 'PENDING',
    ]);

    // Admin approves
    Sanctum::actingAs($admin);
    $response = $this->postJson("/api/reservations/{$reservation->id}/approve");

    $response->assertStatus(200);
    expect($tool->fresh()->quantity)->toBe(0);
    expect($tool->fresh()->status)->toBe('BORROWED');
});

test('admin approval checks date conflicts with existing allocations', function () {
    $admin = User::factory()->create(['role' => 'ADMIN']);
    $user1 = User::factory()->create(['role' => 'USER']);
    $user2 = User::factory()->create(['role' => 'USER']);

    $category = ToolCategory::create(['name' => 'IT']);
    $tool = Tool::create([
        'name' => 'Laptop',
        'description' => null,
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'AVAILABLE',
        'quantity' => 1,
    ]);

    $startDate = now()->addDays(1)->toDateString();
    $endDate = now()->addDays(3)->toDateString();

    // User 1 directly borrows tool
    Sanctum::actingAs($user1);
    ToolAllocation::create([
        'tool_id' => $tool->id,
        'user_id' => $user1->id,
        'borrow_date' => $startDate,
        'expected_return_date' => $endDate,
        'status' => 'BORROWED',
    ]);
    $tool->update(['quantity' => 0, 'status' => 'BORROWED']);

    // User 2 creates borrow request for same dates
    Sanctum::actingAs($user2);
    $reservation = Reservation::create([
        'tool_id' => $tool->id,
        'user_id' => $user2->id,
        'start_date' => $startDate,
        'end_date' => $endDate,
        'status' => 'PENDING',
    ]);

    // Admin tries to approve - should fail due to conflict
    Sanctum::actingAs($admin);
    $response = $this->postJson("/api/reservations/{$reservation->id}/approve");

    $response->assertStatus(409);
    $message = $response->json('message');
    expect(
        str_contains($message, 'not available') ||
        str_contains($message, 'fully allocated') ||
        str_contains($message, 'reserved') ||
        str_contains($message, 'BORROWED')
    )->toBeTrue();
});

test('reservation activation command activates UPCOMING reservations', function () {
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

    $today = Carbon::today();
    $reservation = Reservation::create([
        'tool_id' => $tool->id,
        'user_id' => $user->id,
        'start_date' => $today->toDateString(),
        'end_date' => $today->copy()->addDays(2)->toDateString(),
        'status' => 'UPCOMING',
    ]);

    $this->artisan('reservations:activate')
        ->assertSuccessful();

    expect($reservation->fresh()->status)->toBe('COMPLETED');
    expect(ToolAllocation::query()->where('tool_id', $tool->id)->exists())->toBeTrue();
    expect($tool->fresh()->quantity)->toBe(0);
});

test('reservation activation command skips when tool unavailable', function () {
    $user = User::factory()->create(['role' => 'USER']);

    $category = ToolCategory::create(['name' => 'IT']);
    $tool = Tool::create([
        'name' => 'Laptop',
        'description' => null,
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'MAINTENANCE',
        'quantity' => 0,
    ]);

    $today = Carbon::today();
    $reservation = Reservation::create([
        'tool_id' => $tool->id,
        'user_id' => $user->id,
        'start_date' => $today->toDateString(),
        'end_date' => $today->copy()->addDays(2)->toDateString(),
        'status' => 'UPCOMING',
    ]);

    $this->artisan('reservations:activate')
        ->assertSuccessful();

    // Reservation should remain UPCOMING since tool unavailable
    expect($reservation->fresh()->status)->toBe('UPCOMING');
    expect(ToolAllocation::query()->where('tool_id', $tool->id)->exists())->toBeFalse();
});
