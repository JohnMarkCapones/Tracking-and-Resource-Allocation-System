<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ToolAllocation;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * @group Analytics
 *
 * APIs for analytics and reporting data
 */
class AnalyticsController extends Controller
{
    /**
     * Get analytics overview
     *
     * Get comprehensive analytics including timeseries data, top tools, and status breakdown.
     *
     * @queryParam user_id int Filter data by user ID. Example: 1
     * @queryParam from date Start date for the analytics period. Example: 2026-01-01
     * @queryParam to date End date for the analytics period. Example: 2026-01-31
     *
     * @response 200 {
     *   "data": {
     *     "scope": {
     *       "user_id": null
     *     },
     *     "range": {
     *       "from": "2026-01-01 00:00:00",
     *       "to": "2026-01-31 23:59:59"
     *     },
     *     "timeseries": {
     *       "borrowed": [
     *         {"date": "2026-01-15", "count": 5},
     *         {"date": "2026-01-16", "count": 3}
     *       ],
     *       "returned": [
     *         {"date": "2026-01-20", "count": 4}
     *       ]
     *     },
     *     "top_tools": [
     *       {"tool_id": 1, "tool_name": "Laptop", "borrow_count": 15},
     *       {"tool_id": 2, "tool_name": "Projector", "borrow_count": 10}
     *     ],
     *     "status_breakdown": {
     *       "borrowed": 10,
     *       "returned": 25,
     *       "overdue": 2
     *     }
     *   }
     * }
     */
    public function overview(Request $request): JsonResponse
    {
        $userId = $request->filled('user_id') ? (int) $request->input('user_id') : null;

        $from = $request->filled('from') ? Carbon::parse($request->input('from')) : now()->subDays(30)->startOfDay();
        $to = $request->filled('to') ? Carbon::parse($request->input('to')) : now()->endOfDay();

        $base = ToolAllocation::query()->whereBetween('borrow_date', [$from, $to]);
        if ($userId) {
            $base->where('user_id', $userId);
        }

        $borrowedSeries = (clone $base)
            ->selectRaw('DATE(borrow_date) as d, COUNT(*) as c')
            ->groupBy(DB::raw('DATE(borrow_date)'))
            ->orderBy('d')
            ->get()
            ->map(fn ($r) => ['date' => $r->d, 'count' => (int) $r->c]);

        $returnedSeries = (clone $base)
            ->whereNotNull('actual_return_date')
            ->selectRaw('DATE(actual_return_date) as d, COUNT(*) as c')
            ->groupBy(DB::raw('DATE(actual_return_date)'))
            ->orderBy('d')
            ->get()
            ->map(fn ($r) => ['date' => $r->d, 'count' => (int) $r->c]);

        $topTools = (clone $base)
            ->join('tools', 'tool_allocations.tool_id', '=', 'tools.id')
            ->selectRaw('tools.id as tool_id, tools.name as tool_name, COUNT(*) as borrow_count')
            ->groupBy('tools.id', 'tools.name')
            ->orderByDesc('borrow_count')
            ->limit(5)
            ->get()
            ->map(fn ($r) => ['tool_id' => (int) $r->tool_id, 'tool_name' => $r->tool_name, 'borrow_count' => (int) $r->borrow_count]);

        $borrowedCount = (int) (clone $base)->where('status', 'BORROWED')->count();
        $returnedCount = (int) (clone $base)->where('status', 'RETURNED')->count();
        $overdueCount = (int) (clone $base)
            ->where('status', 'BORROWED')
            ->where('expected_return_date', '<', now())
            ->count();

        return response()->json([
            'data' => [
                'scope' => [
                    'user_id' => $userId,
                ],
                'range' => [
                    'from' => $from->toDateTimeString(),
                    'to' => $to->toDateTimeString(),
                ],
                'timeseries' => [
                    'borrowed' => $borrowedSeries,
                    'returned' => $returnedSeries,
                ],
                'top_tools' => $topTools,
                'status_breakdown' => [
                    'borrowed' => $borrowedCount,
                    'returned' => $returnedCount,
                    'overdue' => $overdueCount,
                ],
            ],
        ]);
    }

    /**
     * Export analytics summary as CSV
     */
    public function export(Request $request): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $userId = $request->filled('user_id') ? (int) $request->input('user_id') : null;
        $from = $request->filled('from') ? Carbon::parse($request->input('from')) : now()->subDays(30)->startOfDay();
        $to = $request->filled('to') ? Carbon::parse($request->input('to')) : now()->endOfDay();

        $filename = 'analytics_'.now()->format('Ymd_His').'.csv';

        $callback = function () use ($userId, $from, $to): void {
            $handle = fopen('php://output', 'wb');

            fputcsv($handle, ['Metric', 'Value']);

            $base = ToolAllocation::query()->whereBetween('borrow_date', [$from, $to]);
            if ($userId) {
                $base->where('user_id', $userId);
            }

            $borrowedCount = (int) (clone $base)->where('status', 'BORROWED')->count();
            $returnedCount = (int) (clone $base)->where('status', 'RETURNED')->count();
            $overdueCount = (int) (clone $base)
                ->where('status', 'BORROWED')
                ->where('expected_return_date', '<', now())
                ->count();

            fputcsv($handle, ['Borrowed', $borrowedCount]);
            fputcsv($handle, ['Returned', $returnedCount]);
            fputcsv($handle, ['Overdue', $overdueCount]);

            fclose($handle);
        };

        return response()->streamDownload($callback, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }
}
