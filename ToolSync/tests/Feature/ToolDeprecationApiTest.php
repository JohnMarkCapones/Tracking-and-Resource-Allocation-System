<?php

use App\Models\Tool;
use App\Models\ToolCategory;
use App\Models\ToolDeprecation;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

function createAdminWithTools(): array
{
    $admin = User::factory()->create(['role' => 'ADMIN']);
    $category = ToolCategory::create(['name' => 'Deprecation Test Category']);

    $tool = Tool::create([
        'name' => 'Old Printer',
        'description' => 'Aging printer',
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'AVAILABLE',
        'quantity' => 1,
    ]);

    $replacement = Tool::create([
        'name' => 'New Printer',
        'description' => 'Modern replacement',
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'AVAILABLE',
        'quantity' => 2,
    ]);

    return [$admin, $tool, $replacement];
}

// -------------------------------------------------------------------------
// Authentication
// -------------------------------------------------------------------------

test('GET /api/tool-deprecations without auth returns 401', function () {
    $this->getJson('/api/tool-deprecations')->assertUnauthorized();
});

test('POST /api/tool-deprecations without auth returns 401', function () {
    $this->postJson('/api/tool-deprecations', [])->assertUnauthorized();
});

test('non-admin user cannot access tool deprecations', function () {
    $user = User::factory()->create(['role' => 'USER']);
    Sanctum::actingAs($user);

    $this->getJson('/api/tool-deprecations')->assertForbidden();
});

// -------------------------------------------------------------------------
// CRUD
// -------------------------------------------------------------------------

test('admin can list tool deprecations', function () {
    [$admin, $tool] = createAdminWithTools();
    Sanctum::actingAs($admin);

    ToolDeprecation::create([
        'tool_id' => $tool->id,
        'reason' => 'Too old',
        'retire_date' => now()->addMonth()->toDateString(),
        'status' => 'pending',
    ]);

    $this->getJson('/api/tool-deprecations')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.toolName', 'Old Printer')
        ->assertJsonPath('data.0.reason', 'Too old')
        ->assertJsonPath('data.0.status', 'pending');
});

test('admin can create a tool deprecation', function () {
    [$admin, $tool, $replacement] = createAdminWithTools();
    Sanctum::actingAs($admin);

    $retireDate = now()->addMonths(2)->toDateString();

    $response = $this->postJson('/api/tool-deprecations', [
        'tool_id' => $tool->id,
        'reason' => 'Frequent breakdowns',
        'retire_date' => $retireDate,
        'replacement_tool_id' => $replacement->id,
    ]);

    $response->assertCreated()
        ->assertJsonPath('message', 'Deprecation recorded.');

    $this->assertDatabaseHas('tool_deprecations', [
        'tool_id' => $tool->id,
        'reason' => 'Frequent breakdowns',
        'replacement_tool_id' => $replacement->id,
        'status' => 'pending',
    ]);
});

test('admin can create a deprecation without a replacement tool', function () {
    [$admin, $tool] = createAdminWithTools();
    Sanctum::actingAs($admin);

    $this->postJson('/api/tool-deprecations', [
        'tool_id' => $tool->id,
        'reason' => 'End of life',
        'retire_date' => now()->addMonth()->toDateString(),
    ])
        ->assertCreated();

    $this->assertDatabaseHas('tool_deprecations', [
        'tool_id' => $tool->id,
        'replacement_tool_id' => null,
    ]);
});

test('admin can update a tool deprecation', function () {
    [$admin, $tool] = createAdminWithTools();
    Sanctum::actingAs($admin);

    $deprecation = ToolDeprecation::create([
        'tool_id' => $tool->id,
        'reason' => 'Original reason',
        'retire_date' => now()->addMonth()->toDateString(),
        'status' => 'pending',
    ]);

    $this->putJson("/api/tool-deprecations/{$deprecation->id}", [
        'reason' => 'Updated reason',
        'status' => 'approved',
    ])
        ->assertOk()
        ->assertJsonPath('message', 'Deprecation updated.');

    $this->assertDatabaseHas('tool_deprecations', [
        'id' => $deprecation->id,
        'reason' => 'Updated reason',
        'status' => 'approved',
    ]);
});

