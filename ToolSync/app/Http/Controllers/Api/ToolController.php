<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreToolRequest;
use App\Http\Requests\UpdateToolRequest;
use App\Models\Tool;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
        $query = Tool::with('category');

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->input('search') . '%');
        }

        $tools = $query->get();

        return response()->json([
            'data' => $tools,
        ]);
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
        $tool = Tool::create($request->validated());
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
        $tool->update($request->validated());
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
}
