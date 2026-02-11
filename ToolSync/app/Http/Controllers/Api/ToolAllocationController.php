<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreToolAllocationRequest;
use App\Http\Requests\UpdateToolAllocationRequest;
use App\Models\SystemSetting;
use App\Models\Tool;
use App\Models\ToolAllocation;
use App\Models\ToolStatusLog;
use App\Models\User;
use App\Notifications\InAppSystemNotification;
use App\Services\ActivityLogger;
use App\Services\AutoApprovalEvaluator;
use App\Services\DateValidationService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

/**
 * @group Tool Allocations
 *
 * APIs for managing tool allocations (borrow/return operations)
 */
class ToolAllocationController extends Controller
{
    private const TOOL_CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged', 'Functional'];

    /**
     * List all tool allocations
     *
     * Get a list of all tool allocations with optional filters.
     *
     * @queryParam tool_id int Filter by tool ID. Example: 1
     * @queryParam user_id int Filter by user ID. Example: 1
     * @queryParam status string Filter by status. Example: BORROWED
     *
     * @response 200 {
     *   "data": [
     *     {
     *       "id": 1,
     *       "tool_id": 1,
     *       "user_id": 1,
     *       "borrow_date": "2026-01-29",
     *       "expected_return_date": "2026-02-05",
     *       "actual_return_date": null,
     *       "status": "BORROWED",
     *       "note": "For project use",
     *       "created_at": "2026-01-29T00:00:00.000000Z",
     *       "updated_at": "2026-01-29T00:00:00.000000Z",
     *       "tool": {
     *         "id": 1,
     *         "name": "Laptop"
     *       },
     *       "user": {
     *         "id": 1,
     *         "name": "John Doe"
     *       }
     *     }
     *   ]
     * }
     */
    public function index(Request $request): JsonResponse
    {
        $actor = $request->user();
        $query = ToolAllocation::with(['tool', 'user']);

        if ($request->has('tool_id')) {
            $query->where('tool_id', $request->input('tool_id'));
        }

        if ($actor && ! $actor->isAdmin()) {
            $query->where('user_id', $actor->id);
        } elseif ($request->has('user_id')) {
            $query->where('user_id', $request->input('user_id'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        $allocations = $query->orderBy('borrow_date', 'desc')->get();

        return response()->json([
            'data' => $allocations,
        ]);
    }

    /**
     * Create a tool allocation
     *
     * Record a new tool borrow operation.
     *
     * @bodyParam tool_id int required The ID of the tool to borrow. Example: 1
     * @bodyParam user_id int required The ID of the user borrowing the tool. Example: 1
     * @bodyParam borrow_date date required The date of borrowing. Example: 2026-01-29
     * @bodyParam expected_return_date date required The expected return date. Example: 2026-02-05
     * @bodyParam note string Optional note for the allocation. Example: For project use
     *
     * @response 201 {
     *   "message": "Tool allocation created successfully.",
     *   "data": {
     *     "id": 1,
     *     "tool_id": 1,
     *     "user_id": 1,
     *     "borrow_date": "2026-01-29",
     *     "expected_return_date": "2026-02-05",
     *     "actual_return_date": null,
     *     "status": "BORROWED",
     *     "note": "For project use",
     *     "created_at": "2026-01-29T00:00:00.000000Z",
     *     "updated_at": "2026-01-29T00:00:00.000000Z",
     *     "tool": {
     *       "id": 1,
     *       "name": "Laptop"
     *     },
     *     "user": {
     *       "id": 1,
     *       "name": "John Doe"
     *     }
     *   }
     * }
     * @response 409 {
     *   "message": "Tool is not available for borrowing."
     * }
     */
    public function store(StoreToolAllocationRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $actor = $request->user();

        if ($actor && ! $actor->isAdmin()) {
            $validated['user_id'] = $actor->id;
        }

        // DEBUG: log what arrives from the frontend
        \Log::info('BORROW DEBUG - validated input', $validated);

        $borrowDate = Carbon::parse($validated['borrow_date']);
        $expectedReturn = Carbon::parse($validated['expected_return_date']);
        $dateValidator = app(DateValidationService::class);
        $dateErrors = $dateValidator->validateRangeForBooking($borrowDate, $expectedReturn);
        if ($dateErrors !== []) {
            return response()->json([
                'message' => implode(' ', $dateErrors),
            ], 422);
        }

        $borrower = User::query()->findOrFail((int) $validated['user_id']);
        $maxBorrowings = (int) (SystemSetting::query()->where('key', 'max_borrowings')->value('value') ?? 3);
        $maxDuration = (int) (SystemSetting::query()->where('key', 'max_duration')->value('value') ?? 14);
        $currentBorrowed = ToolAllocation::query()
            ->where('user_id', $borrower->id)
            ->where('status', 'BORROWED')
            ->count();
        $durationDays = $borrowDate->diffInDays($expectedReturn) + 1;
        $evaluator = app(AutoApprovalEvaluator::class);
        $bypassLimits = $evaluator->passesAnyRule($borrower, [
            'user_id' => $borrower->id,
            'borrow_date' => $validated['borrow_date'],
            'expected_return_date' => $validated['expected_return_date'],
            'tool_id' => (int) $validated['tool_id'],
        ]);

        if (! $bypassLimits) {
            if ($currentBorrowed >= $maxBorrowings) {
                return response()->json([
                    'message' => "You have reached the maximum concurrent borrowings ({$maxBorrowings}). Return a tool before borrowing another.",
                ], 422);
            }
            if ($durationDays > $maxDuration) {
                return response()->json([
                    'message' => "Borrow duration cannot exceed {$maxDuration} days. Requested: {$durationDays} days.",
                ], 422);
            }
        }

        // Pass the validated Y-m-d strings directly. MySQL will store them as
        // "2026-02-10 00:00:00" with no timezone conversion, so the calendar date
        // is always preserved exactly as the user selected it.
        $createPayload = $validated;

        $allocation = DB::transaction(function () use ($createPayload, $validated, $request): ToolAllocation {
            /** @var Tool $tool */
            $tool = Tool::query()->lockForUpdate()->findOrFail((int) $validated['tool_id']);

            if ($tool->status !== 'AVAILABLE' || $tool->quantity < 1) {
                abort(response()->json([
                    'message' => 'Tool is not available for borrowing.',
                ], 409));
            }

            $oldStatus = $tool->status;

            $allocation = ToolAllocation::create($createPayload);
            $allocation->refresh();

            // DEBUG: log what actually got stored
            $rawRow = \DB::table('tool_allocations')->where('id', $allocation->id)->first();
            \Log::info('BORROW DEBUG - raw DB row', [
                'borrow_date' => $rawRow->borrow_date,
                'expected_return_date' => $rawRow->expected_return_date,
            ]);

            $tool->quantity = max(0, (int) $tool->quantity - 1);
            if ($tool->quantity === 0 && $tool->status === 'AVAILABLE') {
                $tool->status = 'BORROWED';
            }
            $tool->save();

            if ($tool->status !== $oldStatus) {
                ToolStatusLog::create([
                    'tool_id' => $tool->id,
                    'old_status' => $oldStatus,
                    'new_status' => $tool->status,
                    'changed_by' => $request->user()?->id,
                    'changed_at' => now(),
                ]);
            }

            return $allocation;
        });

        ActivityLogger::log(
            'tool_allocation.created',
            'ToolAllocation',
            $allocation->id,
            "Tool allocation #{$allocation->id} created for tool #{$allocation->tool_id}.",
            ['tool_id' => $allocation->tool_id, 'user_id' => $allocation->user_id],
            $request->user()?->id
        );

        $allocation->load(['tool', 'user']);
        $toolName = $allocation->tool?->name ?? "Tool #{$allocation->tool_id}";

        $allocation->user?->notify(new InAppSystemNotification(
            'success',
            'Borrowing confirmed',
            "Your borrowing for {$toolName} has been created.",
            '/borrowings'
        ));

        $adminRecipients = User::query()->where('role', 'ADMIN')->get();
        if ($adminRecipients->isNotEmpty()) {
            Notification::send($adminRecipients, new InAppSystemNotification(
                'info',
                'New borrowing activity',
                "{$allocation->user?->name} borrowed {$toolName}.",
                '/admin/allocation-history'
            ));
        }

        return response()->json([
            'message' => 'Tool allocation created successfully.',
            'data' => $allocation,
        ], 201);
    }

    /**
     * Get a tool allocation
     *
     * Get details of a specific tool allocation.
     *
     * @urlParam tool_allocation int required The ID of the allocation. Example: 1
     *
     * @response 200 {
     *   "data": {
     *     "id": 1,
     *     "tool_id": 1,
     *     "user_id": 1,
     *     "borrow_date": "2026-01-29",
     *     "expected_return_date": "2026-02-05",
     *     "actual_return_date": null,
     *     "status": "BORROWED",
     *     "note": "For project use",
     *     "created_at": "2026-01-29T00:00:00.000000Z",
     *     "updated_at": "2026-01-29T00:00:00.000000Z",
     *     "tool": {
     *       "id": 1,
     *       "name": "Laptop"
     *     },
     *     "user": {
     *       "id": 1,
     *       "name": "John Doe"
     *     }
     *   }
     * }
     */
    public function show(Request $request, ToolAllocation $toolAllocation): JsonResponse
    {
        $actor = $request->user();
        if ($actor && ! $actor->isAdmin() && $toolAllocation->user_id !== $actor->id) {
            return response()->json([
                'message' => 'Tool allocation not found.',
            ], 404);
        }

        $toolAllocation->load(['tool', 'user']);

        return response()->json([
            'data' => $toolAllocation,
        ]);
    }

    /**
     * Update a tool allocation
     *
     * Update an existing tool allocation (e.g., mark as returned).
     *
     * @urlParam tool_allocation int required The ID of the allocation. Example: 1
     *
     * @bodyParam tool_id int The ID of the tool. Example: 1
     * @bodyParam user_id int The ID of the user. Example: 1
     * @bodyParam borrow_date date The date of borrowing. Example: 2026-01-29
     * @bodyParam expected_return_date date The expected return date. Example: 2026-02-05
     * @bodyParam actual_return_date date The actual return date. Example: 2026-02-04
     * @bodyParam status string The status of the allocation. Example: RETURNED
     * @bodyParam note string Optional note. Example: Returned in good condition
     *
     * @response 200 {
     *   "message": "Tool allocation updated successfully.",
     *   "data": {
     *     "id": 1,
     *     "tool_id": 1,
     *     "user_id": 1,
     *     "borrow_date": "2026-01-29",
     *     "expected_return_date": "2026-02-05",
     *     "actual_return_date": "2026-02-04",
     *     "status": "RETURNED",
     *     "note": "Returned in good condition",
     *     "created_at": "2026-01-29T00:00:00.000000Z",
     *     "updated_at": "2026-01-29T00:00:00.000000Z",
     *     "tool": {
     *       "id": 1,
     *       "name": "Laptop"
     *     },
     *     "user": {
     *       "id": 1,
     *       "name": "John Doe"
     *     }
     *   }
     * }
     * @response 403 {
     *   "message": "Only admins can update tool allocations."
     * }
     */
    public function update(UpdateToolAllocationRequest $request, ToolAllocation $toolAllocation): JsonResponse
    {
        $actor = $request->user();
        if (! $actor) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 401);
        }

        if (! $actor->isAdmin()) {
            if ($toolAllocation->user_id !== $actor->id) {
                return response()->json([
                    'message' => 'You can only update your own borrowings.',
                ], 403);
            }

            if ($toolAllocation->status === 'PENDING_RETURN') {
                return response()->json([
                    'message' => 'This return request is already pending admin approval.',
                    'data' => $toolAllocation->load(['tool', 'user']),
                ]);
            }

            if (($request->input('status') ?? null) !== 'PENDING_RETURN') {
                return response()->json([
                    'message' => 'Users can only submit a return request for admin approval.',
                ], 403);
            }
        }

        $validated = $request->validated();
        if (! $actor->isAdmin()) {
            $validated = [
                'status' => 'PENDING_RETURN',
                'note' => $validated['note'] ?? $toolAllocation->note,
            ];
        }

        if ($toolAllocation->status === 'RETURNED') {
            return response()->json([
                'message' => 'This tool has already been marked as returned.',
                'data' => $toolAllocation->load(['tool', 'user']),
            ]);
        }

        $oldAllocationStatus = $toolAllocation->status;

        $returnedCondition = $this->extractConditionFromNote(($validated['note'] ?? null) ?: $toolAllocation->note);

        DB::transaction(function () use ($validated, $request, $toolAllocation, $oldAllocationStatus, $returnedCondition): void {
            if (($validated['status'] ?? null) === 'RETURNED' && empty($validated['actual_return_date'])) {
                $validated['actual_return_date'] = now();
            }

            $toolAllocation->update($validated);

            if (in_array($oldAllocationStatus, ['BORROWED', 'PENDING_RETURN'], true) && $toolAllocation->status === 'RETURNED') {
                /** @var Tool $tool */
                $tool = Tool::query()->lockForUpdate()->findOrFail($toolAllocation->tool_id);
                $oldToolStatus = $tool->status;

                $tool->quantity = (int) $tool->quantity + 1;

                if ($tool->status === 'BORROWED' && $tool->quantity > 0) {
                    $tool->status = 'AVAILABLE';
                }

                if ($returnedCondition !== null) {
                    $tool->condition = $returnedCondition;
                    if ($returnedCondition === 'Damaged') {
                        $tool->status = 'MAINTENANCE';
                    }
                }

                $tool->save();

                if ($tool->status !== $oldToolStatus) {
                    ToolStatusLog::create([
                        'tool_id' => $tool->id,
                        'old_status' => $oldToolStatus,
                        'new_status' => $tool->status,
                        'changed_by' => $request->user()?->id,
                        'changed_at' => now(),
                    ]);
                }
            }
        });

        if ($oldAllocationStatus !== $toolAllocation->status) {
            ActivityLogger::log(
                'tool_allocation.updated',
                'ToolAllocation',
                $toolAllocation->id,
                "Tool allocation #{$toolAllocation->id} status changed to {$toolAllocation->status}.",
                ['old_status' => $oldAllocationStatus, 'new_status' => $toolAllocation->status],
                $request->user()?->id
            );
        }

        $toolAllocation->load(['tool', 'user']);

        if ($oldAllocationStatus === 'BORROWED' && $toolAllocation->status === 'PENDING_RETURN') {
            $toolName = $toolAllocation->tool?->name ?? "Tool #{$toolAllocation->tool_id}";

            $toolAllocation->user?->notify(new InAppSystemNotification(
                'info',
                'Return request submitted',
                "Your return request for {$toolName} is waiting for admin approval.",
                '/borrowings'
            ));

            $adminRecipients = User::query()->where('role', 'ADMIN')->get();
            if ($adminRecipients->isNotEmpty()) {
                Notification::send($adminRecipients, new InAppSystemNotification(
                    'alert',
                    'Return approval needed',
                    "{$toolAllocation->user?->name} requested to return {$toolName}. Approve or decline below.",
                    '/notifications',
                    ['allocation_id' => $toolAllocation->id]
                ));
            }
        }

        if (in_array($oldAllocationStatus, ['BORROWED', 'PENDING_RETURN'], true) && $toolAllocation->status === 'RETURNED') {
            $toolName = $toolAllocation->tool?->name ?? "Tool #{$toolAllocation->tool_id}";
            $isMarkedForMaintenance = $toolAllocation->tool?->status === 'MAINTENANCE';

            $toolAllocation->user?->notify(new InAppSystemNotification(
                'success',
                'Return completed',
                "Your return for {$toolName} was recorded successfully.",
                '/borrowings'
            ));

            $adminRecipients = User::query()->where('role', 'ADMIN')->get();
            if ($adminRecipients->isNotEmpty()) {
                Notification::send($adminRecipients, new InAppSystemNotification(
                    'success',
                    'Return approved',
                    "Return for {$toolName} is now marked completed.",
                    '/admin/allocation-history'
                ));

                if ($isMarkedForMaintenance) {
                    Notification::send($adminRecipients, new InAppSystemNotification(
                        'maintenance',
                        'Tool moved to maintenance',
                        "{$toolName} was returned as damaged and moved to maintenance.",
                        '/admin/maintenance'
                    ));
                }
            }

            if ($isMarkedForMaintenance) {
                $toolAllocation->user?->notify(new InAppSystemNotification(
                    'maintenance',
                    'Return sent to maintenance',
                    "Your returned {$toolName} was flagged as damaged and sent to maintenance.",
                    '/borrowings'
                ));
            }

            // Remove "Return approval needed" notifications for this allocation so they don't show again
            DatabaseNotification::query()
                ->where('type', InAppSystemNotification::class)
                ->where('data->allocation_id', $toolAllocation->id)
                ->where('data->title', 'Return approval needed')
                ->delete();
        }

        if ($oldAllocationStatus === 'PENDING_RETURN' && $toolAllocation->status === 'BORROWED') {
            $toolName = $toolAllocation->tool?->name ?? "Tool #{$toolAllocation->tool_id}";

            $toolAllocation->user?->notify(new InAppSystemNotification(
                'alert',
                'Return request declined',
                "Your return request for {$toolName} was declined. The tool remains on your borrowings.",
                '/borrowings'
            ));

            // Remove "Return approval needed" notifications for this allocation
            DatabaseNotification::query()
                ->where('type', InAppSystemNotification::class)
                ->where('data->allocation_id', $toolAllocation->id)
                ->where('data->title', 'Return approval needed')
                ->delete();
        }

        return response()->json([
            'message' => 'Tool allocation updated successfully.',
            'data' => $toolAllocation,
        ]);
    }

    private function extractConditionFromNote(?string $note): ?string
    {
        if (! is_string($note) || trim($note) === '') {
            return null;
        }

        if (! preg_match('/^Condition:\s*(.+)$/mi', $note, $matches)) {
            return null;
        }

        $candidate = trim($matches[1]);
        foreach (self::TOOL_CONDITIONS as $allowed) {
            if (strcasecmp($candidate, $allowed) === 0) {
                return $allowed;
            }
        }

        return null;
    }

    /**
     * Delete a tool allocation
     *
     * Delete a tool allocation record.
     *
     * @urlParam tool_allocation int required The ID of the allocation. Example: 1
     *
     * @response 200 {
     *   "message": "Tool allocation deleted successfully."
     * }
     */
    public function destroy(ToolAllocation $toolAllocation): JsonResponse
    {
        $user = request()->user();
        if (! $user || ! $user->isAdmin()) {
            return response()->json([
                'message' => 'Only admins can delete tool allocations.',
            ], 403);
        }

        $toolAllocation->delete();

        return response()->json([
            'message' => 'Tool allocation deleted successfully.',
        ]);
    }
}
