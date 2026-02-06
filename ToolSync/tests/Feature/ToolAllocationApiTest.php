<?php

use App\Models\Tool;
use App\Models\ToolCategory;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

test('tool allocation API supports create, list, update, and delete', function () {
    $borrower = User::factory()->create(['role' => 'USER']);
    $admin = User::factory()->create(['role' => 'ADMIN']);

    $category = ToolCategory::create([
        'name' => 'IT Equipment',
    ]);

    $tool = Tool::create([
        'name' => 'Laptop',
        'description' => 'Portable laptop for academic use',
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'AVAILABLE',
        'quantity' => 5,
    ]);

    $borrowDate = now()->subDay()->toDateTimeString();
    $expectedReturnDate = now()->addDay()->toDateTimeString();

    // Create (borrow)
    $createResponse = $this->postJson('/api/tool-allocations', [
        'tool_id' => $tool->id,
        'user_id' => $borrower->id,
        'borrow_date' => $borrowDate,
        'expected_return_date' => $expectedReturnDate,
        'note' => 'Borrow for class project',
    ]);

    $createResponse
        ->assertCreated()
        ->assertJsonStructure([
            'message',
            'data' => [
                'id',
                'tool_id',
                'user_id',
                'borrow_date',
                'expected_return_date',
                'note',
                'status',
                'created_at',
                'updated_at',
                'tool',
                'user',
            ],
        ]);

    $allocationId = $createResponse->json('data.id');

    $this->assertDatabaseHas('tool_allocations', [
        'id' => $allocationId,
        'tool_id' => $tool->id,
        'user_id' => $borrower->id,
        'status' => 'BORROWED',
    ]);

    // Tool inventory should decrement on borrow.
    $tool->refresh();
    expect($tool->quantity)->toBe(4);

    // List + filter
    $this->getJson('/api/tool-allocations?tool_id='.$tool->id.'&user_id='.$borrower->id.'&status=BORROWED')
        ->assertOk()
        ->assertJsonStructure([
            'data' => [
                ['id'],
            ],
        ]);

    // Update (return)
    $actualReturnDate = now()->toDateTimeString();

    Sanctum::actingAs($borrower);
    $this->putJson('/api/tool-allocations/'.$allocationId, [
        'status' => 'RETURNED',
        'actual_return_date' => $actualReturnDate,
    ])
        ->assertForbidden();

    Sanctum::actingAs($admin);
    $this->putJson('/api/tool-allocations/'.$allocationId, [
        'status' => 'RETURNED',
        'actual_return_date' => $actualReturnDate,
    ])->assertOk()
        ->assertJsonPath('data.id', $allocationId)
        ->assertJsonPath('data.status', 'RETURNED');

    $this->assertDatabaseHas('tool_allocations', [
        'id' => $allocationId,
        'status' => 'RETURNED',
    ]);

    // Tool inventory should restore on return.
    $tool->refresh();
    expect($tool->quantity)->toBe(5);

    // Delete
    $this->deleteJson('/api/tool-allocations/'.$allocationId)
        ->assertOk()
        ->assertJsonPath('message', 'Tool allocation deleted successfully.');

    $this->assertDatabaseMissing('tool_allocations', [
        'id' => $allocationId,
    ]);
});

test('borrowing the last available quantity sets tool status to BORROWED and return restores AVAILABLE', function () {
    $borrower = User::factory()->create(['role' => 'USER']);
    $admin = User::factory()->create(['role' => 'ADMIN']);

    $category = ToolCategory::create([
        'name' => 'Last Qty Category',
    ]);

    $tool = Tool::create([
        'name' => 'Single Item',
        'description' => null,
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'AVAILABLE',
        'quantity' => 1,
    ]);

    $borrow = $this->postJson('/api/tool-allocations', [
        'tool_id' => $tool->id,
        'user_id' => $borrower->id,
        'borrow_date' => now()->subHour()->toDateTimeString(),
        'expected_return_date' => now()->addDay()->toDateTimeString(),
    ])->assertCreated();

    $tool->refresh();
    expect($tool->quantity)->toBe(0);
    expect($tool->status)->toBe('BORROWED');

    $allocationId = $borrow->json('data.id');

    Sanctum::actingAs($admin);
    $this->putJson('/api/tool-allocations/'.$allocationId, [
        'status' => 'RETURNED',
    ])->assertOk();

    $tool->refresh();
    expect($tool->quantity)->toBe(1);
    expect($tool->status)->toBe('AVAILABLE');
});
