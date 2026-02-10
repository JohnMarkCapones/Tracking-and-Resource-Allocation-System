<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MaintenanceSchedule;
use App\Models\Reservation;
use App\Models\Tool;
use App\Models\ToolAllocation;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

/**
 * @group Dashboard
 *
 * APIs for dashboard statistics and overview data
 */
class DashboardController extends Controller
{
    /**
     * Get dashboard overview
     *
     * Get dashboard statistics including tool counts, recent activity, and summary.
     *
     * @queryParam user_id int Filter data by user ID. Example: 1
     * @queryParam recent_limit int Number of recent allocations to return (1-50). Example: 5
     * @queryParam summary_days int Number of days for summary calculation (1-365). Example: 30
     *
     * @response 200 {
     *   "data": {
     *     "scope": {
     *       "user_id": null
     *     },
     *     "counts": {
     *       "tools_available_quantity": 25,
     *       "tools_maintenance_quantity": 3,
     *       "borrowed_active_count": 10,
     *       "overdue_count": 2
     *     },
     *     "recent_activity": [
     *       {
     *         "id": 1,
     *         "tool_id": 1,
     *         "tool_name": "Laptop",
     *         "user_id": 1,
     *         "user_name": "John Doe",
     *         "expected_return_date": "2026-02-05",
     *         "status": "BORROWED",
     *         "status_display": "BORROWED",
     *         "is_overdue": false
     *       }
     *     ],
     *     "summary": {
     *       "returned_count": 15,
     *       "not_returned_count": 10,
     *       "returned_percent": 60,
     *       "not_returned_percent": 40,
     *       "range_days": 30
     *     }
     *   }
     * }
     */
    public function show(Request $request): JsonResponse
    {
        /** @var User|null $actor */
        $actor = $request->user();

        $userId = $actor?->id ?? ($request->filled('user_id') ? (int) $request->input('user_id') : null);
        $recentLimit = (int) ($request->input('recent_limit', 5));
        $recentLimit = max(1, min($recentLimit, 50));

        $toolsAvailableQty = (int) Tool::query()->where('status', 'AVAILABLE')->sum('quantity');
        $toolsMaintenanceQty = (int) Tool::query()->where('status', 'MAINTENANCE')->sum('quantity');
        // Borrowed tools have quantity 0 when out; count tools in BORROWED status (not sum(quantity) which would be 0)
        $toolsBorrowedCount = (int) Tool::query()->where('status', 'BORROWED')->count();

        $activeBorrowQuery = ToolAllocation::query()->where('status', 'BORROWED');
        if ($userId) {
            $activeBorrowQuery->where('user_id', $userId);
        }
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
                    'borrow_date' => $a->borrow_date?->format('Y-m-d'),
                    'expected_return_date' => $a->expected_return_date?->format('Y-m-d'),
                    'status' => $a->status,
                    'status_display' => $statusDisplay,
                    'is_overdue' => $isOverdue,
                ];
            });

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

        $totalUsers = (int) User::query()->count();

        $pendingApprovalsCount = 0;
        $pendingApprovals = [];
        if (Schema::hasTable('reservations')) {
            $pendingReservationsQuery = Reservation::query()
                ->with(['tool:id,name', 'user:id,name,email'])
                ->whereIn('status', ['PENDING', 'UPCOMING']);
            $pendingApprovalsCount = (int) (clone $pendingReservationsQuery)->count();
            $pendingApprovals = (clone $pendingReservationsQuery)
                ->orderBy('created_at')
                ->limit(10)
                ->get()
                ->map(function (Reservation $r): array {
                    return [
                        'id' => $r->id,
                        'tool_id' => $r->tool_id,
                        'tool_name' => $r->tool?->name ?? '—',
                        'user_name' => $r->user?->name ?? '—',
                        'user_email' => $r->user?->email ?? null,
                        'start_date' => $r->start_date?->toDateString(),
                        'end_date' => $r->end_date?->toDateString(),
                    ];
                })
                ->values()
                ->all();
        }

        $maintenanceDueCount = 0;
        if (Schema::hasTable('maintenance_schedules')) {
            $maintenanceDueCount = (int) MaintenanceSchedule::query()
                ->whereIn('status', ['scheduled', 'in_progress', 'overdue'])
                ->where('scheduled_date', '<=', now()->addDays(14))
                ->count();
        }

        return response()->json([
            'data' => [
                'scope' => [
                    'user_id' => $userId,
                ],
                'counts' => [
                    'tools_available_quantity' => $toolsAvailableQty,
                    'tools_maintenance_quantity' => $toolsMaintenanceQty,
                    'borrowed_active_count' => $toolsBorrowedCount,
                    'overdue_count' => $overdueCount,
                ],
                'total_users' => $totalUsers,
                'pending_approvals_count' => $pendingApprovalsCount,
                'pending_approvals' => $pendingApprovals,
                'maintenance_due_count' => $maintenanceDueCount,
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
