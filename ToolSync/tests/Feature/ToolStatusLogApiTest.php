<?php

use App\Models\Tool;
use App\Models\ToolCategory;
use App\Models\User;

test('tool status logs support list, create, update, and delete', function () {
    $user = User::factory()->create();
    $category = ToolCategory::create(['name' => 'Test Category']);
    $tool = Tool::create([
        'name' => 'Test Tool',
        'description' => null,
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'AVAILABLE',
        'quantity' => 1,
    ]);

    // Create
    $create = $this->postJson('/api/tool-status-logs', [
        'tool_id' => $tool->id,
        'old_status' => 'AVAILABLE',
        'new_status' => 'MAINTENANCE',
        'changed_by' => $user->id,
    ]);

    $create->assertCreated()->assertJsonPath('data.tool_id', $tool->id);
    $logId = $create->json('data.id');

    // List
    $this->getJson('/api/tool-status-logs?tool_id='.$tool->id.'&per_page=10')
        ->assertOk()
        ->assertJsonStructure(['current_page', 'data', 'per_page', 'total']);

    // Update
    $this->putJson('/api/tool-status-logs/'.$logId, [
        'new_status' => 'BORROWED',
    ])->assertOk()->assertJsonPath('data.new_status', 'BORROWED');

    // Delete
    $this->deleteJson('/api/tool-status-logs/'.$logId)
        ->assertOk()
        ->assertJsonPath('message', 'Tool status log deleted successfully.');
});

test('updating a tool status creates a status log entry', function () {
    $category = ToolCategory::create(['name' => 'AutoLog Category']);
    $tool = Tool::create([
        'name' => 'AutoLog Tool',
        'description' => null,
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'AVAILABLE',
        'quantity' => 1,
    ]);

    $this->assertDatabaseCount('tool_status_logs', 0);

    $this->putJson('/api/tools/'.$tool->id, [
        'status' => 'MAINTENANCE',
    ])->assertOk()->assertJsonPath('data.status', 'MAINTENANCE');

    $this->assertDatabaseHas('tool_status_logs', [
        'tool_id' => $tool->id,
        'old_status' => 'AVAILABLE',
        'new_status' => 'MAINTENANCE',
    ]);
});
