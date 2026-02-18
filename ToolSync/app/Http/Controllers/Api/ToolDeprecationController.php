<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreToolDeprecationRequest;
use App\Http\Requests\UpdateToolDeprecationRequest;
use App\Models\ToolDeprecation;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Schema;

class ToolDeprecationController extends Controller
{
    public function index(): JsonResponse
    {
        if (! Schema::hasTable('tool_deprecations')) {
            return response()->json(['data' => []]);
        }

        $deprecations = ToolDeprecation::query()
            ->with(['tool', 'replacementTool'])
            ->orderBy('retire_date')
            ->get()
            ->map(function (ToolDeprecation $d) {
                return [
                    'id' => $d->id,
                    'tool_id' => $d->tool_id,
                    'toolName' => $d->tool->name,
                    'toolId' => 'TL-'.$d->tool->id,
                    'reason' => $d->reason,
                    'retireDate' => $d->retire_date->toDateString(),
                    'replacement_tool_id' => $d->replacement_tool_id,
                    'replacementId' => $d->replacement_tool_id ? 'TL-'.$d->replacement_tool_id : null,
                    'status' => $d->status,
                ];
            });

        return response()->json(['data' => $deprecations]);
    }

    public function store(StoreToolDeprecationRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $deprecation = ToolDeprecation::create([
            'tool_id' => $validated['tool_id'],
            'reason' => $validated['reason'],
            'retire_date' => $validated['retire_date'],
            'replacement_tool_id' => $validated['replacement_tool_id'] ?? null,
            'status' => 'pending',
        ]);

        ActivityLogger::log(
            'tool_deprecation.created',
            'ToolDeprecation',
            $deprecation->id,
            "Deprecation recorded for tool #{$deprecation->tool_id}.",
            ['tool_id' => $deprecation->tool_id],
            $request->user()?->id
        );

        return response()->json([
            'message' => 'Deprecation recorded.',
            'data' => $deprecation->load('tool'),
        ], 201);
    }

    public function update(UpdateToolDeprecationRequest $request, ToolDeprecation $tool_deprecation): JsonResponse
    {
        $validated = $request->validated();

        $tool_deprecation->update($validated);

        ActivityLogger::log(
            'tool_deprecation.updated',
            'ToolDeprecation',
            $tool_deprecation->id,
            "Tool deprecation #{$tool_deprecation->id} updated.",
            $validated,
            $request->user()?->id
        );

        return response()->json([
            'message' => 'Deprecation updated.',
            'data' => $tool_deprecation->fresh(['tool', 'replacementTool']),
        ]);
    }

    public function destroy(ToolDeprecation $tool_deprecation): JsonResponse
    {
        $id = $tool_deprecation->id;
        $toolId = $tool_deprecation->tool_id;
        $userId = request()->user()?->id;

        $tool_deprecation->delete();

        ActivityLogger::log(
            'tool_deprecation.deleted',
            'ToolDeprecation',
            $id,
            "Deprecation #{$id} for tool #{$toolId} removed.",
            ['tool_id' => $toolId],
            $userId
        );

        return response()->json(['message' => 'Deprecation removed.']);
    }
}
