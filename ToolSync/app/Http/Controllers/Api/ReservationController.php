<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\SystemSetting;
use App\Models\Tool;
use App\Models\ToolAllocation;
use App\Models\ToolCategory;
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

    private function resolveMaxBorrowings(int $categoryId): int
    {
        /** @var ToolCategory|null $category */
        $category = ToolCategory::query()->find($categoryId);
        if ($category !== null && $category->max_borrowings !== null) {
            return (int) $category->max_borrowings;
        }

        return (int) (SystemSetting::query()->where('key', 'max_borrowings')->value('value') ?? self::MAX_BORROWINGS_DEFAULT);
    }

    /**
     * Count only active allocations (scheduled, borrowed, pending return).
     * Pending reservation requests are not counted; the limit applies to actual borrowings.
     */
    private function activeAllocationCount(int $userId): int
    {
        return (int) ToolAllocation::query()
            ->where('user_id', $userId)
            ->whereIn('status', ['SCHEDULED', 'BORROWED', 'PENDING_RETURN'])
            ->count();
    }

    /** @deprecated Use activeAllocationCount for limit checks; pending requests no longer count. */
    private function activeBorrowSlotsUsed(int $userId): int
    {
        return $this->activeAllocationCount($userId)
            + (int) Reservation::query()->where('user_id', $userId)->where('status', 'PENDING')->count();
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
        ]);

        $from = Carbon::parse($validated['start_date']);
        $to = Carbon::parse($validated['end_date']);
        $dateErrors = app(DateValidationService::class)->validateRangeForBooking($from, $to);
        if ($dateErrors !== []) {
            return response()->json([
                'message' => implode(' ', $dateErrors),
            ], 422);
        }

        // Block only when active borrowings (scheduled + borrowed + pending return) are at the limit.
        // Pending reservation requests do not count toward the max.
        if ($user) {
            $toolIdForLimit = (int) $validated['tool_id'];
            $categoryId = Tool::query()->where('id', $toolIdForLimit)->value('category_id');
            $maxBorrowings = $categoryId !== null ? $this->resolveMaxBorrowings((int) $categoryId) : self::MAX_BORROWINGS_DEFAULT;
            $activeCount = $this->activeAllocationCount($user->id);
            if ($activeCount >= $maxBorrowings) {
                return response()->json([
                    'message' => "You have reached the maximum of {$maxBorrowings} active borrowings. Return a tool before requesting another.",
                ], 422);
            }
        }

        // Wrap availability check + creation in a transaction with a row-level lock to prevent
        // two simultaneous requests both passing the availability check (race condition).
        $reservation = DB::transaction(function () use ($validated, $user, $from, $to): Reservation {
            /** @var Tool|null $tool */
            $tool = Tool::query()->lockForUpdate()->find((int) $validated['tool_id']);

            if (! $tool) {
                abort(response()->json(['message' => 'Tool not found.'], 404));
            }

            if ($tool->status !== 'AVAILABLE' || $tool->quantity < 1) {
                abort(response()->json(['message' => 'Tool is not available for reservation.'], 409));
            }

            $availabilityService = app(ToolAvailabilityService::class);

            if ($user && $availabilityService->hasUserOverlappingReservation($tool->id, $user->id, $from, $to)) {
                abort(response()->json([
                    'message' => 'You already have a pending borrow request for this tool in the selected date range.',
                ], 422));
            }

            $availabilityCheck = $availabilityService->checkAvailability($tool->id, $from, $to);

            if (! $availabilityCheck['available']) {
                $conflictingRanges = $availabilityService->getConflictingDateRanges($tool->id, $from, $to);
                abort(response()->json([
                    'message' => $availabilityCheck['reason'] ?? 'Tool is not available for the selected date range.',
                    'conflicting_ranges' => $conflictingRanges,
                ], 409));
            }

            return Reservation::create([
                'tool_id' => $tool->id,
                'user_id' => $user?->id,
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'status' => 'PENDING',
                'recurring' => (int) ($validated['recurring'] ?? 0),
                'recurrence_pattern' => $validated['recurrence_pattern'] ?? null,
            ]);
        });

        ActivityLogger::log(
            'reservation.created',
            'Reservation',
            $reservation->id,
            "Borrow request #{$reservation->id} created for tool #{$reservation->tool_id}.",
            ['tool_id' => $reservation->tool_id],
            $user?->id
        );

        $reservation->load(['tool', 'user']);
        $toolName = $reservation->tool?->name ?? "Tool #{$reservation->tool_id}";
        $startDate = Carbon::parse($validated['start_date'])->format('M d, Y');
        $endDate = Carbon::parse($validated['end_date'])->format('M d, Y');

        $adminRecipients = User::query()->where('role', 'ADMIN')->get();
        if ($adminRecipients->isNotEmpty()) {
            Notification::send($adminRecipients, new InAppSystemNotification(
                'info',
                'Borrowing request pending',
                "{$reservation->user?->name} requested to borrow {$toolName} for {$startDate} – {$endDate}. Approve or decline below.",
                '/notifications',
                ['reservation_id' => $reservation->id]
            ));
        }

        return response()->json([
            'message' => 'Borrow request submitted for approval.',
            'data' => $reservation,
        ], 201);
    }

    /**
     * Create multiple borrow requests in one batch (same date range for all tools).
     */
    public function storeBatch(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'tool_ids' => ['required', 'array'],
            'tool_ids.*' => ['required', 'integer', 'exists:tools,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
        ]);

        $toolIds = array_unique(array_map('intval', $validated['tool_ids']));
        if (count($toolIds) === 0) {
            return response()->json([
                'message' => 'At least one tool is required.',
            ], 422);
        }

        $from = Carbon::parse($validated['start_date']);
        $to = Carbon::parse($validated['end_date']);
        $dateErrors = app(DateValidationService::class)->validateRangeForBooking($from, $to);
        if ($dateErrors !== []) {
            return response()->json([
                'message' => implode(' ', $dateErrors),
            ], 422);
        }

        $maxBorrowings = (int) (SystemSetting::query()->where('key', 'max_borrowings')->value('value') ?? self::MAX_BORROWINGS_DEFAULT);
        $activeCount = $user ? $this->activeAllocationCount($user->id) : 0;
        if ($activeCount >= $maxBorrowings) {
            return response()->json([
                'message' => "You have reached the maximum of {$maxBorrowings} active borrowings. Return a tool before requesting more.",
            ], 422);
        }

        $availabilityService = app(ToolAvailabilityService::class);
        $errors = [];

        foreach ($toolIds as $toolId) {
            $tool = Tool::query()->find($toolId);
            if (! $tool || $tool->status !== 'AVAILABLE' || $tool->quantity < 1) {
                $errors[] = "Tool #{$toolId} is not available for borrowing.";

                continue;
            }
            if ($user && $availabilityService->hasUserOverlappingReservation($toolId, $user->id, $from, $to)) {
                $errors[] = "You already have a pending request for {$tool->name} in this date range.";

                continue;
            }
            $check = $availabilityService->checkAvailability($toolId, $from, $to);
            if (! $check['available']) {
                $errors[] = "{$tool->name}: {$check['reason']}";
            }
        }

        if ($errors !== []) {
            return response()->json([
                'message' => 'Some tools are not available: '.implode(' ', $errors),
            ], 409);
        }

        $reservations = DB::transaction(function () use ($toolIds, $validated, $user): array {
            $created = [];
            foreach ($toolIds as $toolId) {
                $reservation = Reservation::create([
                    'tool_id' => $toolId,
                    'user_id' => $user?->id,
                    'start_date' => $validated['start_date'],
                    'end_date' => $validated['end_date'],
                    'status' => 'PENDING',
                    'recurring' => 0,
                    'recurrence_pattern' => null,
                ]);
                $reservation->load(['tool', 'user']);
                $created[] = $reservation;

                ActivityLogger::log(
                    'reservation.created',
                    'Reservation',
                    $reservation->id,
                    "Borrow request #{$reservation->id} created for tool #{$toolId}.",
                    ['tool_id' => $toolId],
                    $user?->id
                );
            }

            return $created;
        });

        $startDate = Carbon::parse($validated['start_date'])->format('M d, Y');
        $endDate = Carbon::parse($validated['end_date'])->format('M d, Y');
        $toolNames = collect($reservations)->map(fn ($r) => $r->tool?->name ?? "Tool #{$r->tool_id}")->join(', ');

        $adminRecipients = User::query()->where('role', 'ADMIN')->get();
        if ($adminRecipients->isNotEmpty()) {
            Notification::send($adminRecipients, new InAppSystemNotification(
                'info',
                'Borrowing requests pending',
                "{$user?->name} requested to borrow ".count($reservations)." tool(s) for {$startDate} – {$endDate}: {$toolNames}.",
                '/notifications',
                ['reservation_ids' => collect($reservations)->pluck('id')->all()]
            ));
        }

        return response()->json([
            'message' => count($reservations).' borrow request(s) submitted for approval.',
            'data' => $reservations,
        ], 201);
    }

    /**
     * User can only cancel their own PENDING borrow requests.
     */
    public function update(Request $request, Reservation $reservation): JsonResponse
    {
        $user = $request->user();

        if ($reservation->user_id !== $user?->id) {
            return response()->json([
                'message' => 'You are not allowed to modify this borrow request.',
            ], 403);
        }

        $validated = $request->validate([
            'status' => ['required', 'in:CANCELLED'],
        ]);

        if ($reservation->status !== 'PENDING') {
            return response()->json([
                'message' => 'Only pending borrow requests can be cancelled.',
            ], 422);
        }

        $oldStatus = $reservation->status;
        $reservation->update($validated);

        ActivityLogger::log(
            'reservation.cancelled',
            'Reservation',
            $reservation->id,
            "Borrow request #{$reservation->id} cancelled by user.",
            ['old_status' => $oldStatus, 'new_status' => $reservation->status],
            $user?->id
        );

        return response()->json([
            'message' => 'Borrow request cancelled.',
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

        if ($reservation->status !== 'PENDING') {
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
            ->whereIn('status', ['SCHEDULED', 'BORROWED', 'PENDING_RETURN'])
            ->count();
        if ($currentBorrowed >= $maxBorrowings) {
            return response()->json([
                'message' => "User already has the maximum concurrent borrowings ({$maxBorrowings}). Request cannot be approved.",
            ], 422);
        }

        $allocation = DB::transaction(function () use ($reservation, $borrowDate, $expectedReturn): ToolAllocation {
            // Lock the tool to prevent concurrent approvals
            /** @var Tool $tool */
            $tool = Tool::query()->lockForUpdate()->findOrFail($reservation->tool_id);

            // Re-check availability after locking (double-check pattern)
            if ($tool->status !== 'AVAILABLE' || $tool->quantity < 1) {
                abort(response()->json([
                    'message' => 'Tool is no longer available for borrowing. Request cannot be approved.',
                ], 409));
            }

            $availabilityService = app(ToolAvailabilityService::class);
            $availabilityCheck = $availabilityService->checkAvailability($tool->id, $borrowDate, $expectedReturn, $reservation->id);
            if (! $availabilityCheck['available']) {
                abort(response()->json([
                    'message' => $availabilityCheck['reason'] ?? 'Tool is no longer available for borrowing. Request cannot be approved.',
                ], 409));
            }

            $borrowDateStr = $borrowDate->format('Y-m-d');
            $expectedReturnStr = $expectedReturn->format('Y-m-d');

            // #region agent log
            try {
                $logPayload = [
                    'sessionId' => 'f7829b',
                    'runId' => 'pre-fix-2',
                    'hypothesisId' => 'H1',
                    'location' => 'ReservationController@approve',
                    'message' => 'Creating tool allocation from reservation approval',
                    'data' => [
                        'reservation_id' => $reservation->id,
                        'tool_id' => $reservation->tool_id,
                        'user_id' => $reservation->user_id,
                        'borrow_date' => $borrowDateStr,
                        'expected_return_date' => $expectedReturnStr,
                        'status' => 'SCHEDULED',
                    ],
                    'timestamp' => (int) (microtime(true) * 1000),
                ];

                @file_put_contents(
                    base_path('debug-f7829b.log'),
                    json_encode($logPayload, JSON_THROW_ON_ERROR).PHP_EOL,
                    FILE_APPEND
                );
            } catch (\Throwable $e) {
                // Swallow all logging errors to avoid impacting runtime behavior.
            }
            // #endregion agent log

            $allocation = ToolAllocation::create([
                'tool_id' => $reservation->tool_id,
                'user_id' => $reservation->user_id,
                'borrow_date' => $borrowDateStr,
                'expected_return_date' => $expectedReturnStr,
                'claimed_at' => null,
                'claimed_by' => null,
                'actual_return_date' => null,
                'note' => null,
                'status' => 'SCHEDULED',
            ]);

            $reservation->update(['status' => 'COMPLETED']);

            return $allocation;
        });

        $allocation->load(['tool', 'user']);
        $toolName = $allocation->tool?->name ?? "Tool #{$allocation->tool_id}";

        $allocation->user?->notify(new InAppSystemNotification(
            'success',
            'Borrowing approved',
            "Your request to borrow {$toolName} has been approved. It is scheduled for pickup on {$borrowDate->toFormattedDateString()}.",
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
            'message' => 'Borrow request approved. Pickup scheduled.',
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

        if ($reservation->status !== 'PENDING') {
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
