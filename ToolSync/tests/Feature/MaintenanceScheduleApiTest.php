<?php

use App\Models\MaintenanceSchedule;
use App\Models\Tool;
use App\Models\ToolCategory;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

function createAdminAndTool(): array
{
    $admin = User::factory()->create(['role' => 'ADMIN']);
    $category = ToolCategory::create(['name' => 'Test Category']);
    $tool = Tool::create([
        'name' => 'Test Drill',
        'description' => 'A power drill for testing',
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'AVAILABLE',
        'quantity' => 1,
    ]);

    return [$admin, $tool, $category];
}

// -------------------------------------------------------------------------
// Authentication
// -------------------------------------------------------------------------

test('GET /api/maintenance-schedules without auth returns 401', function () {
    $this->getJson('/api/maintenance-schedules')->assertUnauthorized();
});

test('POST /api/maintenance-schedules without auth returns 401', function () {
    $this->postJson('/api/maintenance-schedules', [])->assertUnauthorized();
});

test('non-admin user cannot access maintenance schedules', function () {
    $user = User::factory()->create(['role' => 'USER']);
    Sanctum::actingAs($user);

    $this->getJson('/api/maintenance-schedules')->assertForbidden();
});

// -------------------------------------------------------------------------
// CRUD
// -------------------------------------------------------------------------

test('admin can list maintenance schedules', function () {
    [$admin, $tool] = createAdminAndTool();
    Sanctum::actingAs($admin);

    MaintenanceSchedule::create([
        'tool_id' => $tool->id,
        'type' => 'routine',
        'scheduled_date' => now()->addDays(3)->toDateString(),
        'assignee' => 'Tech Team',
        'status' => 'scheduled',
        'usage_count' => 0,
        'trigger_threshold' => 50,
    ]);

    $this->getJson('/api/maintenance-schedules')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.toolName', 'Test Drill')
        ->assertJsonPath('data.0.type', 'routine')
        ->assertJsonPath('data.0.status', 'scheduled')
        ->assertJsonPath('data.0.assignee', 'Tech Team');
});

test('admin can create a maintenance schedule', function () {
    [$admin, $tool] = createAdminAndTool();
    Sanctum::actingAs($admin);

    $scheduledDate = now()->addDays(5)->toDateString();

    $response = $this->postJson('/api/maintenance-schedules', [
        'tool_id' => $tool->id,
        'type' => 'repair',
        'scheduled_date' => $scheduledDate,
        'assignee' => 'Maintenance Crew',
        'notes' => 'Motor needs replacement',
    ]);

    $response->assertCreated()
        ->assertJsonPath('message', 'Maintenance scheduled.');

    $this->assertDatabaseHas('maintenance_schedules', [
        'tool_id' => $tool->id,
        'type' => 'repair',
        'assignee' => 'Maintenance Crew',
        'status' => 'scheduled',
        'notes' => 'Motor needs replacement',
    ]);
});

test('admin can update a maintenance schedule', function () {
    [$admin, $tool] = createAdminAndTool();
    Sanctum::actingAs($admin);

    $schedule = MaintenanceSchedule::create([
        'tool_id' => $tool->id,
        'type' => 'routine',
        'scheduled_date' => now()->addDays(3)->toDateString(),
        'assignee' => 'Original Team',
        'status' => 'scheduled',
        'usage_count' => 0,
        'trigger_threshold' => 50,
    ]);

    $this->putJson("/api/maintenance-schedules/{$schedule->id}", [
        'assignee' => 'New Team',
        'status' => 'in_progress',
    ])
        ->assertOk()
        ->assertJsonPath('message', 'Maintenance schedule updated.');

    $this->assertDatabaseHas('maintenance_schedules', [
        'id' => $schedule->id,
        'assignee' => 'New Team',
        'status' => 'in_progress',
    ]);
});

test('admin can delete a maintenance schedule', function () {
    [$admin, $tool] = createAdminAndTool();
    Sanctum::actingAs($admin);

    $schedule = MaintenanceSchedule::create([
        'tool_id' => $tool->id,
        'type' => 'inspection',
        'scheduled_date' => now()->addDays(3)->toDateString(),
        'assignee' => 'Inspector',
        'status' => 'scheduled',
        'usage_count' => 0,
        'trigger_threshold' => 50,
    ]);

    $this->deleteJson("/api/maintenance-schedules/{$schedule->id}")
        ->assertOk()
        ->assertJsonPath('message', 'Maintenance schedule removed.');

    $this->assertDatabaseMissing('maintenance_schedules', ['id' => $schedule->id]);
});

