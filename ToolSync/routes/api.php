<?php

use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\ReservationController;
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
Route::get('tool-allocations/export', [ToolAllocationHistoryController::class, 'export']);
Route::get('analytics/overview', [AnalyticsController::class, 'overview']);
Route::get('analytics/export', [AnalyticsController::class, 'export']);

// Keep "history" route above apiResource so it's not captured by {tool_allocation}.
Route::apiResource('tool-allocations', ToolAllocationController::class)->except(['update']);
Route::put('tool-allocations/{tool_allocation}', [ToolAllocationController::class, 'update'])->middleware('auth:sanctum');
Route::apiResource('tool-status-logs', ToolStatusLogController::class);

Route::get('tools/{tool}/availability', [ToolController::class, 'availability']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('favorites', [FavoriteController::class, 'index']);
    Route::post('favorites', [FavoriteController::class, 'store']);
    Route::delete('favorites/{tool}', [FavoriteController::class, 'destroy']);

    Route::get('reservations', [ReservationController::class, 'index']);
    Route::post('reservations', [ReservationController::class, 'store']);
    Route::put('reservations/{reservation}', [ReservationController::class, 'update']);

    Route::get('admin/users', [AdminUserController::class, 'index']);
    Route::put('admin/users/{user}', [AdminUserController::class, 'update']);
});
