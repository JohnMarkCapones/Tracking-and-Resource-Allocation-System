<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\SystemSetting;
use App\Models\Tool;
use App\Models\ToolAllocation;
use App\Models\User;
use App\Notifications\InAppSystemNotification;
use App\Services\ActivityLogger;
use App\Services\DateValidationService;
use App\Services\ToolAvailabilityService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class ReservationController extends Controller
{
    private const MAX_BORROWINGS_DEFAULT = 3;

    private function activeBorrowSlotsUsed(int $userId): int
    {
        $activeBorrowedCount = ToolAllocation::query()
            ->where('user_id', $userId)
            ->whereIn('status', ['BORROWED', 'PENDING_RETURN'])
            ->count();

        $pendingRequestCount = Reservation::query()
            ->where('user_id', $userId)
            ->where('status', 'PENDING')
            ->count();

        return (int) $activeBorrowedCount + (int) $pendingRequestCount;
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $reservations = Reservation::query()
            ->with('tool')
            ->where('user_id', $user?->id)
            ->orderByDesc('start_date')
            ->get()
            ->map(function (Reservation $reservation): array {
                /** @var Tool $tool */
                $tool = $reservation->tool;

                return [
                    'id' => $reservation->id,
                    'toolName' => $tool->name,
                    'toolId' => 'TL-'.$tool->id,
                    'startDate' => $reservation->start_date->toDateString(),
                    'endDate' => $reservation->end_date->toDateString(),
                    'status' => strtolower($reservation->status),
                    'recurring' => (bool) $reservation->recurring,
                    'recurrencePattern' => $reservation->recurrence_pattern,
                ];
            });

        return response()->json([
            'data' => $reservations,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'tool_id' => ['required', 'integer', 'exists:tools,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'recurring' => ['sometimes', 'boolean'],
            'recurrence_pattern' => ['sometimes', 'nullable', 'string', 'max:50'],
            'borrow_request' => ['sometimes', 'boolean'],
        ]);

        $from = Carbon::parse($validated['start_date']);
        $to = Carbon::parse($validated['end_date']);
        $dateErrors = app(DateValidationService::class)->validateRangeForBooking($from, $to);
        if ($dateErrors !== []) {
            return response()->json([
                'message' => implode(' ', $dateErrors),
            ], 422);
        }

        // Validate tool exists and is available
        $tool = Tool::query()->find((int) $validated['tool_id']);
        if (! $tool) {
            return response()->json([
                'message' => 'Tool not found.',
            ], 404);
        }

        if ($tool->status !== 'AVAILABLE' || $tool->quantity < 1) {
            return response()->json([
                'message' => 'Tool is not available for reservation.',
            ], 409);
        }

        // Prevent spamming: block multiple overlapping reservations / borrow requests
        // for the same tool by the same user while a previous one is still active.
        $availabilityService = app(ToolAvailabilityService::class);
        if ($user && $availabilityService->hasUserOverlappingReservation((int) $validated['tool_id'], $user->id, $from, $to)) {
            return response()->json([
                'message' => 'You already have a pending or active reservation for this tool in the selected date range.',
            ], 422);
        }

        // Check for conflicts with other users' reservations and allocations
        $availabilityCheck = $availabilityService->checkAvailability((int) $validated['tool_id'], $from, $to);
        if (! $availabilityCheck['available']) {
            return response()->json([
                'message' => $availabilityCheck['reason'] ?? 'Tool is not available for the selected date range.',
            ], 409);
        }

        $isBorrowRequest = ! empty($validated['borrow_request']);

        // Both borrows and reservations require admin approval (PENDING).
        // The flag is kept only for response/notification wording.
        if ($user) {
            $maxBorrowings = (int) (SystemSetting::query()->where('key', 'max_borrowings')->value('value') ?? self::MAX_BORROWINGS_DEFAULT);
            $activeSlotsUsed = $this->activeBorrowSlotsUsed($user->id);
            if ($activeSlotsUsed >= $maxBorrowings) {
                return response()->json([
                    'message' => "You have reached the maximum concurrent borrow/request limit ({$maxBorrowings}). Return a tool or wait for pending requests to be resolved.",
                ], 422);
            }
        }

        $reservation = Reservation::create([
            'tool_id' => (int) $validated['tool_id'],
            'user_id' => $user?->id,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'status' => 'PENDING',
            'recurring' => (int) ($validated['recurring'] ?? 0),
            'recurrence_pattern' => $validated['recurrence_pattern'] ?? null,
        ]);

        ActivityLogger::log(
            'reservation.created',
            'Reservation',
            $reservation->id,
            "Reservation #{$reservation->id} created for tool #{$reservation->tool_id}.",
            ['tool_id' => $reservation->tool_id],
            $user?->id
        );

        // Always notify admins so they can approve or decline.
        $reservation->load(['tool', 'user']);
        $toolName = $reservation->tool?->name ?? "Tool #{$reservation->tool_id}";
        $adminRecipients = User::query()->where('role', 'ADMIN')->get();
        if ($adminRecipients->isNotEmpty()) {
            $startDate = Carbon::parse($validated['start_date'])->format('M d, Y');
            $endDate = Carbon::parse($validated['end_date'])->format('M d, Y');

            $notificationBody = $isBorrowRequest
                ? "{$reservation->user?->name} requested to borrow {$toolName}. Approve or decline below."
                : "{$reservation->user?->name} requested to reserve {$toolName} for {$startDate} – {$endDate}. Approve or decline below.";

            Notification::send($adminRecipients, new InAppSystemNotification(
                'info',
                'Borrowing request pending',
                $notificationBody,
                '/notifications',
                ['reservation_id' => $reservation->id]
            ));
        }

        $message = $isBorrowRequest
            ? 'Borrowing request submitted for approval.'
            : 'Reservation submitted for approval.';

        return response()->json([
            'message' => $message,
            'data' => $reservation,
        ], 201);
    }

    public function update(Request $request, Reservation $reservation): JsonResponse
    {
        $user = $request->user();

        if ($reservation->user_id !== $user?->id) {
            return response()->json([
                'message' => 'You are not allowed to modify this reservation.',
            ], 403);
        }

        $validated = $request->validate([
            'status' => ['sometimes', 'in:UPCOMING,ACTIVE,COMPLETED,CANCELLED'],
        ]);

        $oldStatus = $reservation->status;
        $reservation->update($validated);

        if (isset($validated['status']) && $oldStatus !== $reservation->status) {
            ActivityLogger::log(
                'reservation.updated',
                'Reservation',
                $reservation->id,
                "Reservation #{$reservation->id} status changed from {$oldStatus} to {$reservation->status}.",
                ['old_status' => $oldStatus, 'new_status' => $reservation->status],
                $user?->id
            );
        }

        return response()->json([
            'message' => 'Reservation updated successfully.',
            'data' => $reservation,
        ]);
    }

    /**
     * Admin: approve a pending borrow request (reservation). Creates the tool allocation and marks reservation completed.
     */
    public function approve(Request $request, Reservation $reservation): JsonResponse
    {
        $user = $request->user();
        if (! $user || ! $user->isAdmin()) {
            return response()->json(['message' => 'Only admins can approve borrow requests.'], 403);
        }

        if (! in_array($reservation->status, ['PENDING', 'UPCOMING'], true)) {
            return response()->json([
                'message' => 'This request is no longer pending approval.',
                'data' => $reservation->load(['tool', 'user']),
            ], 422);
        }

        $reservation->load(['tool', 'user']);
        $tool = $reservation->tool;
        if (! $tool) {
            return response()->json(['message' => 'Tool not found.'], 404);
        }

        $borrowDate = Carbon::parse($reservation->start_date);
        $expectedReturn = Carbon::parse($reservation->end_date);

        // Check availability with date-based conflict detection
        $availabilityService = app(ToolAvailabilityService::class);
        $availabilityCheck = $availabilityService->checkAvailability($tool->id, $borrowDate, $expectedReturn, $reservation->id);
        if (! $availabilityCheck['available']) {
            return response()->json([
                'message' => $availabilityCheck['reason'] ?? 'Tool is no longer available for borrowing. Request cannot be approved.',
            ], 409);
        }

        $maxBorrowings = (int) (SystemSetting::query()->where('key', 'max_borrowings')->value('value') ?? self::MAX_BORROWINGS_DEFAULT);
        $currentBorrowed = ToolAllocation::query()
            ->where('user_id', $reservation->user_id)
            ->whereIn('status', ['BORROWED', 'PENDING_RETURN'])
            ->count();
        if ($currentBorrowed >= $maxBorrowings) {
            return response()->json([
                'message' => "User already has the maximum concurrent borrowings ({$maxBorrowings}). Request cannot be approved.",
            ], 422);
        }

        $allocation = DB::transaction(function () use ($reservation, $request, $borrowDate, $expectedReturn): ToolAllocation {
            // Lock the tool to prevent concurrent approvals
            /** @var Tool $tool */
            $tool = Tool::query()->lockForUpdate()->findOrFail($reservation->tool_id);

            // Re-check availability after locking (double-check pattern)
            if ($tool->status !== 'AVAILABLE' || $tool->quantity < 1) {
                abort(response()->json([
                    'message' => 'Tool is no longer available for borrowing. Request cannot be approved.',
                ], 409));
            }

            $borrowDateStr = $borrowDate->format('Y-m-d');
            $expectedReturnStr = $expectedReturn->format('Y-m-d');

            $allocation = ToolAllocation::create([
                'tool_id' => $reservation->tool_id,
                'user_id' => $reservation->user_id,
                'borrow_date' => $borrowDateStr,
                'expected_return_date' => $expectedReturnStr,
                'actual_return_date' => null,
                'note' => null,
                'status' => 'BORROWED',
            ]);

            $oldStatus = $tool->status;
            $tool->quantity = max(0, (int) $tool->quantity - 1);
            if ($tool->quantity === 0 && $tool->status === 'AVAILABLE') {
                $tool->status = 'BORROWED';
            }
            $tool->save();

            if ($tool->status !== $oldStatus) {
                \App\Models\ToolStatusLog::create([
                    'tool_id' => $tool->id,
                    'old_status' => $oldStatus,
                    'new_status' => $tool->status,
                    'changed_by' => $request->user()?->id,
                    'changed_at' => now(),
                ]);
            }

            $reservation->update(['status' => 'COMPLETED']);

            return $allocation;
        });

        $allocation->load(['tool', 'user']);
        $toolName = $allocation->tool?->name ?? "Tool #{$allocation->tool_id}";

        $allocation->user?->notify(new InAppSystemNotification(
            'success',
            'Borrowing approved',
            "Your request to borrow {$toolName} has been approved. It now appears in My Borrowings.",
            '/borrowings'
        ));

        $adminRecipients = User::query()->where('role', 'ADMIN')->get();
        if ($adminRecipients->isNotEmpty()) {
            $userName = $allocation->user?->name ?? 'User';
            Notification::send($adminRecipients, new InAppSystemNotification(
                'success',
                'Borrow request approved',
                "You approved {$userName}'s request to borrow {$toolName}.",
                '/admin/allocation-history'
            ));
        }

        // Remove the original pending request notification so it does not reappear after refresh.
        DatabaseNotification::query()
            ->where('type', InAppSystemNotification::class)
            ->where('data->reservation_id', $reservation->id)
            ->where('data->title', 'Borrowing request pending')
            ->delete();

        return response()->json([
            'message' => 'Borrow request approved. Allocation created.',
            'data' => [
                'reservation' => $reservation->fresh(['tool', 'user']),
                'allocation' => $allocation,
            ],
        ]);
    }

    /**
     * Admin: decline a pending borrow request. Marks reservation as cancelled and notifies the user.
     */
    public function decline(Request $request, Reservation $reservation): JsonResponse
    {
        $user = $request->user();
        if (! $user || ! $user->isAdmin()) {
            return response()->json(['message' => 'Only admins can decline borrow requests.'], 403);
        }

        if (! in_array($reservation->status, ['PENDING', 'UPCOMING'], true)) {
            return response()->json([
                'message' => 'This request is no longer pending.',
                'data' => $reservation->load(['tool', 'user']),
            ], 422);
        }

        $reservation->load(['tool', 'user']);
        $toolName = $reservation->tool?->name ?? "Tool #{$reservation->tool_id}";

        $reservation->update(['status' => 'CANCELLED']);

        $reservation->user?->notify(new InAppSystemNotification(
            'alert',
            'Borrowing request declined',
            "Your request to borrow {$toolName} was declined by an administrator.",
            '/tools'
        ));

        // Remove the original pending request notification so it does not reappear after refresh.
        DatabaseNotification::query()
            ->where('type', InAppSystemNotification::class)
            ->where('data->reservation_id', $reservation->id)
            ->where('data->title', 'Borrowing request pending')
            ->delete();

        return response()->json([
            'message' => 'Borrow request declined.',
            'data' => $reservation->fresh(['tool', 'user']),
        ]);
    }
}
