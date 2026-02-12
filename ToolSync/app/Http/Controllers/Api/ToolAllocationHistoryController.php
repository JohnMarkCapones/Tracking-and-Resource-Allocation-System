<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ToolAllocation;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Tool Allocation History
 *
 * APIs for viewing tool allocation history with advanced filtering
 */
class ToolAllocationHistoryController extends Controller
{
    /**
     * List allocation history
     *
     * Get a paginated list of tool allocation history with advanced filters.
     *
     * @queryParam tool_id int Filter by tool ID. Example: 1
     * @queryParam user_id int Filter by user ID. Example: 1
     * @queryParam status string Filter by status. Example: BORROWED
     * @queryParam from date Filter allocations from this date. Example: 2026-01-01
     * @queryParam to date Filter allocations until this date. Example: 2026-01-31
     * @queryParam overdue boolean Filter only overdue allocations. Example: true
     * @queryParam per_page int Number of results per page (1-100). Example: 20
     *
     * @response 200 {
     *   "current_page": 1,
     *   "data": [
     *     {
     *       "id": 1,
     *       "tool_id": 1,
     *       "user_id": 1,
     *       "borrow_date": "2026-01-29",
     *       "expected_return_date": "2026-02-05",
     *       "actual_return_date": null,
     *       "status": "BORROWED",
     *       "note": "For project use",
     *       "created_at": "2026-01-29T00:00:00.000000Z",
     *       "updated_at": "2026-01-29T00:00:00.000000Z",
     *       "is_overdue": true,
     *       "status_display": "OVERDUE",
     *       "tool": {
     *         "id": 1,
     *         "name": "Laptop"
     *       },
     *       "user": {
     *         "id": 1,
     *         "name": "John Doe"
     *       }
     *     }
     *   ],
     *   "per_page": 20,
     *   "total": 1
     * }
     */
    public function index(Request $request): JsonResponse
    {
        $actor = $request->user();
        $query = ToolAllocation::query()->with(['tool.category', 'user'])->orderByDesc('borrow_date');

        if ($request->filled('tool_id')) {
            $query->where('tool_id', (int) $request->input('tool_id'));
        }

        if ($actor && ! $actor->isAdmin()) {
            $query->where('user_id', $actor->id);
        } elseif ($request->filled('user_id')) {
            $query->where('user_id', (int) $request->input('user_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('from')) {
            $query->where('borrow_date', '>=', Carbon::parse($request->input('from')));
        }

        if ($request->filled('to')) {
            $query->where('borrow_date', '<=', Carbon::parse($request->input('to')));
        }

        if ($request->boolean('overdue')) {
            $query
                ->where('status', 'BORROWED')
                ->where('expected_return_date', '<', now());
        }

        $perPage = (int) $request->input('per_page', 20);
        $perPage = max(1, min($perPage, 100));

        $paginator = $query->paginate($perPage);

        $paginator->getCollection()->transform(function (ToolAllocation $a) {
            $rawExpected = $a->getRawOriginal('expected_return_date');
            $isOverdue = $a->status === 'BORROWED'
                && ! empty($rawExpected)
                && Carbon::parse(substr((string) $rawExpected, 0, 10))->endOfDay()->isPast();

            $a->setAttribute('is_overdue', $isOverdue);
            $a->setAttribute('status_display', $isOverdue ? 'OVERDUE' : $a->status);

            return $a;
        });

        return response()->json($paginator);
    }

    /**
     * Export allocation history as CSV
     */
    public function export(Request $request): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $actor = $request->user();
        $filename = 'tool_allocations_'.now()->format('Ymd_His').'.csv';

        $callback = function () use ($request, $actor): void {
            $handle = fopen('php://output', 'wb');

            fputcsv($handle, [
                'ID',
                'Tool',
                'User',
                'Borrow Date',
                'Expected Return',
                'Actual Return',
                'Status',
                'Note',
            ]);

            $query = ToolAllocation::query()->with(['tool.category', 'user'])->orderByDesc('borrow_date');

            if ($request->filled('tool_id')) {
                $query->where('tool_id', (int) $request->input('tool_id'));
            }

            if ($actor && ! $actor->isAdmin()) {
                $query->where('user_id', $actor->id);
            } elseif ($request->filled('user_id')) {
                $query->where('user_id', (int) $request->input('user_id'));
            }

            if ($request->filled('status')) {
                $query->where('status', $request->input('status'));
            }

            if ($request->filled('from')) {
                $query->where('borrow_date', '>=', Carbon::parse($request->input('from')));
            }

            if ($request->filled('to')) {
                $query->where('borrow_date', '<=', Carbon::parse($request->input('to')));
            }

            if ($request->boolean('overdue')) {
                $query
                    ->where('status', 'BORROWED')
                    ->where('expected_return_date', '<', now());
            }

            foreach ($query->cursor() as $allocation) {
                /** @var ToolAllocation $allocation */
                fputcsv($handle, [
                    $allocation->id,
                    $allocation->tool?->name,
                    $allocation->user?->email,
                    $allocation->borrow_date,
                    $allocation->expected_return_date,
                    $allocation->actual_return_date,
                    $allocation->status,
                    $allocation->note,
                ]);
            }

            fclose($handle);
        };

        return response()->streamDownload($callback, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }

    /**
     * Get allocation history summary counts (total, returned, active, overdue).
     */
    public function summary(Request $request): JsonResponse
    {
        $actor = $request->user();
        $base = ToolAllocation::query();

        if ($request->filled('tool_id')) {
            $base->where('tool_id', (int) $request->input('tool_id'));
        }
        if ($actor && ! $actor->isAdmin()) {
            $base->where('user_id', $actor->id);
        } elseif ($request->filled('user_id')) {
            $base->where('user_id', (int) $request->input('user_id'));
        }
        if ($request->filled('from')) {
            $base->where('borrow_date', '>=', Carbon::parse($request->input('from')));
        }
        if ($request->filled('to')) {
            $base->where('borrow_date', '<=', Carbon::parse($request->input('to')));
        }

        $total = (int) (clone $base)->count();
        $returned = (int) (clone $base)->where('status', 'RETURNED')->count();
        $borrowed = (int) (clone $base)->whereIn('status', ['BORROWED', 'PENDING_RETURN'])->count();
        $overdue = (int) (clone $base)
            ->where('status', 'BORROWED')
            ->where('expected_return_date', '<', now())
            ->count();

        return response()->json([
            'data' => [
                'total' => $total,
                'returned' => $returned,
                'active' => $borrowed,
                'overdue' => $overdue,
            ],
        ]);
    }
}
