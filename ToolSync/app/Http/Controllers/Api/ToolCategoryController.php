<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreToolCategoryRequest;
use App\Http\Requests\UpdateToolCategoryRequest;
use App\Models\ToolCategory;
use Illuminate\Http\JsonResponse;

/**
 * @group Tool Categories
 *
 * APIs for managing tool categories
 */
class ToolCategoryController extends Controller
{
    /**
     * List all tool categories
     *
     * Get a list of all tool categories with their tool count.
     *
     * @response 200 {
     *   "data": [
     *     {
     *       "id": 1,
     *       "name": "IT Equipment",
     *       "created_at": "2026-01-29T00:00:00.000000Z",
     *       "updated_at": "2026-01-29T00:00:00.000000Z",
     *       "tools_count": 5
     *     }
     *   ]
     * }
     */
    public function index(): JsonResponse
    {
        $categories = ToolCategory::withCount('tools')->get();

        return response()->json([
            'data' => $categories,
        ]);
    }

    /**
     * Create a tool category
     *
     * Create a new tool category.
     *
     * @bodyParam name string required The name of the category. Example: IT Equipment
     *
     * @response 201 {
     *   "message": "Tool category created successfully.",
     *   "data": {
     *     "id": 1,
     *     "name": "IT Equipment",
     *     "created_at": "2026-01-29T00:00:00.000000Z",
     *     "updated_at": "2026-01-29T00:00:00.000000Z"
     *   }
     * }
     */
    public function store(StoreToolCategoryRequest $request): JsonResponse
    {
        $category = ToolCategory::create($request->validated());

        return response()->json([
            'message' => 'Tool category created successfully.',
            'data' => $category,
        ], 201);
    }

    /**
     * Get a tool category
     *
     * Get details of a specific tool category.
     *
     * @urlParam tool_category int required The ID of the category. Example: 1
     *
     * @response 200 {
     *   "data": {
     *     "id": 1,
     *     "name": "IT Equipment",
     *     "created_at": "2026-01-29T00:00:00.000000Z",
     *     "updated_at": "2026-01-29T00:00:00.000000Z",
     *     "tools_count": 5
     *   }
     * }
     */
    public function show(ToolCategory $toolCategory): JsonResponse
    {
        $toolCategory->loadCount('tools');

        return response()->json([
            'data' => $toolCategory,
        ]);
    }

    /**
     * Update a tool category
     *
     * Update an existing tool category.
     *
     * @urlParam tool_category int required The ID of the category. Example: 1
     *
     * @bodyParam name string required The name of the category. Example: Office Equipment
     *
     * @response 200 {
     *   "message": "Tool category updated successfully.",
     *   "data": {
     *     "id": 1,
     *     "name": "Office Equipment",
     *     "created_at": "2026-01-29T00:00:00.000000Z",
     *     "updated_at": "2026-01-29T00:00:00.000000Z"
     *   }
     * }
     */
    public function update(UpdateToolCategoryRequest $request, ToolCategory $toolCategory): JsonResponse
    {
        $toolCategory->update($request->validated());

        return response()->json([
            'message' => 'Tool category updated successfully.',
            'data' => $toolCategory,
        ]);
    }

    /**
     * Delete a tool category
     *
     * Delete a tool category. Cannot delete if category has tools.
     *
     * @urlParam tool_category int required The ID of the category. Example: 1
     *
     * @response 200 {
     *   "message": "Tool category deleted successfully."
     * }
     * @response 422 {
     *   "message": "Cannot delete category with existing tools."
     * }
     */
    public function destroy(ToolCategory $toolCategory): JsonResponse
    {
        if ($toolCategory->tools()->exists()) {
            return response()->json([
                'message' => 'Cannot delete category with existing tools.',
            ], 422);
        }

        $toolCategory->delete();

        return response()->json([
            'message' => 'Tool category deleted successfully.',
        ]);
    }
}
