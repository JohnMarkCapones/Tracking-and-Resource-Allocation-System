<?php

use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ToolAllocationController;
use App\Http\Controllers\Api\ToolAllocationHistoryController;
use App\Http\Controllers\Api\ToolCategoryController;
use App\Http\Controllers\Api\ToolController;
use App\Http\Controllers\Api\ToolStatusLogController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('tool-categories', ToolCategoryController::class);
Route::apiResource('tools', ToolController::class);
Route::get('dashboard', [DashboardController::class, 'show']);
Route::get('tool-allocations/history', [ToolAllocationHistoryController::class, 'index']);
Route::get('analytics/overview', [AnalyticsController::class, 'overview']);

// Keep "history" route above apiResource so it's not captured by {tool_allocation}.
Route::apiResource('tool-allocations', ToolAllocationController::class)->except(['update']);
Route::put('tool-allocations/{tool_allocation}', [ToolAllocationController::class, 'update'])->middleware('auth:sanctum');
Route::apiResource('tool-status-logs', ToolStatusLogController::class);
