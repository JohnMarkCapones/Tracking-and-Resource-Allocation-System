<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreToolStatusLogRequest;
use App\Http\Requests\UpdateToolStatusLogRequest;
use App\Models\ToolStatusLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ToolStatusLogController extends Controller
{
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

    public function store(StoreToolStatusLogRequest $request): JsonResponse
    {
        $payload = $request->validated();

        // If changed_by wasn't provided, use the current authenticated user (if any).
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

    public function show(ToolStatusLog $tool_status_log): JsonResponse
    {
        $tool_status_log->load(['tool', 'changedBy']);

        return response()->json([
            'data' => $tool_status_log,
        ]);
    }

    public function update(UpdateToolStatusLogRequest $request, ToolStatusLog $tool_status_log): JsonResponse
    {
        $tool_status_log->update($request->validated());
        $tool_status_log->load(['tool', 'changedBy']);

        return response()->json([
            'message' => 'Tool status log updated successfully.',
            'data' => $tool_status_log,
        ]);
    }

    public function destroy(ToolStatusLog $tool_status_log): JsonResponse
    {
        $tool_status_log->delete();

        return response()->json([
            'message' => 'Tool status log deleted successfully.',
        ]);
    }
}
