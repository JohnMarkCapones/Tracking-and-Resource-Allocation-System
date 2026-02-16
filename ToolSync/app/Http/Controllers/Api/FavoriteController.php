<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use App\Models\Tool;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $favorites = Favorite::query()
            ->with('tool.category')
            ->where('user_id', $user?->id)
            ->get()
            ->map(function (Favorite $favorite): array {
                /** @var Tool $tool */
                $tool = $favorite->tool;
                $borrowedCount = $tool->allocations()->where('status', 'BORROWED')->count();
                $availableQuantity = max(0, $tool->quantity - $borrowedCount);

                return [
                    'id' => $tool->id,
                    'name' => $tool->name,
                    'toolId' => 'TL-'.$tool->id,
                    'category' => $tool->category?->name ?? 'Other',
                    'imageUrl' => $tool->image_path ? asset('storage/'.$tool->image_path) : null,
                    'status' => $tool->status,
                    'condition' => $tool->condition ?? 'Good',
                    'quantity' => $tool->quantity,
                    'availableQuantity' => $availableQuantity,
                    'borrowedQuantity' => $borrowedCount,
                ];
            });

        return response()->json([
            'data' => $favorites,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'tool_id' => ['required', 'integer', 'exists:tools,id'],
        ]);

        $favorite = Favorite::query()->firstOrCreate([
            'user_id' => $user?->id,
            'tool_id' => (int) $validated['tool_id'],
        ]);

        return response()->json([
            'message' => 'Favorite added.',
            'data' => $favorite,
        ], 201);
    }

    public function destroy(Request $request, int $tool): JsonResponse
    {
        $user = $request->user();

        Favorite::query()
            ->where('user_id', $user?->id)
            ->where('tool_id', $tool)
            ->delete();

        return response()->json([
            'message' => 'Favorite removed.',
        ]);
    }
}

