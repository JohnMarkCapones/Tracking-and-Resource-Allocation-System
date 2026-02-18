<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RecentToolView;
use App\Models\Tool;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecentToolViewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user === null) {
            abort(401);
        }

        $views = RecentToolView::query()
            ->with('tool.category')
            ->where('user_id', $user->id)
            ->orderByDesc('viewed_at')
            ->limit(10)
            ->get()
            ->map(function (RecentToolView $view): array {
                /** @var Tool $tool */
                $tool = $view->tool;

                return [
                    'id' => $tool->id,
                    'name' => $tool->name,
                    'toolId' => 'TL-'.$tool->id,
                    'category' => $tool->category?->name ?? 'Other',
                    'imageUrl' => $tool->image_path ? asset('storage/'.$tool->image_path) : null,
                ];
            })
            ->values()
            ->all();

        return response()->json([
            'data' => $views,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user === null) {
            abort(401);
        }

        $validated = $request->validate([
            'tool_id' => ['required', 'integer', 'exists:tools,id'],
        ]);

        /** @var Tool $tool */
        $tool = Tool::query()->findOrFail((int) $validated['tool_id']);

        RecentToolView::query()->updateOrCreate(
            [
                'user_id' => $user->id,
                'tool_id' => $tool->id,
            ],
            [
                'viewed_at' => now(),
            ],
        );

        return response()->json([
            'message' => 'Recent view recorded.',
        ], 201);
    }

    public function destroyAll(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user === null) {
            abort(401);
        }

        RecentToolView::query()
            ->where('user_id', $user->id)
            ->delete();

        return response()->json([
            'message' => 'Recently viewed tools cleared.',
        ]);
    }
}
