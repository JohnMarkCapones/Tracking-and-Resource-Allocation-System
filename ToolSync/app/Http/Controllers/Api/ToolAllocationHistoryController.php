<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ToolAllocation;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ToolAllocationHistoryController extends Controller
{
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