// -------------------------------------------------------------------------
// Validation
// -------------------------------------------------------------------------

test('creating a schedule with missing required fields returns 422', function () {
    [$admin] = createAdminAndTool();
    Sanctum::actingAs($admin);

    $this->postJson('/api/maintenance-schedules', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['tool_id', 'type', 'scheduled_date', 'assignee']);
});

test('creating a schedule with invalid tool_id returns 422', function () {
    [$admin] = createAdminAndTool();
    Sanctum::actingAs($admin);

    $this->postJson('/api/maintenance-schedules', [
        'tool_id' => 99999,
        'type' => 'routine',
        'scheduled_date' => now()->addDays(1)->toDateString(),
        'assignee' => 'Team',
    ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['tool_id']);
});

test('creating a schedule with invalid type returns 422', function () {
    [$admin, $tool] = createAdminAndTool();
    Sanctum::actingAs($admin);

    $this->postJson('/api/maintenance-schedules', [
        'tool_id' => $tool->id,
        'type' => 'invalid_type',
        'scheduled_date' => now()->addDays(1)->toDateString(),
        'assignee' => 'Team',
    ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['type']);
});

// -------------------------------------------------------------------------
// Tool status sync
// -------------------------------------------------------------------------

test('creating a schedule sets tool status to MAINTENANCE', function () {
    [$admin, $tool] = createAdminAndTool();
    Sanctum::actingAs($admin);

    expect($tool->status)->toBe('AVAILABLE');

    $this->postJson('/api/maintenance-schedules', [
        'tool_id' => $tool->id,
        'type' => 'routine',
        'scheduled_date' => now()->addDays(5)->toDateString(),
        'assignee' => 'Team',
    ])->assertCreated();

    $tool->refresh();
    expect($tool->status)->toBe('MAINTENANCE');
});

test('completing the last active schedule restores tool to AVAILABLE', function () {
    [$admin, $tool] = createAdminAndTool();
    Sanctum::actingAs($admin);

    $schedule = MaintenanceSchedule::create([
        'tool_id' => $tool->id,
        'type' => 'routine',
        'scheduled_date' => now()->addDays(1)->toDateString(),
        'assignee' => 'Team',
        'status' => 'in_progress',
        'usage_count' => 0,
        'trigger_threshold' => 50,
    ]);

    $tool->update(['status' => 'MAINTENANCE']);

    $this->putJson("/api/maintenance-schedules/{$schedule->id}", [
        'status' => 'completed',
        'completed_date' => now()->toDateString(),
    ])->assertOk();

    $tool->refresh();
    expect($tool->status)->toBe('AVAILABLE');
});

// -------------------------------------------------------------------------
// Overdue auto-detection
// -------------------------------------------------------------------------

test('listing schedules auto-flags past-due items as overdue', function () {
    [$admin, $tool] = createAdminAndTool();
    Sanctum::actingAs($admin);

    $schedule = MaintenanceSchedule::create([
        'tool_id' => $tool->id,
        'type' => 'routine',
        'scheduled_date' => now()->subDays(3)->toDateString(),
        'assignee' => 'Late Team',
        'status' => 'scheduled',
        'usage_count' => 0,
        'trigger_threshold' => 50,
    ]);

    $this->getJson('/api/maintenance-schedules')
        ->assertOk()
        ->assertJsonPath('data.0.status', 'overdue');

    $schedule->refresh();
    expect($schedule->status)->toBe('overdue');
});

// -------------------------------------------------------------------------
// Response structure
// -------------------------------------------------------------------------

test('schedule response includes tool_id for frontend forms', function () {
    [$admin, $tool] = createAdminAndTool();
    Sanctum::actingAs($admin);

    MaintenanceSchedule::create([
        'tool_id' => $tool->id,
        'type' => 'calibration',
        'scheduled_date' => now()->addDays(2)->toDateString(),
        'assignee' => 'Lab',
        'status' => 'scheduled',
        'usage_count' => 10,
        'trigger_threshold' => 100,
    ]);

    $this->getJson('/api/maintenance-schedules')
        ->assertOk()
        ->assertJsonStructure([
            'data' => [
                [
                    'id',
                    'tool_id',
                    'toolName',
                    'toolId',
                    'type',
                    'scheduledDate',
                    'completedDate',
                    'assignee',
                    'status',
                    'notes',
                    'usageCount',
                    'triggerThreshold',
                ],
            ],
        ])
        ->assertJsonPath('data.0.tool_id', $tool->id)
        ->assertJsonPath('data.0.toolId', 'TL-'.$tool->id);
});
