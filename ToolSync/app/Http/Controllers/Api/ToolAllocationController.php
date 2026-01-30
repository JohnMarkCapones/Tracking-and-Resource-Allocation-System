<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreToolAllocationRequest;
use App\Http\Requests\UpdateToolAllocationRequest;
use App\Models\Tool;
use App\Models\ToolAllocation;
use App\Models\ToolStatusLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * @group Tool Allocations
 *
 * APIs for managing tool allocations (borrow/return operations)
 */
class ToolAllocationController extends Controller
{
    /**
     * List all tool allocations
     *
     * Get a list of all tool allocations with optional filters.
     *
     * @queryParam tool_id int Filter by tool ID. Example: 1
     * @queryParam user_id int Filter by user ID. Example: 1
     * @queryParam status string Filter by status. Example: BORROWED
     *
     * @response 200 {
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
     *       "tool": {
     *         "id": 1,
     *         "name": "Laptop"
     *       },
     *       "user": {
     *         "id": 1,
     *         "name": "John Doe"
     *       }
     *     }
     *   ]
     * }
     */
    public function index(Request $request): JsonResponse
    {
        $query = ToolAllocation::with(['tool', 'user']);

        if ($request->has('tool_id')) {
            $query->where('tool_id', $request->input('tool_id'));
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->input('user_id'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        $allocations = $query->orderBy('borrow_date', 'desc')->get();

        return response()->json([
            'data' => $allocations,
        ]);
    }

    /**
     * Create a tool allocation
     *
     * Record a new tool borrow operation.
     *
     * @bodyParam tool_id int required The ID of the tool to borrow. Example: 1
     * @bodyParam user_id int required The ID of the user borrowing the tool. Example: 1
     * @bodyParam borrow_date date required The date of borrowing. Example: 2026-01-29
     * @bodyParam expected_return_date date required The expected return date. Example: 2026-02-05
     * @bodyParam note string Optional note for the allocation. Example: For project use
     *
     * @response 201 {
     *   "message": "Tool allocation created successfully.",
     *   "data": {
     *     "id": 1,
     *     "tool_id": 1,
     *     "user_id": 1,
     *     "borrow_date": "2026-01-29",
     *     "expected_return_date": "2026-02-05",
     *     "actual_return_date": null,
     *     "status": "BORROWED",
     *     "note": "For project use",
     *     "created_at": "2026-01-29T00:00:00.000000Z",
     *     "updated_at": "2026-01-29T00:00:00.000000Z",
     *     "tool": {
     *       "id": 1,
     *       "name": "Laptop"
     *     },
     *     "user": {
     *       "id": 1,
     *       "name": "John Doe"
     *     }
     *   }
     * }
     * @response 409 {
     *   "message": "Tool is not available for borrowing."
     * }
     */
    public function store(StoreToolAllocationRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $allocation = DB::transaction(function () use ($validated, $request): ToolAllocation {
            /** @var Tool $tool */
            $tool = Tool::query()->lockForUpdate()->findOrFail((int) $validated['tool_id']);

            if ($tool->status !== 'AVAILABLE' || $tool->quantity < 1) {
                abort(response()->json([
                    'message' => 'Tool is not available for borrowing.',
                ], 409));
            }

            $oldStatus = $tool->status;

            $allocation = ToolAllocation::create($validated);
            $allocation->refresh();

            $tool->quantity = max(0, (int) $tool->quantity - 1);
            if ($tool->quantity === 0 && $tool->status === 'AVAILABLE') {
                $tool->status = 'BORROWED';
            }
            $tool->save();

            if ($tool->status !== $oldStatus) {
                ToolStatusLog::create([
                    'tool_id' => $tool->id,
                    'old_status' => $oldStatus,
                    'new_status' => $tool->status,
                    'changed_by' => $request->user()?->id,
                    'changed_at' => now(),
                ]);
            }

            return $allocation;
        });

        $allocation->load(['tool', 'user']);

        return response()->json([
            'message' => 'Tool allocation created successfully.',
            'data' => $allocation,
        ], 201);
    }

    /**
     * Get a tool allocation
     *
     * Get details of a specific tool allocation.
     *
     * @urlParam tool_allocation int required The ID of the allocation. Example: 1
     *
     * @response 200 {
     *   "data": {
     *     "id": 1,
     *     "tool_id": 1,
     *     "user_id": 1,
     *     "borrow_date": "2026-01-29",
     *     "expected_return_date": "2026-02-05",
     *     "actual_return_date": null,
     *     "status": "BORROWED",
     *     "note": "For project use",
     *     "created_at": "2026-01-29T00:00:00.000000Z",
     *     "updated_at": "2026-01-29T00:00:00.000000Z",
     *     "tool": {
     *       "id": 1,
     *       "name": "Laptop"
     *     },
     *     "user": {
     *       "id": 1,
     *       "name": "John Doe"
     *     }
     *   }
     * }
     */
    public function show(ToolAllocation $toolAllocation): JsonResponse
    {
        $toolAllocation->load(['tool', 'user']);

        return response()->json([
            'data' => $toolAllocation,
        ]);
    }

    /**
     * Update a tool allocation
     *
     * Update an existing tool allocation (e.g., mark as returned).
     *
     * @urlParam tool_allocation int required The ID of the allocation. Example: 1
     *
     * @bodyParam tool_id int The ID of the tool. Example: 1
     * @bodyParam user_id int The ID of the user. Example: 1
     * @bodyParam borrow_date date The date of borrowing. Example: 2026-01-29
     * @bodyParam expected_return_date date The expected return date. Example: 2026-02-05
     * @bodyParam actual_return_date date The actual return date. Example: 2026-02-04
     * @bodyParam status string The status of the allocation. Example: RETURNED
     * @bodyParam note string Optional note. Example: Returned in good condition
     *
     * @response 200 {
     *   "message": "Tool allocation updated successfully.",
     *   "data": {
     *     "id": 1,
     *     "tool_id": 1,
     *     "user_id": 1,
     *     "borrow_date": "2026-01-29",
     *     "expected_return_date": "2026-02-05",
     *     "actual_return_date": "2026-02-04",
     *     "status": "RETURNED",
     *     "note": "Returned in good condition",
     *     "created_at": "2026-01-29T00:00:00.000000Z",
     *     "updated_at": "2026-01-29T00:00:00.000000Z",
     *     "tool": {
     *       "id": 1,
     *       "name": "Laptop"
     *     },
     *     "user": {
     *       "id": 1,
     *       "name": "John Doe"
     *     }
     *   }
     * }
     * @response 403 {
     *   "message": "Only admins can update tool allocations."
     * }
     */
    public function update(UpdateToolAllocationRequest $request, ToolAllocation $toolAllocation): JsonResponse
    {
        $actor = $request->user();
        if (! $actor || ! $actor->isAdmin()) {
            return response()->json([
                'message' => 'Only admins can update tool allocations.',
            ], 403);
        }

        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request, $toolAllocation): void {
            $oldAllocationStatus = $toolAllocation->status;

            if (($validated['status'] ?? null) === 'RETURNED' && empty($validated['actual_return_date'])) {
                $validated['actual_return_date'] = now();
            }

            $toolAllocation->update($validated);

            if ($oldAllocationStatus === 'BORROWED' && $toolAllocation->status === 'RETURNED') {
                /** @var Tool $tool */
                $tool = Tool::query()->lockForUpdate()->findOrFail($toolAllocation->tool_id);
                $oldToolStatus = $tool->status;

                $tool->quantity = (int) $tool->quantity + 1;

                if ($tool->status === 'BORROWED' && $tool->quantity > 0) {
                    $tool->status = 'AVAILABLE';
                }

                $tool->save();

                if ($tool->status !== $oldToolStatus) {
                    ToolStatusLog::create([
                        'tool_id' => $tool->id,
                        'old_status' => $oldToolStatus,
                        'new_status' => $tool->status,
                        'changed_by' => $request->user()?->id,
                        'changed_at' => now(),
                    ]);
                }
            }
        });

        $toolAllocation->load(['tool', 'user']);

        return response()->json([
            'message' => 'Tool allocation updated successfully.',
            'data' => $toolAllocation,
        ]);
    }

    /**
     * Delete a tool allocation
     *
     * Delete a tool allocation record.
     *
     * @urlParam tool_allocation int required The ID of the allocation. Example: 1
     *
     * @response 200 {
     *   "message": "Tool allocation deleted successfully."
     * }
     */
    public function destroy(ToolAllocation $toolAllocation): JsonResponse
    {
        $toolAllocation->delete();

        return response()->json([
            'message' => 'Tool allocation deleted successfully.',
        ]);
    }
}
