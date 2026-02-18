<?php

namespace App\Services;

use App\Models\Reservation;
use App\Models\Tool;
use App\Models\ToolAllocation;
use Carbon\Carbon;

/**
 * Service to check tool availability considering allocations and reservations.
 */
class ToolAvailabilityService
{
    /**
     * Check if a tool is available for the given date range, considering:
     * - Tool status and quantity
     * - Existing allocations (BORROWED, PENDING_RETURN)
     * - Existing reservations (PENDING, UPCOMING)
     * Note: ACTIVE reservations have already created allocations, so they're counted in allocations
     *
     * @param  int|null  $excludeReservationId  Optional reservation ID to exclude from conflict check
     * @return array{available: bool, reason: string|null}
     */
    public function checkAvailability(int $toolId, Carbon $startDate, Carbon $endDate, ?int $excludeReservationId = null): array
    {
        $tool = Tool::query()->find($toolId);
        if (! $tool) {
            return ['available' => false, 'reason' => 'Tool not found.'];
        }

        if ($tool->status !== 'AVAILABLE') {
            return ['available' => false, 'reason' => "Tool is {$tool->status}."];
        }

        if ($tool->quantity < 1) {
            return ['available' => false, 'reason' => 'Tool has no available quantity.'];
        }

        // Check for conflicting allocations
        $conflictingAllocations = $this->getConflictingAllocations($toolId, $startDate, $endDate);
        $activeAllocationCount = $conflictingAllocations->count();

        // Check for conflicting reservations (all users)
        $conflictingReservations = $this->getConflictingReservations($toolId, $startDate, $endDate, $excludeReservationId);
        $activeReservationCount = $conflictingReservations->count();

        // Calculate how many units are already committed during this period
        $committedCount = $activeAllocationCount + $activeReservationCount;

        // Check if we have enough quantity available
        if ($committedCount >= $tool->quantity) {
            return [
                'available' => false,
                'reason' => "Tool is already fully allocated or reserved for the selected date range. ({$committedCount} commitments, {$tool->quantity} available)",
            ];
        }

        return ['available' => true, 'reason' => null];
    }

    /**
     * Get allocations that conflict with the given date range.
     *
     * @return \Illuminate\Database\Eloquent\Collection<int, ToolAllocation>
     */
    public function getConflictingAllocations(int $toolId, Carbon $startDate, Carbon $endDate)
    {
        $startDateStr = $startDate->toDateString();
        $endDateStr = $endDate->toDateString();

        return ToolAllocation::query()
            ->where('tool_id', $toolId)
            ->whereIn('status', ['BORROWED', 'PENDING_RETURN'])
            ->where(function ($query) use ($startDateStr, $endDateStr): void {
                $query
                    // Allocation starts inside requested range
                    ->whereBetween('borrow_date', [$startDateStr, $endDateStr])
                    // Or allocation ends inside requested range
                    ->orWhereBetween('expected_return_date', [$startDateStr, $endDateStr])
                    // Or allocation fully covers requested range
                    ->orWhere(function ($inner) use ($startDateStr, $endDateStr): void {
                        $inner
                            ->where('borrow_date', '<=', $startDateStr)
                            ->where('expected_return_date', '>=', $endDateStr);
                    });
            })
            ->get();
    }

    /**
     * Get reservations that conflict with the given date range.
     *
     * @param  int|null  $excludeReservationId  Optional reservation ID to exclude
     * @return \Illuminate\Database\Eloquent\Collection<int, Reservation>
     */
    public function getConflictingReservations(int $toolId, Carbon $startDate, Carbon $endDate, ?int $excludeReservationId = null)
    {
        $startDateStr = $startDate->toDateString();
        $endDateStr = $endDate->toDateString();

        return Reservation::query()
            ->where('tool_id', $toolId)
            ->whereIn('status', ['PENDING', 'UPCOMING'])
            ->when($excludeReservationId !== null, function ($query) use ($excludeReservationId): void {
                $query->where('id', '!=', $excludeReservationId);
            })
            ->where(function ($query) use ($startDateStr, $endDateStr): void {
                $query
                    // Reservation starts inside requested range
                    ->whereBetween('start_date', [$startDateStr, $endDateStr])
                    // Or reservation ends inside requested range
                    ->orWhereBetween('end_date', [$startDateStr, $endDateStr])
                    // Or reservation fully covers requested range
                    ->orWhere(function ($inner) use ($startDateStr, $endDateStr): void {
                        $inner
                            ->where('start_date', '<=', $startDateStr)
                            ->where('end_date', '>=', $endDateStr);
                    });
            })
            ->get();
    }

    /**
     * Check if a user already has an overlapping reservation for the same tool.
     *
     * @param  int|null  $excludeReservationId  Optional reservation ID to exclude
     */
    public function hasUserOverlappingReservation(int $toolId, int $userId, Carbon $startDate, Carbon $endDate, ?int $excludeReservationId = null): bool
    {
        $startDateStr = $startDate->toDateString();
        $endDateStr = $endDate->toDateString();

        return Reservation::query()
            ->where('tool_id', $toolId)
            ->where('user_id', $userId)
            ->whereIn('status', ['PENDING', 'UPCOMING'])
            ->when($excludeReservationId !== null, function ($query) use ($excludeReservationId): void {
                $query->where('id', '!=', $excludeReservationId);
            })
            ->where(function ($query) use ($startDateStr, $endDateStr): void {
                $query
                    ->whereBetween('start_date', [$startDateStr, $endDateStr])
                    ->orWhereBetween('end_date', [$startDateStr, $endDateStr])
                    ->orWhere(function ($inner) use ($startDateStr, $endDateStr): void {
                        $inner
                            ->where('start_date', '<=', $startDateStr)
                            ->where('end_date', '>=', $endDateStr);
                    });
            })
            ->exists();
    }

    /**
     * Calculate real-time availability for a tool.
     * Returns total quantity, borrowed count, reserved count, and calculated available count.
     *
     * @return array{total_quantity: int, borrowed_count: int, reserved_count: int, available_count: int}
     */
    public function calculateAvailability(int $toolId): array
    {
        $tool = Tool::query()->find($toolId);
        if (! $tool) {
            return [
                'total_quantity' => 0,
                'borrowed_count' => 0,
                'reserved_count' => 0,
                'available_count' => 0,
            ];
        }

        $totalQuantity = (int) $tool->quantity;

        // Count active borrowings (BORROWED or PENDING_RETURN)
        $borrowedCount = ToolAllocation::query()
            ->where('tool_id', $toolId)
            ->whereIn('status', ['BORROWED', 'PENDING_RETURN'])
            ->count();

        // Count active reservations (PENDING, UPCOMING)
        // Note: ACTIVE reservations have already created allocations, so they're counted in borrowed_count
        $reservedCount = Reservation::query()
            ->where('tool_id', $toolId)
            ->whereIn('status', ['PENDING', 'UPCOMING'])
            ->count();

        // Calculate available: total - borrowed - reserved
        // Note: This is a simplified calculation. For date-specific availability,
        // use checkAvailability() with specific date ranges.
        $availableCount = max(0, $totalQuantity - $borrowedCount - $reservedCount);

        return [
            'total_quantity' => $totalQuantity,
            'borrowed_count' => $borrowedCount,
            'reserved_count' => $reservedCount,
            'available_count' => $availableCount,
        ];
    }

    /**
     * Get count of active reservations for a tool.
     */
    public function getReservedCount(int $toolId): int
    {
        return Reservation::query()
            ->where('tool_id', $toolId)
            ->whereIn('status', ['PENDING', 'UPCOMING'])
            ->count();
    }
}
