<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

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

        $query = User::query()
            ->with('department:id,name')
            ->withCount('toolAllocations')
            ->withCount([
                'toolAllocations as active_borrowings_count' => function ($q) {
                    $q->where('status', 'BORROWED');
                },
            ])
            ->orderBy('name');

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $users = $query->get()->map(fn (User $user): array => $this->toUserPayload($user));

        return response()->json([
            'data' => $users,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $actor = $request->user();

        if (! $actor || ! $actor->isAdmin()) {
            return response()->json([
                'message' => 'Only admins can create users.',
            ], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', Rule::in(['ADMIN', 'USER'])],
            'status' => ['required', Rule::in(['ACTIVE', 'INACTIVE'])],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'status' => $validated['status'],
            'department_id' => $validated['department_id'] ?? null,
            'password' => Hash::make($validated['password']),
        ]);

        $user->load('department:id,name');

        return response()->json([
            'message' => 'User created successfully.',
            'data' => $this->toUserPayload($user),
        ], 201);
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
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'status' => ['sometimes', 'in:ACTIVE,INACTIVE'],
            'role' => ['sometimes', 'in:ADMIN,USER'],
            'department_id' => ['sometimes', 'nullable', 'integer', 'exists:departments,id'],
            'password' => ['sometimes', 'nullable', 'string', 'min:8'],
        ]);

        if (($validated['status'] ?? null) === 'INACTIVE' && $actor->id === $user->id) {
            return response()->json([
                'message' => 'You cannot deactivate your own account.',
            ], 422);
        }

        if (($validated['role'] ?? null) === 'USER' && $actor->id === $user->id) {
            return response()->json([
                'message' => 'You cannot remove your own admin role.',
            ], 422);
        }

        if (array_key_exists('password', $validated)) {
            if ($validated['password']) {
                $validated['password'] = Hash::make($validated['password']);
            } else {
                unset($validated['password']);
            }
        }

        $user->fill($validated);
        $user->save();
        $user->load('department:id,name');

        return response()->json([
            'message' => 'User updated successfully.',
            'data' => $this->toUserPayload($user),
        ]);
    }

    private function toUserPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'department' => $user->department?->name ?? 'Unassigned',
            'departmentId' => $user->department_id,
            'role' => $user->role === 'ADMIN' ? 'Admin' : 'User',
            'status' => $user->status === 'ACTIVE' ? 'Active' : 'Inactive',
            'activeBorrowings' => (int) ($user->active_borrowings_count ?? 0),
            'totalBorrowings' => (int) ($user->tool_allocations_count ?? 0),
            'joinedAt' => $user->created_at?->toDateString(),
        ];
    }
}

