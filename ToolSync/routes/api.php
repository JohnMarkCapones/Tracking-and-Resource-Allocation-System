<?php

use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\MaintenanceScheduleController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\ToolAllocationController;
use App\Http\Controllers\Api\ToolAllocationHistoryController;
use App\Http\Controllers\Api\ToolCategoryController;
use App\Http\Controllers\Api\ToolController;
use App\Http\Controllers\Api\ToolDeprecationController;
use App\Http\Controllers\Api\ToolStatusLogController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Public (catalog): no auth required for browsing tools and categories.
Route::apiResource('tool-categories', ToolCategoryController::class)->only(['index', 'show']);
Route::get('tools', [ToolController::class, 'index']);
Route::get('tools/{tool}', [ToolController::class, 'show']);
Route::get('tools/{tool}/availability', [ToolController::class, 'availability']);
Route::get('analytics/usage-heatmap', [AnalyticsController::class, 'usageHeatmap']);

// All other API routes require authentication (session or Bearer token).
Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::post('notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::post('notifications/{notification}/read', [NotificationController::class, 'markRead']);
    Route::delete('notifications/{notification}', [NotificationController::class, 'destroy']);
    Route::delete('notifications', [NotificationController::class, 'clear']);

    Route::get('dashboard', [DashboardController::class, 'show']);
    Route::get('tool-allocations/history', [ToolAllocationHistoryController::class, 'index']);
    Route::get('tool-allocations/history/summary', [ToolAllocationHistoryController::class, 'summary']);
    Route::get('tool-allocations/export', [ToolAllocationHistoryController::class, 'export']);
    Route::get('analytics/overview', [AnalyticsController::class, 'overview']);
    Route::get('analytics/export', [AnalyticsController::class, 'export']);

    // Keep "history" and "export" above apiResource so they are not captured by {tool_allocation}.
    Route::apiResource('tool-allocations', ToolAllocationController::class);
    Route::apiResource('tool-status-logs', ToolStatusLogController::class);

    Route::get('favorites', [FavoriteController::class, 'index']);
    Route::post('favorites', [FavoriteController::class, 'store']);
    Route::delete('favorites/{tool}', [FavoriteController::class, 'destroy']);

    Route::get('reservations', [ReservationController::class, 'index']);
    Route::post('reservations', [ReservationController::class, 'store']);
    Route::put('reservations/{reservation}', [ReservationController::class, 'update']);

    Route::middleware('admin')->group(function () {
        Route::post('reservations/{reservation}/approve', [ReservationController::class, 'approve']);
        Route::post('reservations/{reservation}/decline', [ReservationController::class, 'decline']);
    });

    Route::get('admin/users', [AdminUserController::class, 'index']);
    Route::post('admin/users', [AdminUserController::class, 'store']);
    Route::put('admin/users/{user}', [AdminUserController::class, 'update']);

    Route::middleware('admin')->group(function () {
        Route::post('tool-categories', [ToolCategoryController::class, 'store']);
        Route::put('tool-categories/{tool_category}', [ToolCategoryController::class, 'update']);
        Route::delete('tool-categories/{tool_category}', [ToolCategoryController::class, 'destroy']);
        Route::post('tools', [ToolController::class, 'store']);
        Route::put('tools/{tool}', [ToolController::class, 'update']);
        Route::delete('tools/{tool}', [ToolController::class, 'destroy']);
        Route::get('settings', [SettingsController::class, 'index']);
        Route::put('settings', [SettingsController::class, 'update']);
        Route::post('reports/data', [ReportController::class, 'data']);
        Route::apiResource('maintenance-schedules', MaintenanceScheduleController::class);
        Route::apiResource('tool-deprecations', ToolDeprecationController::class);
        Route::apiResource('departments', DepartmentController::class);
        Route::get('activity-logs', [ActivityLogController::class, 'index']);
    });
});
