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
        $query = ToolAllocation::query()->with(['tool', 'user'])->orderByDesc('borrow_date');

        if ($request->filled('tool_id')) {
            $query->where('tool_id', (int) $request->input('tool_id'));
        }

        if ($request->filled('user_id')) {
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
            $expected = $a->expected_return_date;
            $isOverdue = $a->status === 'BORROWED'
                && ! empty($expected)
                && Carbon::parse($expected)->isPast();

            $a->setAttribute('is_overdue', $isOverdue);
            $a->setAttribute('status_display', $isOverdue ? 'OVERDUE' : $a->status);

            return $a;
        });

        return response()->json($paginator);
    }
}
