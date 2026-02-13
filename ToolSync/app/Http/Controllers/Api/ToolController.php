<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreToolRequest;
use App\Http\Requests\UpdateToolRequest;
use App\Models\Tool;
use App\Models\ToolAllocation;
use App\Models\Reservation;
use App\Models\ToolStatusLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

/**
 * @group Tools
 *
 * APIs for managing tools
 */
class ToolController extends Controller
{
    /**
     * List all tools
     *
     * Get a list of all tools with optional filters.
     *
     * @queryParam status string Filter by status. Example: AVAILABLE
     * @queryParam category_id int Filter by category ID. Example: 1
     * @queryParam search string Search by tool name. Example: Laptop
     *
     * @response 200 {
     *   "data": [
     *     {
     *       "id": 1,
     *       "name": "Laptop",
     *       "description": "Portable laptop for academic use",
     *       "image_path": "images/tools/laptop.png",
     *       "category_id": 1,
     *       "status": "AVAILABLE",
     *       "quantity": 5,
     *       "created_at": "2026-01-29T00:00:00.000000Z",
     *       "updated_at": "2026-01-29T00:00:00.000000Z",
     *       "category": {
     *         "id": 1,
     *         "name": "IT Equipment"
     *       }
     *     }
     *   ]
     * }
     */
    public function index(Request $request): JsonResponse
    {
        $query = Tool::with('category')
            ->withCount('allocations')
            ->withCount([
                'allocations as borrowed_count' => function ($q) {
                    $q->where('status', 'BORROWED');
                },
            ]);

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%'.$request->input('search').'%');
        }

        $tools = $query->get();

