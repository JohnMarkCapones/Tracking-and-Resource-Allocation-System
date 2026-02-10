<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ActivityLogger
{
    /**
     * Log an action for audit and activity feed.
     * If the activity_logs table is missing or the insert fails, the error is
     * logged and the request is not failed (so allocations/reservations still succeed).
     *
     * @param  array<string, mixed>|null  $properties
     */
    public static function log(
        string $action,
        ?string $subjectType = null,
        ?int $subjectId = null,
        ?string $description = null,
        ?array $properties = null,
        ?int $userId = null,
    ): ?ActivityLog {
        try {
            return ActivityLog::create([
                'user_id' => $userId ?? Auth::id(),
                'action' => $action,
                'subject_type' => $subjectType,
                'subject_id' => $subjectId,
                'description' => $description,
                'properties' => $properties,
            ]);
        } catch (\Throwable $e) {
            Log::warning('ActivityLogger failed (activity_logs table may be missing). Run: php artisan migrate', [
                'action' => $action,
                'subject_type' => $subjectType,
                'subject_id' => $subjectId,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }
}
