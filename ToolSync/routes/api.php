<?php

use App\Http\Controllers\Api\ToolCategoryController;
use App\Http\Controllers\Api\ToolController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('tool-categories', ToolCategoryController::class);
Route::apiResource('tools', ToolController::class);
