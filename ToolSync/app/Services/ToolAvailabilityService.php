<?php

namespace App\Services;

use App\Models\MaintenanceSchedule;
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
     * Reservation rows that should reserve inventory slots.
     *
     * Keep UPCOMING for backward compatibility with legacy rows until all
     * environments run the status-simplification migration.
     *
     * @var array<int, string>
     */
    private const RESERVATION_COMMITMENT_STATUSES = ['PENDING', 'UPCOMING'];

    /**
     * Allocation rows that consume inventory slots.
     *
     * @var array<int, string>
     */
    private const ALLOCATION_COMMITMENT_STATUSES = ['SCHEDULED', 'BORROWED', 'PENDING_RETURN'];

    /**
     * Check if a tool is available for the given date range, considering:
     * - Tool status and quantity
     * - Existing allocations (BORROWED, PENDING_RETURN)
     * - Existing reservations (PENDING — awaiting admin approval)
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

        // Equipment must be returned before maintenance start date
        $blockingMaintenance = MaintenanceSchedule::query()
            ->where('tool_id', $toolId)
            ->whereIn('status', ['scheduled', 'in_progress', 'overdue'])
            ->where('scheduled_date', '<=', $endDate->toDateString())
            ->orderBy('scheduled_date')
            ->first();
        if ($blockingMaintenance) {
            return [
                'available' => false,
                'reason' => "Tool has scheduled maintenance on {$blockingMaintenance->scheduled_date->toDateString()}. Return date must be before maintenance start.",
            ];
        }

        $dateRangeAvailability = $this->calculateDateRangeAvailability($toolId, $startDate, $endDate, $excludeReservationId);
        if ($dateRangeAvailability['available_count'] < 1) {
            $minAvailable = (int) $dateRangeAvailability['available_count'];
            $maxCommitted = max(
                (int) $dateRangeAvailability['borrowed_count'] + (int) $dateRangeAvailability['reserved_count'],
                0
            );

            return [
                'available' => false,
                'reason' => "Tool is already fully allocated or reserved for the selected date range. ({$maxCommitted} commitments, {$tool->quantity} available, {$minAvailable} free at minimum)",
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
            ->whereIn('status', self::ALLOCATION_COMMITMENT_STATUSES)
            ->whereDate('borrow_date', '<=', $endDateStr)
            ->whereDate('expected_return_date', '>=', $startDateStr)
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
            ->whereIn('status', self::RESERVATION_COMMITMENT_STATUSES)
            ->when($excludeReservationId !== null, function ($query) use ($excludeReservationId): void {
                $query->where('id', '!=', $excludeReservationId);
            })
            ->whereDate('start_date', '<=', $endDateStr)
            ->whereDate('end_date', '>=', $startDateStr)
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
            ->whereIn('status', self::RESERVATION_COMMITMENT_STATUSES)
            ->when($excludeReservationId !== null, function ($query) use ($excludeReservationId): void {
                $query->where('id', '!=', $excludeReservationId);
            })
            ->whereDate('start_date', '<=', $endDateStr)
            ->whereDate('end_date', '>=', $startDateStr)
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

        $today = Carbon::today();
        $rangeAvailability = $this->calculateDateRangeAvailability($toolId, $today, $today);

        return [
            'total_quantity' => (int) $tool->quantity,
            'borrowed_count' => (int) $rangeAvailability['borrowed_count'],
            'reserved_count' => (int) $rangeAvailability['reserved_count'],
            'available_count' => (int) $rangeAvailability['available_count'],
        ];
    }

    /**
     * Return the date ranges that conflict with the requested period.
     * Used to give users specific feedback about why their request was blocked.
     *
     * @return array<int, array{from: string, to: string, type: string}>
     */
    public function getConflictingDateRanges(int $toolId, Carbon $startDate, Carbon $endDate): array
    {
        $ranges = [];

        foreach ($this->getConflictingAllocations($toolId, $startDate, $endDate) as $allocation) {
            $ranges[] = [
                'from' => substr((string) $allocation->getRawOriginal('borrow_date'), 0, 10),
                'to' => substr((string) $allocation->getRawOriginal('expected_return_date'), 0, 10),
                'type' => 'allocation',
            ];
        }

        foreach ($this->getConflictingReservations($toolId, $startDate, $endDate) as $reservation) {
            $ranges[] = [
                'from' => substr((string) $reservation->getRawOriginal('start_date'), 0, 10),
                'to' => substr((string) $reservation->getRawOriginal('end_date'), 0, 10),
                'type' => 'reservation',
            ];
        }

        foreach ($this->getBlockingMaintenanceSchedules($toolId, $startDate, $endDate) as $maintenance) {
            $ranges[] = [
                'from' => $maintenance->scheduled_date->toDateString(),
                'to' => $maintenance->scheduled_date->toDateString(),
                'type' => 'maintenance',
            ];
        }

        return $ranges;
    }

    /**
     * Get maintenance schedules that block the given date range.
     * Equipment must be returned before maintenance start date.
     *
     * @return \Illuminate\Database\Eloquent\Collection<int, MaintenanceSchedule>
     */
    public function getBlockingMaintenanceSchedules(int $toolId, Carbon $startDate, Carbon $endDate)
    {
        return MaintenanceSchedule::query()
            ->where('tool_id', $toolId)
            ->whereIn('status', ['scheduled', 'in_progress', 'overdue'])
            ->where('scheduled_date', '<=', $endDate->toDateString())
            ->orderBy('scheduled_date')
            ->get();
    }

    /**
     * Get count of active reservations for a tool.
     */
    public function getReservedCount(int $toolId): int
    {
        return Reservation::query()
            ->where('tool_id', $toolId)
            ->whereIn('status', self::RESERVATION_COMMITMENT_STATUSES)
            ->count();
    }

    /**
     * Calculate availability for a specific date range.
     * Returns detailed availability information including reservations.
     *
     * @return array{total_quantity: int, borrowed_count: int, reserved_count: int, available_count: int, available_for_dates: array}
     */
    public function calculateDateRangeAvailability(int $toolId, Carbon $startDate, Carbon $endDate, ?int $excludeReservationId = null): array
    {
        $tool = Tool::query()->find($toolId);
        if (! $tool) {
            return [
                'total_quantity' => 0,
                'borrowed_count' => 0,
                'reserved_count' => 0,
                'available_count' => 0,
                'available_for_dates' => [],
            ];
        }

        $rangeStart = $startDate->copy()->startOfDay();
        $rangeEnd = $endDate->copy()->endOfDay();

        $totalQuantity = (int) $tool->quantity;

        $overlappingAllocations = ToolAllocation::query()
            ->where('tool_id', $toolId)
            ->whereIn('status', self::ALLOCATION_COMMITMENT_STATUSES)
            ->whereDate('borrow_date', '<=', $endDate->toDateString())
            ->whereDate('expected_return_date', '>=', $startDate->toDateString())
            ->get(['borrow_date', 'expected_return_date']);

        $overlappingReservations = Reservation::query()
            ->where('tool_id', $toolId)
            ->whereIn('status', self::RESERVATION_COMMITMENT_STATUSES)
            ->when($excludeReservationId !== null, function ($query) use ($excludeReservationId): void {
                $query->where('id', '!=', $excludeReservationId);
            })
            ->whereDate('start_date', '<=', $endDate->toDateString())
            ->whereDate('end_date', '>=', $startDate->toDateString())
            ->get(['start_date', 'end_date']);

        // Generate day-by-day availability for the date range
        $availableForDates = [];
        $minAvailable = $totalQuantity;
        $maxBorrowed = 0;
        $maxReserved = 0;

        $current = $rangeStart->copy();
        while ($current->lte($rangeEnd)) {
            $currentDate = $current->toDateString();

            $dayBorrowed = $overlappingAllocations->filter(function (ToolAllocation $allocation) use ($currentDate): bool {
                $borrowDate = substr((string) $allocation->getRawOriginal('borrow_date'), 0, 10);
                $expectedReturnDate = substr((string) $allocation->getRawOriginal('expected_return_date'), 0, 10);

                return $borrowDate <= $currentDate && $expectedReturnDate >= $currentDate;
            })->count();

            $dayReserved = $overlappingReservations->filter(function (Reservation $reservation) use ($currentDate): bool {
                $startDate = substr((string) $reservation->getRawOriginal('start_date'), 0, 10);
                $endDate = substr((string) $reservation->getRawOriginal('end_date'), 0, 10);

                return $startDate <= $currentDate && $endDate >= $currentDate;
            })->count();

            $dayAvailable = max(0, $totalQuantity - $dayBorrowed - $dayReserved);
            $minAvailable = min($minAvailable, $dayAvailable);
            $maxBorrowed = max($maxBorrowed, $dayBorrowed);
            $maxReserved = max($maxReserved, $dayReserved);

            $availableForDates[$currentDate] = $dayAvailable;
            $current->addDay();
        }

        return [
            'total_quantity' => $totalQuantity,
            'borrowed_count' => $maxBorrowed,
            'reserved_count' => $maxReserved,
            'available_count' => $minAvailable,
            'available_for_dates' => $availableForDates,
        ];
    }

    /**
     * Get real-time availability status for a tool considering current date.
     * Returns whether tool should be shown as available, partially available, or unavailable.
     *
     * @return array{status: string, available_count: int, reserved_count: int, message: string}
     */
    public function getRealTimeAvailabilityStatus(int $toolId): array
    {
        $tool = Tool::query()->find($toolId);
        if (! $tool) {
            return [
                'status' => 'unavailable',
                'available_count' => 0,
                'reserved_count' => 0,
                'message' => 'Tool not found.',
            ];
        }

        $today = Carbon::today();
        $availability = $this->calculateDateRangeAvailability($toolId, $today, $today);

        if ($tool->status !== 'AVAILABLE') {
            return [
                'status' => 'unavailable',
                'available_count' => 0,
                'reserved_count' => $availability['reserved_count'],
                'message' => "Tool is {$tool->status}.",
            ];
        }

        if ($availability['available_count'] >= $tool->quantity) {
            return [
                'status' => 'available',
                'available_count' => $availability['available_count'],
                'reserved_count' => $availability['reserved_count'],
                'message' => 'Tool is available for immediate borrowing.',
            ];
        } elseif ($availability['available_count'] > 0) {
            return [
                'status' => 'partially_available',
                'available_count' => $availability['available_count'],
                'reserved_count' => $availability['reserved_count'],
                'message' => "Only {$availability['available_count']} of {$tool->quantity} units available. {$availability['reserved_count']} reserved.",
            ];
        } else {
            return [
                'status' => 'fully_reserved',
                'available_count' => 0,
                'reserved_count' => $availability['reserved_count'],
                'message' => "All {$tool->quantity} units are currently borrowed or reserved.",
            ];
        }
    }
}