test('admin can delete a tool deprecation', function () {
    [$admin, $tool] = createAdminWithTools();
    Sanctum::actingAs($admin);

    $deprecation = ToolDeprecation::create([
        'tool_id' => $tool->id,
        'reason' => 'To be removed',
        'retire_date' => now()->addMonth()->toDateString(),
        'status' => 'pending',
    ]);

    $this->deleteJson("/api/tool-deprecations/{$deprecation->id}")
        ->assertOk()
        ->assertJsonPath('message', 'Deprecation removed.');

    $this->assertDatabaseMissing('tool_deprecations', ['id' => $deprecation->id]);
});

// -------------------------------------------------------------------------
// Validation
// -------------------------------------------------------------------------

test('creating a deprecation with missing required fields returns 422', function () {
    [$admin] = createAdminWithTools();
    Sanctum::actingAs($admin);

    $this->postJson('/api/tool-deprecations', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['tool_id', 'reason', 'retire_date']);
});

test('creating a deprecation with invalid tool_id returns 422', function () {
    [$admin] = createAdminWithTools();
    Sanctum::actingAs($admin);

    $this->postJson('/api/tool-deprecations', [
        'tool_id' => 99999,
        'reason' => 'Test',
        'retire_date' => now()->addMonth()->toDateString(),
    ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['tool_id']);
});

test('updating a deprecation with invalid status returns 422', function () {
    [$admin, $tool] = createAdminWithTools();
    Sanctum::actingAs($admin);

    $deprecation = ToolDeprecation::create([
        'tool_id' => $tool->id,
        'reason' => 'Test',
        'retire_date' => now()->addMonth()->toDateString(),
        'status' => 'pending',
    ]);

    $this->putJson("/api/tool-deprecations/{$deprecation->id}", [
        'status' => 'invalid_status',
    ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['status']);
});

// -------------------------------------------------------------------------
// Status transitions
// -------------------------------------------------------------------------

test('deprecation can transition from pending to approved to retired', function () {
    [$admin, $tool] = createAdminWithTools();
    Sanctum::actingAs($admin);

    $deprecation = ToolDeprecation::create([
        'tool_id' => $tool->id,
        'reason' => 'Lifecycle complete',
        'retire_date' => now()->addMonth()->toDateString(),
        'status' => 'pending',
    ]);

    // pending -> approved
    $this->putJson("/api/tool-deprecations/{$deprecation->id}", ['status' => 'approved'])
        ->assertOk();

    $deprecation->refresh();
    expect($deprecation->status)->toBe('approved');

    // approved -> retired
    $this->putJson("/api/tool-deprecations/{$deprecation->id}", ['status' => 'retired'])
        ->assertOk();

    $deprecation->refresh();
    expect($deprecation->status)->toBe('retired');
});

// -------------------------------------------------------------------------
// Response structure
// -------------------------------------------------------------------------

test('deprecation response includes tool_id and replacement_tool_id for frontend forms', function () {
    [$admin, $tool, $replacement] = createAdminWithTools();
    Sanctum::actingAs($admin);

    ToolDeprecation::create([
        'tool_id' => $tool->id,
        'reason' => 'Outdated',
        'retire_date' => now()->addMonth()->toDateString(),
        'replacement_tool_id' => $replacement->id,
        'status' => 'pending',
    ]);

    $this->getJson('/api/tool-deprecations')
        ->assertOk()
        ->assertJsonStructure([
            'data' => [
                [
                    'id',
                    'tool_id',
                    'toolName',
                    'toolId',
                    'reason',
                    'retireDate',
                    'replacement_tool_id',
                    'replacementId',
                    'status',
                ],
            ],
        ])
        ->assertJsonPath('data.0.tool_id', $tool->id)
        ->assertJsonPath('data.0.replacement_tool_id', $replacement->id)
        ->assertJsonPath('data.0.replacementId', 'TL-'.$replacement->id);
});
