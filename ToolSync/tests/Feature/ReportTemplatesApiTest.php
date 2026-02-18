<?php

use App\Models\ReportTemplate;
use App\Models\User;

test('admin can create and list report templates', function () {
    $user = User::factory()->create([
        'role' => 'ADMIN',
    ]);

    $this->actingAs($user, 'sanctum');

    $payload = [
        'name' => 'Monthly Borrowing Summary',
        'report_type' => 'borrowing_summary',
        'columns' => ['tool_name', 'borrower_name', 'borrow_date'],
        'schedule' => 'Monthly',
    ];

    $createRes = $this->postJson('/api/report-templates', $payload);

    $createRes->assertCreated()
        ->assertJsonPath('data.name', $payload['name'])
        ->assertJsonPath('data.report_type', $payload['report_type'])
        ->assertJsonPath('data.schedule', $payload['schedule'])
        ->assertJsonPath('data.columns', $payload['columns']);

    $template = ReportTemplate::first();
    expect($template)->not()->toBeNull();
    expect($template->user_id)->toBe($user->id);

    $listRes = $this->getJson('/api/report-templates');

    $listRes->assertOk()
        ->assertJsonStructure([
            'data' => [
                [
                    'id',
                    'name',
                    'report_type',
                    'schedule',
                    'last_generated_at',
                    'columns',
                ],
            ],
        ])
        ->assertJsonPath('data.0.id', $template->id);
});

test('admin can update last generated timestamp on template', function () {
    $user = User::factory()->create([
        'role' => 'ADMIN',
    ]);

    $template = ReportTemplate::query()->create([
        'user_id' => $user->id,
        'name' => 'Overdue Items Report',
        'report_type' => 'overdue_report',
        'schedule' => 'Weekly',
        'columns' => ['tool_name', 'borrower_name', 'overdue_days'],
        'last_generated_at' => null,
    ]);

    $this->actingAs($user, 'sanctum');

    $nowIso = now()->toIso8601String();

    $updateRes = $this->patchJson('/api/report-templates/'.$template->id, [
        'last_generated_at' => $nowIso,
    ]);

    $updateRes->assertOk()
        ->assertJsonPath('data.last_generated_at', $nowIso);

    $template->refresh();
    expect($template->last_generated_at?->toIso8601String())->toBe($nowIso);
});
