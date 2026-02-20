<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreToolAllocationRequest;
use App\Http\Requests\UpdateToolAllocationRequest;
use App\Models\Reservation;
use App\Models\SystemSetting;
use App\Models\Tool;
use App\Models\ToolAllocation;
use App\Models\ToolConditionHistory;
use App\Models\ToolStatusLog;
use App\Models\User;
use App\Notifications\InAppSystemNotification;
use App\Services\ActivityLogger;
use App\Services\AutoApprovalEvaluator;
use App\Services\DateValidationService;
use App\Services\ToolAvailabilityService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

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
            ->whereIn('status', ['BORROWED', 'PENDING_RETURN'])
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

        // Check for conflicting reservations before creating allocation
        $availabilityService = app(ToolAvailabilityService::class);
        $availabilityCheck = $availabilityService->checkAvailability((int) $validated['tool_id'], $borrowDate, $expectedReturn);
        if (! $availabilityCheck['available']) {
            return response()->json([
                'message' => $availabilityCheck['reason'] ?? 'Tool is not available for the selected date range.',
            ], 409);
        }

        // Pass the validated Y-m-d strings directly. MySQL will store them as
        // "2026-02-10 00:00:00" with no timezone conversion, so the calendar date
        // is always preserved exactly as the user selected it.
        $createPayload = $validated;

        $allocation = DB::transaction(function () use ($createPayload, $validated, $request, $borrowDate, $expectedReturn): ToolAllocation {
            /** @var Tool $tool */
            $tool = Tool::query()->lockForUpdate()->findOrFail((int) $validated['tool_id']);

            if ($tool->status !== 'AVAILABLE' || $tool->quantity < 1) {
                abort(response()->json([
                    'message' => 'Tool is not available for borrowing.',
                ], 409));
            }

            // Double-check reservation conflicts after locking
            $availabilityService = app(ToolAvailabilityService::class);
            $conflictingReservations = $availabilityService->getConflictingReservations($tool->id, $borrowDate, $expectedReturn);
            $conflictingAllocations = $availabilityService->getConflictingAllocations($tool->id, $borrowDate, $expectedReturn);
            $committedCount = $conflictingReservations->count() + $conflictingAllocations->count();

            if ($committedCount >= $tool->quantity) {
                abort(response()->json([
                    'message' => 'Tool is already fully allocated or reserved for the selected date range.',
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
        $hasConditionHistoryTable = Schema::hasTable('tool_condition_histories');
        $existingHistory = $hasConditionHistoryTable ? $toolAllocation->conditionHistory()->first() : null;
        $historyBorrowerPayload = null;
        $historyAdminPayload = null;

        if (! $actor->isAdmin()) {
            $reportedCondition = $validated['reported_condition']
                ?? $this->extractConditionFromNote($validated['note'] ?? null)
                ?? 'Good';

            $uploadedBorrowerImages = $this->collectUploadedImages($request, 'return_proof_images');
            if ($request->hasFile('return_proof_image')) {
                $singleBorrowerImage = $request->file('return_proof_image');
                if ($singleBorrowerImage instanceof UploadedFile) {
                    $uploadedBorrowerImages[] = $singleBorrowerImage;
                }
            }

            $existingBorrowerImages = $this->normalizeImagePaths(
                $existingHistory?->borrower_images ?? $toolAllocation->return_proof_image_path
            );
            $borrowerImagePaths = $existingBorrowerImages;
            if ($uploadedBorrowerImages !== []) {
                $borrowerImagePaths = $this->storeConditionImages($uploadedBorrowerImages, $toolAllocation, 'borrower');
                $this->deleteStoredImages($existingBorrowerImages);
            }

            $returnProofPath = $borrowerImagePaths[0] ?? null;
            if ($this->borrowerConditionRequiresProof($reportedCondition) && ! $returnProofPath) {
                return response()->json([
                    'message' => 'Photo proof is required when returning a tool in Fair, Poor, or Damaged condition.',
                ], 422);
            }

            $validated = [
                'status' => 'PENDING_RETURN',
                'note' => $validated['note'] ?? $toolAllocation->note,
                'reported_condition' => $reportedCondition,
                'return_proof_image_path' => $returnProofPath,
                'admin_condition' => null,
                'admin_review_note' => null,
                'admin_reviewed_at' => null,
            ];

            if ($hasConditionHistoryTable && $existingHistory && $existingHistory->admin_images) {
                $this->deleteStoredImages($this->normalizeImagePaths($existingHistory->admin_images));
            }

            if ($hasConditionHistoryTable) {
                $historyBorrowerPayload = [
                    'tool_id' => $toolAllocation->tool_id,
                    'allocation_id' => $toolAllocation->id,
                    'borrower_id' => $toolAllocation->user_id,
                    'borrower_condition' => $reportedCondition,
                    'borrower_notes' => $validated['note'] ?? $toolAllocation->note,
                    'borrower_images' => $borrowerImagePaths !== [] ? $borrowerImagePaths : null,
                    'admin_id' => null,
                    'admin_condition' => null,
                    'admin_notes' => null,
                    'admin_images' => null,
                    'admin_reviewed_at' => null,
                ];
            }
        }

        if ($actor->isAdmin() && ($validated['status'] ?? null) === 'RETURNED') {
            $adminCondition = is_string($validated['admin_condition'] ?? null)
                ? trim((string) $validated['admin_condition'])
                : '';
            if ($adminCondition === '') {
                return response()->json([
                    'message' => 'Admin condition grade is required before approving a return.',
                ], 422);
            }

            $adminReviewNote = is_string($validated['admin_review_note'] ?? null)
                ? trim((string) $validated['admin_review_note'])
                : '';
            if ($adminReviewNote === '') {
                return response()->json([
                    'message' => 'Admin review note is required before approving a return.',
                ], 422);
            }

            $validated['admin_condition'] = $adminCondition;
            $validated['admin_review_note'] = $adminReviewNote;
            $validated['admin_reviewed_at'] = now();

            $uploadedAdminImages = $this->collectUploadedImages($request, 'admin_proof_images');
            $existingAdminImages = $this->normalizeImagePaths($existingHistory?->admin_images);
            $adminImagePaths = $existingAdminImages;
            if ($uploadedAdminImages !== []) {
                $adminImagePaths = $this->storeConditionImages($uploadedAdminImages, $toolAllocation, 'admin');
                $this->deleteStoredImages($existingAdminImages);
            }

            if ($this->adminConditionRequiresProof($validated['admin_condition']) && $adminImagePaths === []) {
                return response()->json([
                    'message' => 'Admin verification photos are required when grading Poor or Damaged.',
                ], 422);
            }

            if ($hasConditionHistoryTable) {
                $historyAdminPayload = [
                    'admin_id' => $actor->id,
                    'admin_condition' => $validated['admin_condition'],
                    'admin_notes' => $validated['admin_review_note'],
                    'admin_images' => $adminImagePaths !== [] ? $adminImagePaths : null,
                    'admin_reviewed_at' => $validated['admin_reviewed_at'],
                ];
            }
        }

        if ($toolAllocation->status === 'RETURNED') {
            return response()->json([
                'message' => 'This tool has already been marked as returned.',
                'data' => $toolAllocation->load(['tool', 'user']),
            ]);
        }

        $oldAllocationStatus = $toolAllocation->status;

        $returnedCondition = null;
        if (($validated['status'] ?? null) === 'RETURNED') {
            $returnedCondition = $validated['admin_condition']
                ?? $toolAllocation->admin_condition
                ?? $toolAllocation->reported_condition
                ?? $this->extractConditionFromNote(($validated['note'] ?? null) ?: $toolAllocation->note);
        }

        DB::transaction(function () use (
            $validated,
            $request,
            $toolAllocation,
            $oldAllocationStatus,
            $returnedCondition,
            $historyBorrowerPayload,
            $historyAdminPayload
        ): void {
            if (($validated['status'] ?? null) === 'RETURNED' && empty($validated['actual_return_date'])) {
                $validated['actual_return_date'] = now();
            }

            $toolAllocation->update($validated);

            if (is_array($historyBorrowerPayload)) {
                ToolConditionHistory::query()->updateOrCreate(
                    ['allocation_id' => $toolAllocation->id],
                    $historyBorrowerPayload
                );
            }

            if (is_array($historyAdminPayload)) {
                $history = ToolConditionHistory::query()->firstOrNew([
                    'allocation_id' => $toolAllocation->id,
                ]);

                if (! $history->exists) {
                    $history->fill([
                        'tool_id' => $toolAllocation->tool_id,
                        'allocation_id' => $toolAllocation->id,
                        'borrower_id' => $toolAllocation->user_id,
                        'borrower_condition' => $toolAllocation->reported_condition
                            ?? $this->extractConditionFromNote($toolAllocation->note)
                            ?? 'Good',
                        'borrower_notes' => $toolAllocation->note,
                        'borrower_images' => $this->normalizeImagePaths($toolAllocation->return_proof_image_path),
                    ]);
                }

                $history->fill($historyAdminPayload);
                $history->save();
            }

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
                $proofSuffix = $toolAllocation->return_proof_image_path ? ' Photo evidence is attached.' : '';
                Notification::send($adminRecipients, new InAppSystemNotification(
                    'alert',
                    'Return approval needed',
                    "{$toolAllocation->user?->name} requested to return {$toolName}. Approve or decline below.{$proofSuffix}",
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

    /**
     * @return array<int, UploadedFile>
     */
    private function collectUploadedImages(Request $request, string $key): array
    {
        $files = $request->file($key, []);
        if ($files instanceof UploadedFile) {
            return [$files];
        }

        if (! is_array($files)) {
            return [];
        }

        $validFiles = [];
        foreach ($files as $file) {
            if ($file instanceof UploadedFile) {
                $validFiles[] = $file;
            }
        }

        return $validFiles;
    }

    /**
     * @param array<int, UploadedFile> $files
     * @return array<int, string>
     */
    private function storeConditionImages(array $files, ToolAllocation $allocation, string $actorType): array
    {
        $year = now()->format('Y');
        $month = now()->format('m');
        $baseDirectory = "images/tool-conditions/{$year}/{$month}/tool-{$allocation->tool_id}/allocation-{$allocation->id}/{$actorType}";
        $storedPaths = [];

        foreach ($files as $file) {
            $extension = strtolower($file->getClientOriginalExtension() ?: 'jpg');
            $fileName = $actorType.'-'.now()->format('YmdHis').'-'.bin2hex(random_bytes(5)).'.'.$extension;
            $storedPaths[] = $file->storeAs($baseDirectory, $fileName, 'public');
        }

        return $storedPaths;
    }

    /**
     * @param array<int, string> $paths
     */
    private function deleteStoredImages(array $paths): void
    {
        foreach ($paths as $path) {
            if (is_string($path) && trim($path) !== '') {
                Storage::disk('public')->delete($path);
            }
        }
    }

    /**
     * @return array<int, string>
     */
    private function normalizeImagePaths(mixed $value): array
    {
        if (is_string($value)) {
            $trimmed = trim($value);

            return $trimmed !== '' ? [$trimmed] : [];
        }

        if (! is_array($value)) {
            return [];
        }

        $paths = [];
        foreach ($value as $item) {
            if (is_string($item) && trim($item) !== '') {
                $paths[] = trim($item);
            }
        }

        return $paths;
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

    private function borrowerConditionRequiresProof(?string $condition): bool
    {
        if (! is_string($condition) || trim($condition) === '') {
            return false;
        }

        return in_array(strtolower(trim($condition)), ['fair', 'poor', 'damaged'], true);
    }

    private function adminConditionRequiresProof(?string $condition): bool
    {
        if (! is_string($condition) || trim($condition) === '') {
            return false;
        }

        return in_array(strtolower(trim($condition)), ['poor', 'damaged'], true);
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
