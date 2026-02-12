<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Schema;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if (! Schema::hasTable('notifications')) {
            return response()->json([
                'data' => [],
                'unread_count' => 0,
            ]);
        }

        $user = $request->user();
        $notifications = $user?->notifications()->latest()->take(50)->get() ?? collect();

        return response()->json([
            'data' => $notifications->map(fn (DatabaseNotification $n) => $this->formatNotification($n))->values(),
            'unread_count' => $user?->unreadNotifications()->count() ?? 0,
        ]);
    }

    public function markRead(Request $request, string $notificationId): JsonResponse
    {
        if (! Schema::hasTable('notifications')) {
            return response()->json(['message' => 'Notifications are not available yet.'], 404);
        }

        $notification = $this->findUserNotification($request, $notificationId);
        if (! $notification) {
            return response()->json(['message' => 'Notification not found.'], 404);
        }

        if (! $notification->read_at) {
            $notification->markAsRead();
        }

        return response()->json(['message' => 'Notification marked as read.']);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        if (! Schema::hasTable('notifications')) {
            return response()->json(['message' => 'Notifications are not available yet.'], 404);
        }

        $request->user()?->unreadNotifications->markAsRead();

        return response()->json(['message' => 'All notifications marked as read.']);
    }

    public function destroy(Request $request, string $notificationId): JsonResponse
    {
        if (! Schema::hasTable('notifications')) {
            return response()->json(['message' => 'Notifications are not available yet.'], 404);
        }

        $notification = $this->findUserNotification($request, $notificationId);
        if (! $notification) {
            return response()->json(['message' => 'Notification not found.'], 404);
        }

        $notification->delete();

        return response()->json(['message' => 'Notification deleted.']);
    }

    public function clear(Request $request): JsonResponse
    {
        if (! Schema::hasTable('notifications')) {
            return response()->json(['message' => 'Notifications are not available yet.'], 404);
        }

        $request->user()?->notifications()->delete();

        return response()->json(['message' => 'All notifications cleared.']);
    }

    private function findUserNotification(Request $request, string $notificationId): ?DatabaseNotification
    {
        return $request->user()?->notifications()->whereKey($notificationId)->first();
    }

    /**
     * @return array<string, bool|string|null>
     */
    private function formatNotification(DatabaseNotification $notification): array
    {
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
    }
}
