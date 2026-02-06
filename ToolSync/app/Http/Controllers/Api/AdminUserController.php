<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ToolAllocation;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $actor = $request->user();

        if (! $actor || ! $actor->isAdmin()) {
            return response()->json([
                'message' => 'Only admins can view users.',
            ], 403);
        }

        $query = User::query()->orderBy('name');

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $users = $query->get()->map(function (User $user): array {
            $activeBorrowings = ToolAllocation::query()
                ->where('user_id', $user->id)
                ->where('status', 'BORROWED')
                ->count();

            $totalBorrowings = ToolAllocation::query()
                ->where('user_id', $user->id)
                ->count();

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status === 'ACTIVE' ? 'Active' : 'Inactive',
                'activeBorrowings' => $activeBorrowings,
                'totalBorrowings' => $totalBorrowings,
                'joinedAt' => $user->created_at?->toDateString(),
            ];
        });

        return response()->json([
            'data' => $users,
        ]);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $actor = $request->user();

        if (! $actor || ! $actor->isAdmin()) {
            return response()->json([
                'message' => 'Only admins can update users.',
            ], 403);
        }

        $validated = $request->validate([
            'status' => ['sometimes', 'in:ACTIVE,INACTIVE'],
            'role' => ['sometimes', 'in:ADMIN,USER'],
        ]);

        $user->fill($validated);
        $user->save();

        return response()->json([
            'message' => 'User updated successfully.',
        ]);
    }
}

