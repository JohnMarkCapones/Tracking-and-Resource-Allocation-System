<?php

use App\Models\Tool;
use App\Models\ToolAllocation;
use App\Models\ToolCategory;
use App\Models\User;

test('dashboard endpoint returns counts, recent activity, and summary', function () {
    $user = User::factory()->create();

    $category = ToolCategory::create(['name' => 'Office Equipment']);

    $toolAvailable = Tool::create([
        'name' => 'Printer',
        'description' => null,
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'AVAILABLE',
        'quantity' => 10,
    ]);

    $toolMaintenance = Tool::create([
        'name' => 'Projector',
        'description' => null,
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'MAINTENANCE',
        'quantity' => 3,
    ]);

    // One overdue borrow for this user.
    ToolAllocation::create([
        'tool_id' => $toolAvailable->id,
        'user_id' => $user->id,
        'borrow_date' => now()->subDays(5),
        'expected_return_date' => now()->subDay(),
        'note' => 'Overdue borrow',
        'status' => 'BORROWED',
    ])->refresh();

    // One returned allocation.
    ToolAllocation::create([
        'tool_id' => $toolMaintenance->id,
        'user_id' => $user->id,
        'borrow_date' => now()->subDays(2),
        'expected_return_date' => now()->addDay(),
        'actual_return_date' => now()->subDay(),
        'note' => 'Returned borrow',
        'status' => 'RETURNED',
    ])->refresh();

    $res = $this->getJson('/api/dashboard?user_id='.$user->id.'&recent_limit=5&summary_days=30');

    $res->assertOk()
        ->assertJsonPath('data.counts.tools_available_quantity', 10)
        ->assertJsonPath('data.counts.tools_maintenance_quantity', 3)
        ->assertJsonPath('data.counts.borrowed_active_count', 1)
        ->assertJsonPath('data.counts.overdue_count', 1)
        ->assertJsonStructure([
            'data' => [
                'recent_activity' => [
                    ['id', 'tool_id', 'tool_name', 'user_id', 'user_name', 'expected_return_date', 'status', 'status_display', 'is_overdue'],
                ],
                'summary' => ['returned_count', 'not_returned_count', 'returned_percent', 'not_returned_percent', 'range_days'],
            ],
        ]);
});

test('history endpoint paginates and supports overdue filter', function () {
    $user = User::factory()->create();
    $category = ToolCategory::create(['name' => 'IT Equipment']);
    $tool = Tool::create([
        'name' => 'Laptop',
        'description' => null,
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'AVAILABLE',
        'quantity' => 1,
    ]);

    ToolAllocation::create([
        'tool_id' => $tool->id,
        'user_id' => $user->id,
        'borrow_date' => now()->subDays(3),
        'expected_return_date' => now()->subDay(),
        'status' => 'BORROWED',
    ])->refresh();

    $res = $this->getJson('/api/tool-allocations/history?user_id='.$user->id.'&overdue=1&per_page=10');

    $res->assertOk()
        ->assertJsonStructure([
            'current_page',
            'data' => [
                ['id', 'status', 'is_overdue', 'status_display', 'tool', 'user'],
            ],
            'per_page',
            'total',
        ])
        ->assertJsonPath('data.0.is_overdue', true)
        ->assertJsonPath('data.0.status_display', 'OVERDUE');
});

test('analytics overview returns timeseries and top tools', function () {
    $user = User::factory()->create();
    $category = ToolCategory::create(['name' => 'Multimedia']);
    $tool = Tool::create([
        'name' => 'Camera',
        'description' => null,
        'image_path' => null,
        'category_id' => $category->id,
        'status' => 'AVAILABLE',
        'quantity' => 1,
    ]);

    ToolAllocation::create([
        'tool_id' => $tool->id,
        'user_id' => $user->id,
        'borrow_date' => now()->subDays(1),
        'expected_return_date' => now()->addDays(2),
        'status' => 'BORROWED',
    ])->refresh();

    $res = $this->getJson('/api/analytics/overview?user_id='.$user->id.'&from='.now()->subDays(7)->toDateTimeString().'&to='.now()->toDateTimeString());

    $res->assertOk()
        ->assertJsonStructure([
            'data' => [
                'range' => ['from', 'to'],
                'timeseries' => ['borrowed', 'returned'],
                'top_tools' => [
                    ['tool_id', 'tool_name', 'borrow_count'],
                ],
                'status_breakdown' => ['borrowed', 'returned', 'overdue'],
            ],
        ]);
});
