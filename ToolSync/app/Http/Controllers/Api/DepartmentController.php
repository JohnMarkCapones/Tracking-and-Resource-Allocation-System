<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function index(): JsonResponse
    {
        $departments = Department::query()->orderBy('name')->get(['id', 'name']);

        return response()->json(['data' => $departments]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
        ]);

        $department = Department::create($validated);

        ActivityLogger::log(
            'department.created',
            'Department',
            $department->id,
            "Department \"{$department->name}\" created.",
            ['name' => $department->name],
            $request->user()?->id
        );

        return response()->json([
            'message' => 'Department created.',
            'data' => $department,
        ], 201);
    }

    public function update(Request $request, Department $department): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
        ]);

        $department->update($validated);

        ActivityLogger::log(
            'department.updated',
            'Department',
            $department->id,
            "Department #{$department->id} updated.",
            $validated,
            $request->user()?->id
        );

        return response()->json([
            'message' => 'Department updated.',
            'data' => $department->fresh(),
        ]);
    }

    public function destroy(Department $department): JsonResponse
    {
        $id = $department->id;
        $name = $department->name;
        $userId = request()->user()?->id;

        $department->delete();

        ActivityLogger::log(
            'department.deleted',
            'Department',
            $id,
            "Department \"{$name}\" removed.",
            ['name' => $name],
            $userId
        );

        return response()->json(['message' => 'Department removed.']);
    }
}
