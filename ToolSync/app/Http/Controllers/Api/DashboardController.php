<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tool;
use App\Models\ToolAllocation;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        /** @var User|null $actor */
        $actor = $request->user();

        $userId = $actor?->id ?? ($request->filled('user_id') ? (int) $request->input('user_id') : null);
        $recentLimit = (int) ($request->input('recent_limit', 5));
        $recentLimit = max(1, min($recentLimit, 50));

        $toolsAvailableQty = (int) Tool::query()->where('status', 'AVAILABLE')->sum('quantity');
        $toolsMaintenanceQty = (int) Tool::query()->where('status', 'MAINTENANCE')->sum('quantity');

        $activeBorrowQuery = ToolAllocation::query()->where('status', 'BORROWED');
        if ($userId) {
            $activeBorrowQuery->where('user_id', $userId);
        }
        $borrowedActiveCount = (int) $activeBorrowQuery->count();
        $overdueCount = (int) (clone $activeBorrowQuery)
            ->where('expected_return_date', '<', now())
            ->count();

        $recentAllocationsQuery = ToolAllocation::query()
            ->with(['tool:id,name', 'user:id,name,email'])
            ->orderByDesc('borrow_date');
        if ($userId) {
            $recentAllocationsQuery->where('user_id', $userId);
        }

        $recentAllocations = $recentAllocationsQuery
            ->limit($recentLimit)
            ->get()
            ->map(function (ToolAllocation $a): array {
                $expected = $a->expected_return_date;
                $isOverdue = $a->status === 'BORROWED'
                    && ! empty($expected)
                    && Carbon::parse($expected)->isPast();

                $statusDisplay = $isOverdue ? 'OVERDUE' : $a->status;

                return [
                    'id' => $a->id,
                    'tool_id' => $a->tool_id,
                    'tool_name' => $a->tool?->name,
                    'user_id' => $a->user_id,
                    'user_name' => $a->user?->name,
                    'expected_return_date' => $a->expected_return_date,
                    'status' => $a->status,
                    'status_display' => $statusDisplay,
                    'is_overdue' => $isOverdue,
                ];
            });

        // Summary donut: returned vs not-yet-returned (borrowed), in last 30 days by default.
        $days = (int) ($request->input('summary_days', 30));
        $days = max(1, min($days, 365));
        $from = now()->subDays($days);

        $summaryQuery = ToolAllocation::query()->where('borrow_date', '>=', $from);
        if ($userId) {
            $summaryQuery->where('user_id', $userId);
        }

        $returnedCount = (int) (clone $summaryQuery)->where('status', 'RETURNED')->count();
        $notReturnedCount = (int) (clone $summaryQuery)->where('status', 'BORROWED')->count();
        $summaryTotal = max(1, $returnedCount + $notReturnedCount);
        $returnedPercent = (int) round(($returnedCount / $summaryTotal) * 100);
        $notReturnedPercent = 100 - $returnedPercent;

        return response()->json([
            'data' => [
                'scope' => [
                    'user_id' => $userId,
                ],
                'counts' => [
                    'tools_available_quantity' => $toolsAvailableQty,
                    'tools_maintenance_quantity' => $toolsMaintenanceQty,
                    'borrowed_active_count' => $borrowedActiveCount,
                    'overdue_count' => $overdueCount,
                ],
                'recent_activity' => $recentAllocations,
                'summary' => [
                    'returned_count' => $returnedCount,
                    'not_returned_count' => $notReturnedCount,
                    'returned_percent' => $returnedPercent,
                    'not_returned_percent' => $notReturnedPercent,
                    'range_days' => $days,
                ],
            ],
        ]);
    }
}
