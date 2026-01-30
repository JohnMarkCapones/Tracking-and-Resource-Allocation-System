<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreToolStatusLogRequest;
use App\Http\Requests\UpdateToolStatusLogRequest;
use App\Models\ToolStatusLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Tool Status Logs
 *
 * APIs for managing tool status change history
 */
class ToolStatusLogController extends Controller
{
    /**
     * List all tool status logs
     *
     * Get a paginated list of tool status change logs with optional filters.
     *
     * @queryParam tool_id int Filter by tool ID. Example: 1
     * @queryParam changed_by int Filter by user who made the change. Example: 1
     * @queryParam new_status string Filter by new status. Example: MAINTENANCE
     * @queryParam per_page int Number of results per page (1-100). Example: 20
     *
     * @response 200 {
     *   "current_page": 1,
     *   "data": [
     *     {
     *       "id": 1,
     *       "tool_id": 1,
     *       "old_status": "AVAILABLE",
     *       "new_status": "MAINTENANCE",
     *       "changed_by": 1,
     *       "changed_at": "2026-01-29T10:00:00.000000Z",
     *       "created_at": "2026-01-29T10:00:00.000000Z",
     *       "updated_at": "2026-01-29T10:00:00.000000Z",
     *       "tool": {
     *         "id": 1,
     *         "name": "Laptop"
     *       },
     *       "changed_by_user": {
     *         "id": 1,
     *         "name": "Admin User"
     *       }
     *     }
     *   ],
     *   "per_page": 20,
     *   "total": 1
     * }
     */
    public function index(Request $request): JsonResponse
    {
        $query = ToolStatusLog::query()->with(['tool', 'changedBy'])->orderByDesc('changed_at');

        if ($request->filled('tool_id')) {
            $query->where('tool_id', (int) $request->input('tool_id'));
        }

        if ($request->filled('changed_by')) {
            $query->where('changed_by', (int) $request->input('changed_by'));
        }

        if ($request->filled('new_status')) {
            $query->where('new_status', $request->input('new_status'));
        }

        $perPage = (int) $request->input('per_page', 20);
        $perPage = max(1, min($perPage, 100));

        return response()->json($query->paginate($perPage));
    }

    /**
     * Create a tool status log
     *
     * Manually create a tool status change log entry.
     *
     * @bodyParam tool_id int required The ID of the tool. Example: 1
     * @bodyParam old_status string The previous status. Example: AVAILABLE
     * @bodyParam new_status string The new status. Example: MAINTENANCE
     * @bodyParam changed_by int The ID of the user who made the change. Example: 1
     * @bodyParam changed_at datetime The timestamp of the change. Example: 2026-01-29T10:00:00Z
     *
     * @response 201 {
     *   "message": "Tool status log created successfully.",
     *   "data": {
     *     "id": 1,
     *     "tool_id": 1,
     *     "old_status": "AVAILABLE",
     *     "new_status": "MAINTENANCE",
     *     "changed_by": 1,
     *     "changed_at": "2026-01-29T10:00:00.000000Z",
     *     "created_at": "2026-01-29T10:00:00.000000Z",
     *     "updated_at": "2026-01-29T10:00:00.000000Z",
     *     "tool": {
     *       "id": 1,
     *       "name": "Laptop"
     *     },
     *     "changed_by_user": {
     *       "id": 1,
     *       "name": "Admin User"
     *     }
     *   }
     * }
     */
    public function store(StoreToolStatusLogRequest $request): JsonResponse
    {
        $payload = $request->validated();

        if (! array_key_exists('changed_by', $payload) && $request->user()) {
            $payload['changed_by'] = $request->user()->id;
        }

        $log = ToolStatusLog::create($payload);
        $log->load(['tool', 'changedBy']);

        return response()->json([
            'message' => 'Tool status log created successfully.',
            'data' => $log,
        ], 201);
    }

    /**
     * Get a tool status log
     *
     * Get details of a specific tool status log entry.
     *
     * @urlParam tool_status_log int required The ID of the status log. Example: 1
     *
     * @response 200 {
     *   "data": {
     *     "id": 1,
     *     "tool_id": 1,
     *     "old_status": "AVAILABLE",
     *     "new_status": "MAINTENANCE",
     *     "changed_by": 1,
     *     "changed_at": "2026-01-29T10:00:00.000000Z",
     *     "created_at": "2026-01-29T10:00:00.000000Z",
     *     "updated_at": "2026-01-29T10:00:00.000000Z",
     *     "tool": {
     *       "id": 1,
     *       "name": "Laptop"
     *     },
     *     "changed_by_user": {
     *       "id": 1,
     *       "name": "Admin User"
     *     }
     *   }
     * }
     */
    public function show(ToolStatusLog $toolStatusLog): JsonResponse
    {
        $toolStatusLog->load(['tool', 'changedBy']);

        return response()->json([
            'data' => $toolStatusLog,
        ]);
    }

    /**
     * Update a tool status log
     *
     * Update an existing tool status log entry.
     *
     * @urlParam tool_status_log int required The ID of the status log. Example: 1
     *
     * @bodyParam old_status string The previous status. Example: AVAILABLE
     * @bodyParam new_status string The new status. Example: BORROWED
     * @bodyParam changed_by int The ID of the user who made the change. Example: 1
     * @bodyParam changed_at datetime The timestamp of the change. Example: 2026-01-29T10:00:00Z
     *
     * @response 200 {
     *   "message": "Tool status log updated successfully.",
     *   "data": {
     *     "id": 1,
     *     "tool_id": 1,
     *     "old_status": "AVAILABLE",
     *     "new_status": "BORROWED",
     *     "changed_by": 1,
     *     "changed_at": "2026-01-29T10:00:00.000000Z",
     *     "created_at": "2026-01-29T10:00:00.000000Z",
     *     "updated_at": "2026-01-29T10:00:00.000000Z",
     *     "tool": {
     *       "id": 1,
     *       "name": "Laptop"
     *     },
     *     "changed_by_user": {
     *       "id": 1,
     *       "name": "Admin User"
     *     }
     *   }
     * }
     */
    public function update(UpdateToolStatusLogRequest $request, ToolStatusLog $toolStatusLog): JsonResponse
    {
        $toolStatusLog->update($request->validated());
        $toolStatusLog->load(['tool', 'changedBy']);

        return response()->json([
            'message' => 'Tool status log updated successfully.',
            'data' => $toolStatusLog,
        ]);
    }

    /**
     * Delete a tool status log
     *
     * Delete a tool status log entry.
     *
     * @urlParam tool_status_log int required The ID of the status log. Example: 1
     *
     * @response 200 {
     *   "message": "Tool status log deleted successfully."
     * }
     */
    public function destroy(ToolStatusLog $toolStatusLog): JsonResponse
    {
        $toolStatusLog->delete();

        return response()->json([
            'message' => 'Tool status log deleted successfully.',
        ]);
    }
}
