<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response|RedirectResponse
    {
        if (auth()->check() && auth()->user()->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }
        return Inertia::render('Dashboard/UserDashboardPage');
    }

    public function borrowings(): Response
    {
        return Inertia::render('Borrowings/IndexPage');
    }

    public function notifications(): Response
    {
        $user = auth()->user();
        $notifications = [];

        if ($user && Schema::hasTable('notifications')) {
            $notifications = $user->notifications()
                ->latest()
                ->take(100)
                ->get()
                ->map(function (DatabaseNotification $notification): array {
                    $data = is_array($notification->data) ? $notification->data : [];
                    $kind = (string) ($data['kind'] ?? 'info');
                    if (! in_array($kind, ['alert', 'info', 'success', 'maintenance'], true)) {
                        $kind = 'info';
                    }

                    return [
                        'id' => $notification->id,
                        'type' => $kind,
                        'title' => (string) ($data['title'] ?? 'Notification'),
                        'message' => (string) ($data['message'] ?? ''),
                        'href' => isset($data['href']) ? (string) $data['href'] : null,
                        'createdAt' => $notification->created_at?->diffForHumans(),
                        'read' => $notification->read_at !== null,
                    ];
                })
                ->values()
                ->all();
        }

        return Inertia::render('Notifications/IndexPage', [
            'notifications' => $notifications,
        ]);
    }
}