        return response()->json([
            'data' => $tools,
        ]);
    }

    /**
     * Create a tool
     *
     * Create a new tool.
     *
     * @bodyParam name string required The name of the tool. Example: Laptop
     * @bodyParam description string The description of the tool. Example: Portable laptop for academic use
     * @bodyParam image_path string The image path of the tool. Example: images/tools/laptop.png
     * @bodyParam category_id int required The category ID. Example: 1
     * @bodyParam status string The status of the tool. Example: AVAILABLE
     * @bodyParam quantity int The quantity available. Example: 5
     *
     * @response 201 {
     *   "message": "Tool created successfully.",
     *   "data": {
     *     "id": 1,
     *     "name": "Laptop",
     *     "description": "Portable laptop for academic use",
     *     "image_path": "images/tools/laptop.png",
     *     "category_id": 1,
     *     "status": "AVAILABLE",
     *     "quantity": 5,
     *     "created_at": "2026-01-29T00:00:00.000000Z",
     *     "updated_at": "2026-01-29T00:00:00.000000Z",
     *     "category": {
     *       "id": 1,
     *       "name": "IT Equipment"
     *     }
     *   }
     * }
     */
    public function store(StoreToolRequest $request): JsonResponse
    {
        $validated = $request->validated();

        if (! Schema::hasColumn('tools', 'code')) {
            unset($validated['code']);
        }

        if ($request->hasFile('image')) {
            $validated['image_path'] = $request->file('image')->store('images/tools', 'public');
        }

        $tool = Tool::create($validated);
        $tool->load('category');

        return response()->json([
            'message' => 'Tool created successfully.',
            'data' => $tool,
        ], 201);
    }

    /**
     * Get a tool
     *
     * Get details of a specific tool.
     *
     * @urlParam tool int required The ID of the tool. Example: 1
     *
     * @response 200 {
     *   "data": {
     *     "id": 1,
     *     "name": "Laptop",
     *     "description": "Portable laptop for academic use",
     *     "image_path": "images/tools/laptop.png",
     *     "category_id": 1,
     *     "status": "AVAILABLE",
     *     "quantity": 5,
     *     "created_at": "2026-01-29T00:00:00.000000Z",
     *     "updated_at": "2026-01-29T00:00:00.000000Z",
     *     "category": {
     *       "id": 1,
     *       "name": "IT Equipment"
     *     }
     *   }
     * }
     */
    public function show(Tool $tool): JsonResponse
    {
        $tool->load('category');

        return response()->json([
            'data' => $tool,
        ]);
    }

    /**
     * Update a tool
     *
     * Update an existing tool.
     *
     * @urlParam tool int required The ID of the tool. Example: 1
     *
     * @bodyParam name string The name of the tool. Example: Laptop Pro
     * @bodyParam description string The description of the tool. Example: High-performance laptop
     * @bodyParam image_path string The image path of the tool. Example: images/tools/laptop-pro.png
     * @bodyParam category_id int The category ID. Example: 1
     * @bodyParam status string The status of the tool. Example: MAINTENANCE
     * @bodyParam quantity int The quantity available. Example: 3
     *
     * @response 200 {
     *   "message": "Tool updated successfully.",
     *   "data": {
     *     "id": 1,
     *     "name": "Laptop Pro",
     *     "description": "High-performance laptop",
     *     "image_path": "images/tools/laptop-pro.png",
     *     "category_id": 1,
     *     "status": "MAINTENANCE",
     *     "quantity": 3,
     *     "created_at": "2026-01-29T00:00:00.000000Z",
     *     "updated_at": "2026-01-29T00:00:00.000000Z",
     *     "category": {
     *       "id": 1,
     *       "name": "IT Equipment"
     *     }
     *   }
     * }
     */
    public function update(UpdateToolRequest $request, Tool $tool): JsonResponse
    {
        $oldStatus = $tool->status;
        $validated = $request->validated();

        if (! Schema::hasColumn('tools', 'code')) {
            unset($validated['code']);
        }

        if ($request->hasFile('image')) {
            $validated['image_path'] = $request->file('image')->store('images/tools', 'public');
        }

        $tool->update($validated);

        if (array_key_exists('status', $validated) && $validated['status'] !== $oldStatus) {
            ToolStatusLog::create([
                'tool_id' => $tool->id,
                'old_status' => $oldStatus,
                'new_status' => $validated['status'],
                'changed_by' => $request->user()?->id,
                'changed_at' => now(),
            ]);
        }
        $tool->load('category');

        return response()->json([
            'message' => 'Tool updated successfully.',
            'data' => $tool,
        ]);
    }

    /**
     * Delete a tool
     *
     * Delete a tool from the system.
     *
     * @urlParam tool int required The ID of the tool. Example: 1
     *
     * @response 200 {
     *   "message": "Tool deleted successfully."
     * }
     */
    public function destroy(Tool $tool): JsonResponse
    {
        $tool->delete();

        return response()->json([
            'message' => 'Tool deleted successfully.',
        ]);
    }

    /**
     * Get availability information for a tool between a date range.
     *
     * @urlParam tool int required The ID of the tool. Example: 1
     * @queryParam from date Start of the range (inclusive). Example: 2026-01-01
     * @queryParam to date End of the range (inclusive). Example: 2026-01-31
     */
    public function availability(Request $request, Tool $tool): JsonResponse
    {
        $from = $request->filled('from') ? now()->parse($request->input('from'))->startOfDay() : now()->startOfDay();
        $to = $request->filled('to') ? now()->parse($request->input('to'))->endOfDay() : now()->copy()->addMonth()->endOfDay();

        $allocations = ToolAllocation::query()
            ->where('tool_id', $tool->id)
            ->whereBetween('borrow_date', [$from, $to])
            ->get([
                'id',
                'borrow_date',
                'expected_return_date',
                'actual_return_date',
                'status',
            ]);

        $reservations = [];
        if (Schema::hasTable('reservations')) {
            $reservations = Reservation::query()
                ->where('tool_id', $tool->id)
                ->whereBetween('start_date', [$from, $to])
                ->get([
                    'id',
                    'start_date',
                    'end_date',
                    'status',
                    'recurring',
                    'recurrence_pattern',
                ]);
        }

        return response()->json([
            'data' => [
                'allocations' => $allocations,
                'reservations' => $reservations,
            ],
        ]);
    }
}
