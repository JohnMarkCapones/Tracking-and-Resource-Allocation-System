<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MaintenanceSchedule;
use App\Models\Reservation;
use App\Models\SystemSetting;
use App\Models\Tool;
use App\Models\ToolAllocation;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

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
     *       "overdue_in_period_count": 2,
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

        // Admins see system-wide stats; regular users see their own.
        $userId = null;
        if ($actor && ! $actor->isAdmin()) {
            $userId = $actor->id;
        }
        if ($request->filled('user_id')) {
            $userId = (int) $request->input('user_id');
        }
        $recentLimit = (int) ($request->input('recent_limit', 5));
        $recentLimit = max(1, min($recentLimit, 50));

        $toolsMaintenanceQty = (int) Tool::query()->where('status', 'MAINTENANCE')->sum('quantity');
        $totalToolsQty = (int) Tool::query()->sum('quantity');

        // Raw sum(quantity WHERE AVAILABLE) is misleading because it ignores
        // units currently borrowed or reserved. Subtract them for a true count.
        $rawAvailableQty = (int) Tool::query()->where('status', 'AVAILABLE')->sum('quantity');

        $reservedActiveCount = 0;
        if (Schema::hasTable('reservations')) {
            $today = now()->toDateString();
            $reservedActiveCount = (int) Reservation::query()
                ->where('status', 'PENDING')
                ->whereDate('start_date', '<=', $today)
                ->whereDate('end_date', '>=', $today)
                ->count();
        }

        // "Borrowed items" on dashboard = count of active allocation records (BORROWED or PENDING_RETURN).
        // Use allocation count for both admin and user so top cards match Utilization insights and reflect real active borrowings.
        // (Inventory math total - available - maintenance only equals borrowed when every tool has quantity 1 or status flips to BORROWED.)
        $today = now()->toDateString();
        $activeBorrowQuery = ToolAllocation::query()
            ->whereIn('status', ['BORROWED', 'PENDING_RETURN'])
            ->whereDate('borrow_date', '<=', $today)
            ->whereDate('expected_return_date', '>=', $today);
        if ($userId) {
            $activeBorrowQuery->where('user_id', $userId);
        }
        $borrowedActiveCount = (int) (clone $activeBorrowQuery)->count();

        $scheduledQuery = ToolAllocation::query()
            ->where('status', 'SCHEDULED')
            ->whereDate('expected_return_date', '>=', $today);
        if ($userId) {
            $scheduledQuery->where('user_id', $userId);
        }
        $scheduledActiveCount = (int) $scheduledQuery->count();

        // System-wide borrowed count for availability math (ignoring user scope)
        $systemBorrowedCount = (int) ToolAllocation::query()
            ->whereIn('status', ['SCHEDULED', 'BORROWED', 'PENDING_RETURN'])
            ->whereDate('borrow_date', '<=', $today)
            ->whereDate('expected_return_date', '>=', $today)
            ->count();

        // True available = raw DB available quantity minus everything committed
        $toolsAvailableQty = max(0, $rawAvailableQty - $systemBorrowedCount - $reservedActiveCount);

        $overdueCount = (int) (clone $activeBorrowQuery)
            ->where('expected_return_date', '<', now())
            ->count();

        // Allocations returned today (status RETURNED, actual_return_date within today).
        $returnedTodayQuery = ToolAllocation::query()
            ->where('status', 'RETURNED')
            ->whereDate('actual_return_date', today());
        if ($userId) {
            $returnedTodayQuery->where('user_id', $userId);
        }
        $returnedTodayCount = (int) $returnedTodayQuery->count();

        // Build recent_activity so active borrowings (SCHEDULED/BORROWED/PENDING_RETURN) always appear
        // first; then fill remaining slots with most recent allocations (any status). This way the
        // "Overview of Borrowing History" table shows the same 1 borrowed item as the Borrowed card.
        $activeStatuses = ['SCHEDULED', 'BORROWED', 'PENDING_RETURN'];
        $activeQuery = ToolAllocation::query()
            ->with(['tool:id,name', 'user:id,name,email'])
            ->whereIn('status', $activeStatuses)
            ->orderByDesc('borrow_date');
        if ($userId) {
            $activeQuery->where('user_id', $userId);
        }
        $activeAllocations = $activeQuery->get();

        $recentQuery = ToolAllocation::query()
            ->with(['tool:id,name', 'user:id,name,email'])
            ->orderByDesc('borrow_date');
        if ($userId) {
            $recentQuery->where('user_id', $userId);
        }
        if ($activeAllocations->isNotEmpty()) {
            $recentQuery->whereNotIn('id', $activeAllocations->pluck('id'));
        }
        $recentOthers = $recentQuery->limit($recentLimit)->get();

        $recentAllocations = $activeAllocations
            ->concat($recentOthers)
            ->take($recentLimit)
            ->values()
            ->map(function (ToolAllocation $a): array {
                // Read raw DB value for expected_return_date (e.g. "2026-02-11 00:00:00")
                // and compare against end-of-day so a tool due on Feb 11 is only overdue on Feb 12.
                $rawExpected = $a->getRawOriginal('expected_return_date');
                $isOverdue = $a->status === 'BORROWED'
                    && ! empty($rawExpected)
                    && Carbon::parse(substr((string) $rawExpected, 0, 10))->endOfDay()->isPast();

                $statusDisplay = $isOverdue ? 'OVERDUE' : $a->status;

                return [
                    'id' => $a->id,
                    'tool_id' => $a->tool_id,
                    'tool_name' => $a->tool?->name,
                    'user_id' => $a->user_id,
                    'user_name' => $a->user?->name,
                    'borrow_date' => substr((string) $a->getRawOriginal('borrow_date'), 0, 10),
                    'expected_return_date' => substr((string) $rawExpected, 0, 10),
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
        $notReturnedCount = (int) (clone $summaryQuery)->whereIn('status', ['BORROWED', 'PENDING_RETURN'])->count();
        $overdueInPeriodCount = (int) (clone $summaryQuery)
            ->whereIn('status', ['BORROWED', 'PENDING_RETURN'])
            ->where('expected_return_date', '<', now())
            ->count();
        $summaryTotal = max(1, $returnedCount + $notReturnedCount);
        $returnedPercent = (int) round(($returnedCount / $summaryTotal) * 100);
        $notReturnedPercent = 100 - $returnedPercent;

        $totalUsers = (int) User::query()->count();

        $pendingApprovalsCount = 0;
        $pendingApprovals = [];
        if (Schema::hasTable('reservations')) {
            $pendingReservationsQuery = Reservation::query()
                ->with(['tool:id,name', 'user:id,name,email'])
                ->where('status', 'PENDING');
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

        $maxBorrowings = 3;
        if (Schema::hasTable('system_settings')) {
            $maxBorrowings = (int) (SystemSetting::query()->where('key', 'max_borrowings')->value('value') ?? 3);
            $maxBorrowings = max(1, min($maxBorrowings, 20));
        }

        return response()->json([
            'data' => [
                'scope' => [
                    'user_id' => $userId,
                ],
                'max_borrowings' => $maxBorrowings,
                'counts' => [
                    'tools_total_quantity' => $totalToolsQty,
                    'tools_available_quantity' => $toolsAvailableQty,
                    'tools_maintenance_quantity' => $toolsMaintenanceQty,
                    'borrowed_active_count' => $borrowedActiveCount,
                    'scheduled_active_count' => $scheduledActiveCount,
                    'reserved_active_count' => $reservedActiveCount,
                    'overdue_count' => $overdueCount,
                    'returned_today_count' => $returnedTodayCount,
                ],
                'total_users' => $totalUsers,
                'pending_approvals_count' => $pendingApprovalsCount,
                'pending_approvals' => $pendingApprovals,
                'maintenance_due_count' => $maintenanceDueCount,
                'recent_activity' => $recentAllocations,
                'summary' => [
                    'returned_count' => $returnedCount,
                    'not_returned_count' => $notReturnedCount,
                    'overdue_in_period_count' => $overdueInPeriodCount,
                    'returned_percent' => $returnedPercent,
                    'not_returned_percent' => $notReturnedPercent,
                    'range_days' => $days,
                ],
            ],
        ]);
    }

    /**
     * Get all pending approval requests for admin review.
     *
     * Returns both pending borrow/reservation requests and pending return requests.
     */
    public function approvals(): JsonResponse
    {
        $hasConditionHistoryTable = Schema::hasTable('tool_condition_histories');

        $borrowRequests = Reservation::query()
            ->with(['tool:id,name,code', 'user:id,name,email'])
            ->where('status', 'PENDING')
            ->orderBy('created_at')
            ->get()
            ->map(function (Reservation $r): array {
                return [
                    'id' => $r->id,
                    'type' => 'borrow',
                    'tool_id' => $r->tool_id,
                    'tool_name' => $r->tool?->name ?? '—',
                    'tool_code' => $r->tool?->code ?? null,
                    'user_id' => $r->user_id,
                    'user_name' => $r->user?->name ?? '—',
                    'user_email' => $r->user?->email ?? null,
                    'start_date' => $r->start_date?->toDateString(),
                    'end_date' => $r->end_date?->toDateString(),
                    'status' => $r->status,
                    'created_at' => $r->created_at?->toIso8601String(),
                ];
            })
            ->values()
            ->all();

        $returnQuery = ToolAllocation::query()
            ->with(['tool:id,name,code', 'user:id,name,email'])
            ->where('status', 'PENDING_RETURN')
            ->orderBy('updated_at');

        if ($hasConditionHistoryTable) {
            $returnQuery->with('conditionHistory');
        }

        $returnRequests = $returnQuery
            ->get()
            ->map(function (ToolAllocation $a) use ($hasConditionHistoryTable): array {
                $history = $hasConditionHistoryTable ? $a->conditionHistory : null;
                $borrowerImageUrls = collect($history?->borrower_images ?? [])
                    ->filter(fn ($path) => is_string($path) && trim($path) !== '')
                    ->map(fn (string $path) => Storage::disk('public')->url($path))
                    ->values()
                    ->all();

                if ($borrowerImageUrls === [] && ! empty($a->return_proof_image_path)) {
                    $borrowerImageUrls[] = Storage::disk('public')->url($a->return_proof_image_path);
                }

                $adminImageUrls = collect($history?->admin_images ?? [])
                    ->filter(fn ($path) => is_string($path) && trim($path) !== '')
                    ->map(fn (string $path) => Storage::disk('public')->url($path))
                    ->values()
                    ->all();

                return [
                    'id' => $a->id,
                    'type' => 'return',
                    'tool_id' => $a->tool_id,
                    'tool_name' => $a->tool?->name ?? '—',
                    'tool_code' => $a->tool?->code ?? null,
                    'user_id' => $a->user_id,
                    'user_name' => $a->user?->name ?? '—',
                    'user_email' => $a->user?->email ?? null,
                    'borrow_date' => substr((string) $a->getRawOriginal('borrow_date'), 0, 10),
                    'expected_return_date' => substr((string) $a->getRawOriginal('expected_return_date'), 0, 10),
                    'note' => $a->note,
                    'reported_condition' => $history?->borrower_condition ?? $a->reported_condition,
                    'admin_condition' => $history?->admin_condition ?? $a->admin_condition,
                    'admin_review_note' => $history?->admin_notes ?? $a->admin_review_note,
                    'return_proof_image_url' => $borrowerImageUrls[0] ?? null,
                    'borrower_image_urls' => $borrowerImageUrls,
                    'admin_image_urls' => $adminImageUrls,
                    'status' => $a->status,
                    'created_at' => $a->created_at?->toIso8601String(),
                ];
            })
            ->values()
            ->all();

        return response()->json([
            'data' => [
                'borrow_requests' => $borrowRequests,
                'return_requests' => $returnRequests,
            ],
        ]);
    }

    /**
     * Get lightweight pending approval counts for admin sidebar badges.
     */
    public function approvalsCount(Request $request): JsonResponse
    {
        $actor = $request->user();
        if (! $actor || ! $actor->isAdmin()) {
            return response()->json(['message' => 'Only admins can view approval counts.'], 403);
        }

        $borrowRequestsCount = (int) Reservation::query()
            ->where('status', 'PENDING')
            ->count();

        $returnRequestsCount = (int) ToolAllocation::query()
            ->where('status', 'PENDING_RETURN')
            ->count();

        return response()->json([
            'data' => [
                'borrow_requests_count' => $borrowRequestsCount,
                'return_requests_count' => $returnRequestsCount,
                'total' => $borrowRequestsCount + $returnRequestsCount,
            ],
        ]);
    }
}
