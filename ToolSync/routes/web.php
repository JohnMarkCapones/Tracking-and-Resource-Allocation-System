<?php

use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ToolController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'status' => session('status'),
        'verification_email' => session('verification_email'),
    ]);
})->name('home');

// Backward-compatible redirect for any old links.
Route::redirect('/profile/login', '/login', 302);

Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::redirect('/admin', '/admin/dashboard', 302);
    Route::get('/admin/dashboard', [AdminDashboardController::class, 'index'])
        ->name('admin.dashboard');
    Route::get('/admin/allocation-history', [AdminDashboardController::class, 'allocationHistory'])
        ->name('admin.allocation-history');
    Route::get('/admin/tools', [AdminDashboardController::class, 'tools'])
        ->name('admin.tools');
    Route::get('/admin/categories', [AdminDashboardController::class, 'categories'])
        ->name('admin.categories');
    Route::get('/admin/users', [AdminDashboardController::class, 'users'])
        ->name('admin.users');
    Route::get('/admin/analytics', [AdminDashboardController::class, 'analytics'])
        ->name('admin.analytics');
    Route::get('/admin/settings', [AdminDashboardController::class, 'settings'])
        ->name('admin.settings');
    Route::get('/admin/maintenance', [AdminDashboardController::class, 'maintenance'])
        ->name('admin.maintenance');
    Route::get('/admin/reports', [AdminDashboardController::class, 'reports'])
        ->name('admin.reports');
});

Route::get('/tools', [ToolController::class, 'catalog'])
    ->name('tools.catalog');

Route::get('/tools/{slug}', [ToolController::class, 'show'])
    ->name('tools.show')
    ->where('slug', '[a-z0-9]+(?:-[a-z0-9]+)*');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');
    Route::get('/borrowings', [DashboardController::class, 'borrowings'])
        ->name('borrowings');
    Route::get('/notifications', [DashboardController::class, 'notifications'])
        ->name('notifications');
    Route::get('/favorites', function () {
        return Inertia::render('Favorites/IndexPage');
    })->name('favorites');
    Route::get('/reservations', function () {
        return Inertia::render('Reservations/IndexPage');
    })->name('reservations');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
