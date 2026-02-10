<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MaintenanceSchedule;
use App\Models\Tool;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class MaintenanceScheduleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if (! Schema::hasTable('maintenance_schedules')) {
            return response()->json(['data' => [], 'meta' => ['table_missing' => 'maintenance_schedules']]);
        }

        $activeStatuses = ['scheduled', 'in_progress', 'overdue'];
        $toolIdsWithActive = MaintenanceSchedule::query()
            ->whereIn('status', $activeStatuses)
            ->pluck('tool_id')
            ->unique()
            ->values();
        Tool::query()->whereIn('id', $toolIdsWithActive)->update(['status' => 'MAINTENANCE']);
        $toolIdsWithNoActive = Tool::query()
            ->where('status', 'MAINTENANCE')
            ->whereNotIn('id', $toolIdsWithActive->all())
            ->pluck('id');
        if ($toolIdsWithNoActive->isNotEmpty()) {
            Tool::query()->whereIn('id', $toolIdsWithNoActive)->update(['status' => 'AVAILABLE']);
        }

        $query = MaintenanceSchedule::query()->with('tool.category');

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $schedules = $query->orderBy('scheduled_date')->get()->map(function (MaintenanceSchedule $m) {
            $tool = $m->tool;

            return [
                'id' => $m->id,
                'toolName' => $tool->name,
                'toolId' => 'TL-'.$tool->id,
                'type' => $m->type,
                'scheduledDate' => $m->scheduled_date->toDateString(),
                'completedDate' => $m->completed_date?->toDateString(),
                'assignee' => $m->assignee,
                'status' => $m->status,
                'notes' => $m->notes,
                'usageCount' => $m->usage_count,
                'triggerThreshold' => $m->trigger_threshold,
            ];
        });

        return response()->json(['data' => $schedules]);
    }

    public function store(Request $request): JsonResponse
    {
        if (! Schema::hasTable('maintenance_schedules')) {
            return response()->json([
                'message' => 'Maintenance scheduling is not available. Run: php artisan migrate',
            ], 503);
        }

        $validated = $request->validate([
            'tool_id' => ['required', 'integer', 'exists:tools,id'],
            'type' => ['required', 'string', 'in:routine,repair,inspection,calibration'],
            'scheduled_date' => ['required', 'date'],
            'assignee' => ['required', 'string', 'max:150'],
            'notes' => ['nullable', 'string'],
            'usage_count' => ['sometimes', 'integer', 'min:0'],
            'trigger_threshold' => ['sometimes', 'integer', 'min:1'],
        ]);

        $schedule = MaintenanceSchedule::create([
            'tool_id' => $validated['tool_id'],
            'type' => $validated['type'],
            'scheduled_date' => $validated['scheduled_date'],
            'assignee' => $validated['assignee'],
            'status' => 'scheduled',
            'notes' => $validated['notes'] ?? null,
            'usage_count' => $validated['usage_count'] ?? 0,
            'trigger_threshold' => $validated['trigger_threshold'] ?? 50,
        ]);

        Tool::query()->where('id', $schedule->tool_id)->update(['status' => 'MAINTENANCE']);

        ActivityLogger::log(
            'maintenance_schedule.created',
            'MaintenanceSchedule',
            $schedule->id,
            "Maintenance scheduled for tool #{$schedule->tool_id}.",
            ['tool_id' => $schedule->tool_id, 'type' => $schedule->type],
            $request->user()?->id
        );

        return response()->json([
            'message' => 'Maintenance scheduled.',
            'data' => $schedule->load('tool'),
        ], 201);
    }

    public function update(Request $request, MaintenanceSchedule $maintenance_schedule): JsonResponse
    {
        $validated = $request->validate([
            'scheduled_date' => ['sometimes', 'date'],
            'completed_date' => ['sometimes', 'nullable', 'date'],
            'assignee' => ['sometimes', 'string', 'max:150'],
            'status' => ['sometimes', 'string', 'in:scheduled,in_progress,completed,overdue'],
            'notes' => ['sometimes', 'nullable', 'string'],
        ]);

        $maintenance_schedule->update($validated);

        $toolId = $maintenance_schedule->tool_id;
        $newStatus = $validated['status'] ?? $maintenance_schedule->status;
        if ($newStatus === 'completed') {
            $hasOtherActive = MaintenanceSchedule::query()
                ->where('tool_id', $toolId)
                ->where('id', '!=', $maintenance_schedule->id)
                ->whereIn('status', ['scheduled', 'in_progress', 'overdue'])
                ->exists();
            if (! $hasOtherActive) {
                Tool::query()->where('id', $toolId)->update(['status' => 'AVAILABLE']);
            }
        } else {
            Tool::query()->where('id', $toolId)->update(['status' => 'MAINTENANCE']);
        }

        ActivityLogger::log(
            'maintenance_schedule.updated',
            'MaintenanceSchedule',
            $maintenance_schedule->id,
            "Maintenance schedule #{$maintenance_schedule->id} updated.",
            $validated,
            $request->user()?->id
        );

        return response()->json([
            'message' => 'Maintenance schedule updated.',
            'data' => $maintenance_schedule->fresh('tool'),
        ]);
    }

    public function destroy(MaintenanceSchedule $maintenance_schedule): JsonResponse
    {
        $toolId = $maintenance_schedule->tool_id;
        $scheduleId = $maintenance_schedule->id;
        $userId = request()->user()?->id;

        $maintenance_schedule->delete();

        $hasOtherActive = MaintenanceSchedule::query()
            ->where('tool_id', $toolId)
            ->whereIn('status', ['scheduled', 'in_progress', 'overdue'])
            ->exists();
        if (! $hasOtherActive) {
            Tool::query()->where('id', $toolId)->update(['status' => 'AVAILABLE']);
        }

        ActivityLogger::log(
            'maintenance_schedule.deleted',
            'MaintenanceSchedule',
            $scheduleId,
            "Maintenance schedule #{$scheduleId} for tool #{$toolId} removed.",
            ['tool_id' => $toolId],
            $userId
        );

        return response()->json(['message' => 'Maintenance schedule removed.']);
    }
}
