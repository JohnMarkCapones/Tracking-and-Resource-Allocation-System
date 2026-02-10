<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MaintenanceSchedule;
use App\Models\Tool;
use App\Models\ToolAllocation;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class ReportController extends Controller
{
    private const REPORT_TYPES = [
        'borrowing_summary',
        'tool_utilization',
        'user_activity',
        'overdue_report',
        'maintenance_log',
        'custom',
    ];

    private const ALLOWED_COLUMNS = [
        'tool_name',
        'tool_id',
        'category',
        'status',
        'condition',
        'borrower_name',
        'borrower_email',
        'department',
        'borrow_date',
        'return_date',
        'duration',
        'borrow_status',
        'overdue_days',
        'maintenance_date',
        'maintenance_type',
        'usage_count',
        'utilization_rate',
    ];

    public function data(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'report_type' => ['nullable', 'string', 'in:'.implode(',', self::REPORT_TYPES)],
            'columns' => ['required', 'array', 'min:1'],
            'columns.*' => ['string', 'in:'.implode(',', self::ALLOWED_COLUMNS)],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:5000'],
        ]);

        $reportType = (string) ($validated['report_type'] ?? 'borrowing_summary');
        $columns = array_values(array_unique($validated['columns']));
        $from = isset($validated['from']) ? Carbon::parse($validated['from'])->startOfDay() : now()->subDays(30)->startOfDay();
        $to = isset($validated['to']) ? Carbon::parse($validated['to'])->endOfDay() : now()->endOfDay();
        $limit = (int) ($validated['limit'] ?? 500);

        if ($from->gt($to)) {
            [$from, $to] = [$to->copy()->startOfDay(), $from->copy()->endOfDay()];
        }

        $rows = match ($reportType) {
            'tool_utilization' => $this->buildToolUtilizationRows($from, $to, $limit),
            'maintenance_log' => $this->buildMaintenanceRows($from, $to, $limit),
            default => $this->buildAllocationRows($reportType, $from, $to, $limit),
        };

        $filteredRows = array_map(
            fn (array $row): array => $this->pickColumns($row, $columns),
            $rows
        );

        return response()->json([
            'data' => $filteredRows,
            'meta' => [
                'report_type' => $reportType,
                'columns' => $columns,
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
                'count' => count($filteredRows),
            ],
        ]);
    }

    /**
     * @return array<int, array<string, string|int>>
     */
    private function buildAllocationRows(string $reportType, Carbon $from, Carbon $to, int $limit): array
    {
        $query = ToolAllocation::query()
            ->with(['tool.category', 'user.department'])
            ->whereBetween('borrow_date', [$from, $to])
            ->orderByDesc('borrow_date');

        if ($reportType === 'overdue_report') {
            $query
                ->where('status', 'BORROWED')
                ->where('expected_return_date', '<', now());
        }

        if ($reportType === 'user_activity') {
            $query->orderBy('user_id')->orderByDesc('borrow_date');
        }

        $allocations = $query->limit($limit)->get();

        if ($allocations->isEmpty()) {
            return [];
        }

        $toolIds = $allocations->pluck('tool_id')->filter()->unique()->values()->all();
        $usageCountByTool = $this->buildUsageCountMap($toolIds, $from, $to);
        $utilizationByTool = $this->buildUtilizationMap($toolIds, $from, $to);
        $latestMaintenanceByTool = $this->latestMaintenanceByTool($toolIds);

        return $allocations->map(function (ToolAllocation $allocation) use ($usageCountByTool, $utilizationByTool, $latestMaintenanceByTool): array {
            $tool = $allocation->tool;
            $user = $allocation->user;
            [$borrowStatus, $overdueDays] = $this->deriveBorrowingStatus($allocation);

            $borrowDate = Carbon::parse($allocation->borrow_date);
            $endForDuration = $allocation->actual_return_date ? Carbon::parse($allocation->actual_return_date) : now();
            $duration = max(0, $borrowDate->diffInDays($endForDuration));
            $toolId = (int) $allocation->tool_id;
            $maintenance = $latestMaintenanceByTool[$toolId] ?? null;

            return [
                'tool_name' => (string) ($tool?->name ?? ''),
                'tool_id' => $this->formatToolIdentifier($toolId),
                'category' => (string) ($tool?->category?->name ?? ''),
                'status' => $this->formatToolStatus((string) ($tool?->status ?? '')),
                'condition' => $this->deriveCondition((string) ($tool?->status ?? '')),
                'borrower_name' => (string) ($user?->name ?? ''),
                'borrower_email' => (string) ($user?->email ?? ''),
                'department' => (string) ($user?->department?->name ?? ''),
                'borrow_date' => $borrowDate->toDateString(),
                'return_date' => $allocation->actual_return_date ? Carbon::parse($allocation->actual_return_date)->toDateString() : '',
                'duration' => $duration,
                'borrow_status' => $borrowStatus,
                'overdue_days' => $overdueDays,
                'maintenance_date' => $maintenance?->scheduled_date ? Carbon::parse($maintenance->scheduled_date)->toDateString() : '',
                'maintenance_type' => (string) ($maintenance?->type ?? ''),
                'usage_count' => (int) ($usageCountByTool[$toolId] ?? 0),
                'utilization_rate' => $this->formatPercent((float) ($utilizationByTool[$toolId] ?? 0.0)),
            ];
        })->all();
    }

    /**
     * @return array<int, array<string, string|int>>
     */
    private function buildToolUtilizationRows(Carbon $from, Carbon $to, int $limit): array
    {
        $tools = Tool::query()
            ->with('category')
            ->orderBy('name')
            ->limit($limit)
            ->get();

        if ($tools->isEmpty()) {
            return [];
        }

        $toolIds = $tools->pluck('id')->all();
        $usageCountByTool = $this->buildUsageCountMap($toolIds, $from, $to);
        $utilizationByTool = $this->buildUtilizationMap($toolIds, $from, $to);
        $latestMaintenanceByTool = $this->latestMaintenanceByTool($toolIds);

        return $tools->map(function (Tool $tool) use ($usageCountByTool, $utilizationByTool, $latestMaintenanceByTool): array {
            $toolId = (int) $tool->id;
            $maintenance = $latestMaintenanceByTool[$toolId] ?? null;

            return [
                'tool_name' => (string) $tool->name,
                'tool_id' => $this->formatToolIdentifier($toolId),
                'category' => (string) ($tool->category?->name ?? ''),
                'status' => $this->formatToolStatus((string) $tool->status),
                'condition' => $this->deriveCondition((string) $tool->status),
                'borrower_name' => '',
                'borrower_email' => '',
                'department' => '',
                'borrow_date' => '',
                'return_date' => '',
                'duration' => 0,
                'borrow_status' => '',
                'overdue_days' => 0,
                'maintenance_date' => $maintenance?->scheduled_date ? Carbon::parse($maintenance->scheduled_date)->toDateString() : '',
                'maintenance_type' => (string) ($maintenance?->type ?? ''),
                'usage_count' => (int) ($usageCountByTool[$toolId] ?? 0),
                'utilization_rate' => $this->formatPercent((float) ($utilizationByTool[$toolId] ?? 0.0)),
            ];
        })->all();
    }

    /**
     * @return array<int, array<string, string|int>>
     */
    private function buildMaintenanceRows(Carbon $from, Carbon $to, int $limit): array
    {
        if (! Schema::hasTable('maintenance_schedules')) {
            return [];
        }

        $rows = MaintenanceSchedule::query()
            ->with('tool.category')
            ->whereBetween('scheduled_date', [$from->toDateString(), $to->toDateString()])
            ->orderByDesc('scheduled_date')
            ->limit($limit)
            ->get();

        if ($rows->isEmpty()) {
            return [];
        }

        $toolIds = $rows->pluck('tool_id')->filter()->unique()->values()->all();
        $usageCountByTool = $this->buildUsageCountMap($toolIds, $from, $to);
        $utilizationByTool = $this->buildUtilizationMap($toolIds, $from, $to);

        return $rows->map(function (MaintenanceSchedule $item) use ($usageCountByTool, $utilizationByTool): array {
            $tool = $item->tool;
            $toolId = (int) $item->tool_id;

            return [
                'tool_name' => (string) ($tool?->name ?? ''),
                'tool_id' => $this->formatToolIdentifier($toolId),
                'category' => (string) ($tool?->category?->name ?? ''),
                'status' => $this->formatToolStatus((string) ($tool?->status ?? '')),
                'condition' => $this->deriveCondition((string) ($tool?->status ?? '')),
                'borrower_name' => '',
                'borrower_email' => '',
                'department' => '',
                'borrow_date' => '',
                'return_date' => '',
                'duration' => 0,
                'borrow_status' => '',
                'overdue_days' => 0,
                'maintenance_date' => $item->scheduled_date ? Carbon::parse($item->scheduled_date)->toDateString() : '',
                'maintenance_type' => (string) $item->type,
                'usage_count' => (int) ($usageCountByTool[$toolId] ?? 0),
                'utilization_rate' => $this->formatPercent((float) ($utilizationByTool[$toolId] ?? 0.0)),
            ];
        })->all();
    }

    /**
     * @param  array<int, int>  $toolIds
     * @return array<int, int>
     */
    private function buildUsageCountMap(array $toolIds, Carbon $from, Carbon $to): array
    {
        if ($toolIds === []) {
            return [];
        }

        return ToolAllocation::query()
            ->selectRaw('tool_id, COUNT(*) as usage_count')
            ->whereIn('tool_id', $toolIds)
            ->whereBetween('borrow_date', [$from, $to])
            ->groupBy('tool_id')
            ->pluck('usage_count', 'tool_id')
            ->map(fn ($count) => (int) $count)
            ->all();
    }

    /**
     * @param  array<int, int>  $toolIds
     * @return array<int, MaintenanceSchedule>
     */
    private function latestMaintenanceByTool(array $toolIds): array
    {
        if ($toolIds === [] || ! Schema::hasTable('maintenance_schedules')) {
            return [];
        }

        return MaintenanceSchedule::query()
            ->whereIn('tool_id', $toolIds)
            ->orderByDesc('scheduled_date')
            ->orderByDesc('id')
            ->get()
            ->groupBy('tool_id')
            ->map(fn ($items) => $items->first())
            ->all();
    }

    /**
     * @param  array<int, int>  $toolIds
     * @return array<int, float>
     */
    private function buildUtilizationMap(array $toolIds, Carbon $from, Carbon $to): array
    {
        if ($toolIds === []) {
            return [];
        }

        $rangeDays = max(1, $from->copy()->startOfDay()->diffInDays($to->copy()->endOfDay()) + 1);
        $daysUsedByTool = array_fill_keys($toolIds, 0);

        $allocations = ToolAllocation::query()
            ->whereIn('tool_id', $toolIds)
            ->where('borrow_date', '<=', $to)
            ->where(function ($query) use ($from): void {
                $query->whereNull('actual_return_date')
                    ->orWhere('actual_return_date', '>=', $from);
            })
            ->get(['tool_id', 'borrow_date', 'actual_return_date']);

        foreach ($allocations as $allocation) {
            $toolId = (int) $allocation->tool_id;
            $start = Carbon::parse($allocation->borrow_date)->startOfDay()->greaterThan($from) ? Carbon::parse($allocation->borrow_date)->startOfDay() : $from->copy()->startOfDay();
            $endCandidate = $allocation->actual_return_date ? Carbon::parse($allocation->actual_return_date)->endOfDay() : $to->copy()->endOfDay();
            $end = $endCandidate->lessThan($to) ? $endCandidate : $to->copy()->endOfDay();

            if ($end->lt($start)) {
                continue;
            }

            $daysUsedByTool[$toolId] += $start->diffInDays($end) + 1;
        }

        $result = [];
        foreach ($toolIds as $toolId) {
            $daysUsed = (int) ($daysUsedByTool[$toolId] ?? 0);
            $result[$toolId] = round(($daysUsed / $rangeDays) * 100, 2);
        }

        return $result;
    }

    /**
     * @return array{0: string, 1: int}
     */
    private function deriveBorrowingStatus(ToolAllocation $allocation): array
    {
        if ($allocation->status === 'RETURNED') {
            return ['Returned', 0];
        }

        $expected = Carbon::parse(substr((string) $allocation->getRawOriginal('expected_return_date'), 0, 10))->endOfDay();
        if ($expected->isPast()) {
            $overdueDays = $expected->copy()->startOfDay()->diffInDays(now()->startOfDay());

            return ['Overdue', max(1, $overdueDays)];
        }

        return ['Active', 0];
    }

    /**
     * @param  array<string, string|int>  $row
     * @param  array<int, string>  $columns
     * @return array<string, string|int>
     */
    private function pickColumns(array $row, array $columns): array
    {
        $picked = [];
        foreach ($columns as $column) {
            $picked[$column] = $row[$column] ?? '';
        }

        return $picked;
    }

    private function formatToolIdentifier(int $toolId): string
    {
        return 'TL-'.str_pad((string) $toolId, 4, '0', STR_PAD_LEFT);
    }

    private function formatToolStatus(string $status): string
    {
        return match ($status) {
            'AVAILABLE' => 'Available',
            'BORROWED' => 'Borrowed',
            'MAINTENANCE' => 'Maintenance',
            default => $status !== '' ? ucfirst(strtolower($status)) : '',
        };
    }

    private function deriveCondition(string $status): string
    {
        return match ($status) {
            'MAINTENANCE' => 'Needs Maintenance',
            'BORROWED' => 'In Use',
            default => 'Good',
        };
    }

    private function formatPercent(float $value): string
    {
        return number_format($value, 2).' %';
    }
}
