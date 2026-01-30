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
 * @group Tool Allocations (Borrow / Return)
 *
 * APIs for managing tool allocations (borrow history).
 */
class ToolAllocationController extends Controller
{
    /**
     * List all tool allocations
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
     * Create a tool allocation (record a borrow)
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

            // Create allocation first.
            $allocation = ToolAllocation::create($validated);
            $allocation->refresh();

            // Decrement inventory.
            $tool->quantity = max(0, (int) $tool->quantity - 1);
            if ($tool->quantity === 0 && $tool->status === 'AVAILABLE') {
                $tool->status = 'BORROWED';
            }
            $tool->save();

            // Log tool status change if it happened.
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
     * Get a single tool allocation
     */
    public function show(ToolAllocation $tool_allocation): JsonResponse
    {
        $tool_allocation->load(['tool', 'user']);

        return response()->json([
            'data' => $tool_allocation,
        ]);
    }

    /**
     * Update a tool allocation (e.g. mark as returned, set actual_return_date)
     */
    public function update(UpdateToolAllocationRequest $request, ToolAllocation $tool_allocation): JsonResponse
    {
        $actor = $request->user();
        if (! $actor || ! $actor->isAdmin()) {
            return response()->json([
                'message' => 'Only admins can update tool allocations.',
            ], 403);
        }

        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request, $tool_allocation): void {
            $oldAllocationStatus = $tool_allocation->status;

            // If marking as returned, ensure actual_return_date is set.
            if (($validated['status'] ?? null) === 'RETURNED' && empty($validated['actual_return_date'])) {
                $validated['actual_return_date'] = now();
            }

            $tool_allocation->update($validated);

            // If this transitioned BORROWED -> RETURNED, restore inventory.
            if ($oldAllocationStatus === 'BORROWED' && $tool_allocation->status === 'RETURNED') {
                /** @var Tool $tool */
                $tool = Tool::query()->lockForUpdate()->findOrFail($tool_allocation->tool_id);
                $oldToolStatus = $tool->status;

                $tool->quantity = (int) $tool->quantity + 1;

                // If tool was marked BORROWED (out of stock), make it AVAILABLE again.
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

        $tool_allocation->load(['tool', 'user']);

        return response()->json([
            'message' => 'Tool allocation updated successfully.',
            'data' => $tool_allocation,
        ]);
    }

    /**
     * Delete a tool allocation
     */
    public function destroy(ToolAllocation $tool_allocation): JsonResponse
    {
        $tool_allocation->delete();

        return response()->json([
            'message' => 'Tool allocation deleted successfully.',
        ]);
    }
}
