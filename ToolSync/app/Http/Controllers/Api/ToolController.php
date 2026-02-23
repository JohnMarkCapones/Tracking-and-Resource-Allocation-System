<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreToolRequest;
use App\Http\Requests\UpdateToolRequest;
use App\Models\Reservation;
use App\Models\Tool;
use App\Models\ToolAllocation;
use App\Models\ToolConditionHistory;
use App\Models\ToolStatusLog;
use App\Services\ToolAvailabilityService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
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
                    $today = now()->toDateString();
                    $q->whereIn('status', ['SCHEDULED', 'BORROWED', 'PENDING_RETURN'])
                        ->whereDate('borrow_date', '<=', $today)
                        ->whereDate('expected_return_date', '>=', $today);
                },
            ]);

        if (Schema::hasTable('tool_condition_histories')) {
            $query->withCount('conditionHistories')
                ->addSelect([
                    'latest_admin_condition' => ToolConditionHistory::query()
                        ->select('admin_condition')
                        ->whereColumn('tool_id', 'tools.id')
                        ->whereNotNull('admin_condition')
                        ->orderByDesc('admin_reviewed_at')
                        ->orderByDesc('updated_at')
                        ->limit(1),
                ]);
        }

        // Add reserved_count if reservations table exists
        if (Schema::hasTable('reservations')) {
            $query->withCount([
                'reservations as reserved_count' => function ($q) {
                    $today = now()->toDateString();
                    $q->whereIn('status', ['PENDING', 'UPCOMING'])
                        ->whereDate('start_date', '<=', $today)
                        ->whereDate('end_date', '>=', $today);
                },
            ]);
        }

        $statusFilter = $request->input('status');
        if ($statusFilter !== null) {
            $statuses = is_array($statusFilter) ? $statusFilter : [$statusFilter];

            $query->where(function ($q) use ($statuses): void {
                // Available tools: base status AVAILABLE (regardless of current allocations)
                if (in_array('AVAILABLE', $statuses, true)) {
                    $q->orWhere('status', 'AVAILABLE');
                }

                // Maintenance tools: base status MAINTENANCE
                if (in_array('MAINTENANCE', $statuses, true)) {
                    $q->orWhere('status', 'MAINTENANCE');
                }

                // Borrowed tools: any tool that currently has an active allocation
                if (in_array('BORROWED', $statuses, true)) {
                    $today = now()->toDateString();

                    $q->orWhereExists(function ($sub) use ($today): void {
                        $sub->selectRaw('1')
                            ->from('tool_allocations')
                            ->whereColumn('tool_allocations.tool_id', 'tools.id')
                            ->whereIn('tool_allocations.status', ['SCHEDULED', 'BORROWED', 'PENDING_RETURN'])
                            ->whereDate('borrow_date', '<=', $today)
                            ->whereDate('expected_return_date', '>=', $today);
                    });
                }
            });
        }

        $categoryFilter = $request->input('category_id');
        if ($categoryFilter !== null) {
            $categoryIds = is_array($categoryFilter) ? $categoryFilter : [$categoryFilter];
            $query->whereIn('category_id', $categoryIds);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%'.$request->input('search').'%');
        }

        $randomSeed = $request->input('random_seed');
        if ($randomSeed !== null && $randomSeed !== '') {
            // Deterministic pseudo-random ordering so the catalog can appear
            // shuffled without relying on unstable DB-wide RAND() behavior.
            // Convert seed string to numeric hash for cross-database compatibility
            $seedHash = abs(crc32($randomSeed));
            $connection = $query->getConnection()->getDriverName();

            if ($connection === 'sqlite') {
                // SQLite doesn't have MD5, use modulo arithmetic with seed hash
                $query->orderByRaw('(id * ?) % 2147483647', [$seedHash]);
            } else {
                // MySQL/MariaDB: use MD5 for deterministic ordering
                $query->orderByRaw('MD5(CONCAT(id, ?))', [$randomSeed]);
            }
        } else {
            $query->orderBy('name');
        }

        if ($request->boolean('paginated')) {
            $perPage = (int) $request->input('per_page', 18);
            if ($perPage < 1) {
                $perPage = 1;
            }
            if ($perPage > 100) {
                $perPage = 100;
            }

            $paginator = $query->paginate($perPage);

            $items = $this->attachAvailabilityInBulk(collect($paginator->items()));

            return response()->json([
                'data' => $items,
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'last_page' => $paginator->lastPage(),
                ],
            ]);
        }

        $tools = $this->attachAvailabilityInBulk($query->get());

        return response()->json([
            'data' => $tools,
        ]);
    }

    /**
     * Bulk-load availability counts for a collection of tools using 2 queries total
     * instead of 2 queries per tool (avoids N+1).
     *
     * @param  Collection<int, Tool>  $tools
     * @return Collection<int, Tool>
     */
    private function attachAvailabilityInBulk(Collection $tools): Collection
    {
        if ($tools->isEmpty()) {
            return $tools;
        }

        $toolIds = $tools->pluck('id');

        $borrowedCounts = ToolAllocation::query()
            ->whereIn('tool_id', $toolIds)
            ->whereIn('status', ['SCHEDULED', 'BORROWED', 'PENDING_RETURN'])
            ->whereDate('borrow_date', '<=', now()->toDateString())
            ->whereDate('expected_return_date', '>=', now()->toDateString())
            ->selectRaw('tool_id, COUNT(*) as count')
            ->groupBy('tool_id')
            ->pluck('count', 'tool_id');

        $reservedCounts = collect();
        if (Schema::hasTable('reservations')) {
            $reservedCounts = Reservation::query()
                ->whereIn('tool_id', $toolIds)
                ->whereIn('status', ['PENDING', 'UPCOMING'])
                ->whereDate('start_date', '<=', now()->toDateString())
                ->whereDate('end_date', '>=', now()->toDateString())
                ->selectRaw('tool_id, COUNT(*) as count')
                ->groupBy('tool_id')
                ->pluck('count', 'tool_id');
        }

        return $tools->map(function (Tool $tool) use ($borrowedCounts, $reservedCounts): Tool {
            $borrowed = (int) ($borrowedCounts[$tool->id] ?? 0);
            $reserved = (int) ($reservedCounts[$tool->id] ?? 0);
            $available = max(0, (int) $tool->quantity - $borrowed - $reserved);

            $tool->setAttribute('calculated_available_count', $available);
            $tool->setAttribute('calculated_availability', $available);
            $tool->setAttribute('calculated_reserved_count', $reserved);
            
            // Determine availability status
            if ($tool->status !== 'AVAILABLE') {
                $status = 'unavailable';
                $message = "Tool is {$tool->status}.";
            } elseif ($available >= $tool->quantity) {
                $status = 'available';
                $message = 'Tool is available for immediate borrowing.';
            } elseif ($available > 0) {
                $status = 'partially_available';
                $message = "Only {$available} of {$tool->quantity} units available. {$reserved} reserved.";
            } else {
                $status = 'fully_reserved';
                $message = "All {$tool->quantity} units are currently borrowed or reserved.";
            }
            
            $tool->setAttribute('availability_status', $status);
            $tool->setAttribute('availability_message', $message);

            return $tool;
        });
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

        if (! Schema::hasColumn('tools', 'specifications')) {
            unset($validated['specifications']);
        } elseif (isset($validated['specifications']) && is_string($validated['specifications'])) {
            $decoded = json_decode($validated['specifications'], true);
            $validated['specifications'] = is_array($decoded) ? $decoded : [];
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
        if (Schema::hasTable('tool_condition_histories')) {
            $tool->loadCount('conditionHistories');
            $tool->setAttribute(
                'latest_admin_condition',
                ToolConditionHistory::query()
                    ->where('tool_id', $tool->id)
                    ->whereNotNull('admin_condition')
                    ->orderByDesc('admin_reviewed_at')
                    ->orderByDesc('updated_at')
                    ->value('admin_condition')
            );
        } else {
            $tool->setAttribute('condition_histories_count', 0);
            $tool->setAttribute('latest_admin_condition', null);
        }

        // Add calculated availability
        $availabilityService = app(ToolAvailabilityService::class);
        $availability = $availabilityService->calculateAvailability($tool->id);
        $tool->setAttribute('calculated_available_count', $availability['available_count']);
        $tool->setAttribute('calculated_availability', $availability['available_count']);
        $tool->setAttribute('calculated_reserved_count', $availability['reserved_count']);
        
        // Add real-time availability status
        $realTimeStatus = $availabilityService->getRealTimeAvailabilityStatus($tool->id);
        $tool->setAttribute('availability_status', $realTimeStatus['status']);
        $tool->setAttribute('availability_message', $realTimeStatus['message']);

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

        if (! Schema::hasColumn('tools', 'specifications')) {
            unset($validated['specifications']);
        } elseif (array_key_exists('specifications', $validated) && is_string($validated['specifications'])) {
            $decoded = json_decode($validated['specifications'], true);
            $validated['specifications'] = is_array($decoded) ? $decoded : [];
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
     * @urlParam tool int required The ID of tool. Example: 1
     *
     * @queryParam from date Start of range (inclusive). Example: 2026-01-01
     * @queryParam to date End of range (inclusive). Example: 2026-01-31
     * @response 200 {
     *   "data": {
     *     "total_quantity": 5,
     *     "borrowed_count": 1,
     *     "reserved_count": 3,
     *     "available_count": 1,
     *     "available_for_dates": {
     *       "2026-02-20": 0,
     *       "2026-02-21": 0,
     *       "2026-02-25": 1
     *     },
     *     "allocations": [...],
     *     "reservations": [...]
     *   }
     * }
     */
    public function availability(Request $request, Tool $tool): JsonResponse
    {
        $from = $request->filled('from') ? Carbon::parse($request->input('from'))->startOfDay() : now()->startOfDay();
        $to = $request->filled('to') ? Carbon::parse($request->input('to'))->endOfDay() : now()->copy()->addMonth()->endOfDay();

        $availabilityService = app(ToolAvailabilityService::class);

        // Get detailed availability for the date range
        $dateRangeAvailability = $availabilityService->calculateDateRangeAvailability($tool->id, $from, $to);
        $minAvailable = (int) $dateRangeAvailability['available_count'];
        $totalQuantity = (int) $dateRangeAvailability['total_quantity'];

        if ($tool->status !== 'AVAILABLE') {
            $availabilityStatus = 'unavailable';
            $availabilityMessage = "Tool is {$tool->status}.";
        } elseif ($minAvailable < 1) {
            $availabilityStatus = 'fully_reserved';
            $availabilityMessage = 'Tool is fully reserved for the selected dates.';
        } elseif ($minAvailable < $totalQuantity) {
            $availabilityStatus = 'partially_available';
            $availabilityMessage = "Tool is partially available for the selected dates. Minimum free units: {$minAvailable}.";
        } else {
            $availabilityStatus = 'available';
            $availabilityMessage = 'Tool is available for the selected dates.';
        }

        // Get existing allocations and reservations for reference
        $allocations = ToolAllocation::query()
            ->where('tool_id', $tool->id)
            ->whereIn('status', ['SCHEDULED', 'BORROWED', 'PENDING_RETURN'])
            ->whereDate('borrow_date', '<=', $to->toDateString())
            ->whereDate('expected_return_date', '>=', $from->toDateString())
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
                ->whereIn('status', ['PENDING', 'UPCOMING'])
                ->whereDate('start_date', '<=', $to->toDateString())
                ->whereDate('end_date', '>=', $from->toDateString())
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
            'data' => array_merge($dateRangeAvailability, [
                'availability_status' => $availabilityStatus,
                'availability_message' => $availabilityMessage,
                'allocations' => $allocations,
                'reservations' => $reservations,
            ]),
        ]);
    }
}
