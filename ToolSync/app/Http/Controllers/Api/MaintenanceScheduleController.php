<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMaintenanceScheduleRequest;
use App\Http\Requests\UpdateMaintenanceScheduleRequest;
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

        // Auto-flag overdue: any "scheduled" item whose date has passed.
        MaintenanceSchedule::query()
            ->where('status', 'scheduled')
            ->where('scheduled_date', '<', now()->startOfDay())
            ->update(['status' => 'overdue']);

        // Only block tools when maintenance start date has arrived (today or past)
        $toolIdsWithActive = MaintenanceSchedule::query()
            ->activeForMaintenance()
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
                'tool_id' => $m->tool_id,
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

    public function store(StoreMaintenanceScheduleRequest $request): JsonResponse
    {
        if (! Schema::hasTable('maintenance_schedules')) {
            return response()->json([
                'message' => 'Maintenance scheduling is not available. Run: php artisan migrate',
            ], 503);
        }

        $validated = $request->validated();

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

        // Only set MAINTENANCE if start date has arrived; otherwise tool stays borrowable
        if ($schedule->scheduled_date->lte(now()->startOfDay())) {
            Tool::query()->where('id', $schedule->tool_id)->update(['status' => 'MAINTENANCE']);
        }

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

    public function update(UpdateMaintenanceScheduleRequest $request, MaintenanceSchedule $maintenance_schedule): JsonResponse
    {
        $validated = $request->validated();

        $maintenance_schedule->update($validated);

        $toolId = $maintenance_schedule->tool_id;
        $newStatus = $validated['status'] ?? $maintenance_schedule->status;
        if ($newStatus === 'completed') {
            $hasOtherActive = MaintenanceSchedule::query()
                ->where('tool_id', $toolId)
                ->where('id', '!=', $maintenance_schedule->id)
                ->activeForMaintenance()
                ->exists();
            if (! $hasOtherActive) {
                Tool::query()->where('id', $toolId)->update(['status' => 'AVAILABLE']);
            }
        } else {
            $maintenance_schedule->refresh();
            $isActive = MaintenanceSchedule::query()
                ->where('id', $maintenance_schedule->id)
                ->activeForMaintenance()
                ->exists();
            if ($isActive) {
                Tool::query()->where('id', $toolId)->update(['status' => 'MAINTENANCE']);
            } else {
                $hasOtherActive = MaintenanceSchedule::query()
                    ->where('tool_id', $toolId)
                    ->where('id', '!=', $maintenance_schedule->id)
                    ->activeForMaintenance()
                    ->exists();
                if (! $hasOtherActive) {
                    Tool::query()->where('id', $toolId)->update(['status' => 'AVAILABLE']);
                }
            }
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
            ->activeForMaintenance()
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
