<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $notifications = [];
        $unreadCount = 0;

        if ($user && Schema::hasTable('notifications')) {
            $notifications = $user->notifications()
                ->latest()
                ->take(6)
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
                        'reservationId' => isset($data['reservation_id']) ? (int) $data['reservation_id'] : null,
                        'allocationId' => isset($data['allocation_id']) ? (int) $data['allocation_id'] : null,
                    ];
                })
                ->values()
                ->all();
            $unreadCount = (int) $user->unreadNotifications()->count();
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
                'has_password' => $user?->hasPassword(),
            ],
            'notifications' => $notifications,
            'notifications_unread_count' => $unreadCount,
        ];
    }
}
