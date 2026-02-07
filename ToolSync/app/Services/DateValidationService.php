<?php

namespace App\Services;

use App\Models\BusinessHour;
use App\Models\Holiday;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class DateValidationService
{
    /**
     * Check if a date range overlaps any holiday. Returns list of holiday names that overlap.
     *
     * @return array<int, string>
     */
    public function getHolidaysInRange(Carbon $from, Carbon $to): array
    {
        $holidays = Holiday::query()
            ->whereDate('date', '>=', $from->toDateString())
            ->whereDate('date', '<=', $to->toDateString())
            ->pluck('name', 'id')
            ->toArray();

        return array_values($holidays);
    }

    /**
     * Check if every day in the range has at least one open business hour (so pickups/returns are allowed).
     * Returns list of dates (Y-m-d) that are closed.
     *
     * @return array<int, string>
     */
    public function getClosedDatesInRange(Carbon $from, Carbon $to): array
    {
        $period = CarbonPeriod::create($from->copy()->startOfDay(), $to->copy()->endOfDay());
        $closed = [];
        $hoursByDay = BusinessHour::query()->get()->keyBy('day_of_week');

        foreach ($period as $date) {
            $dayOfWeek = (int) $date->format('w'); // 0 = Sunday
            $bh = $hoursByDay->get($dayOfWeek);
            if (! $bh || ! $bh->enabled) {
                $closed[] = $date->toDateString();
            }
        }

        return $closed;
    }

    /**
     * Validate that the range does not fall on holidays or closed days.
     * Returns array of error messages; empty if valid.
     *
     * @return array<int, string>
     */
    public function validateRangeForBooking(Carbon $from, Carbon $to): array
    {
        $errors = [];

        $holidays = $this->getHolidaysInRange($from, $to);
        if ($holidays !== []) {
            $errors[] = 'Selected dates fall on holiday(s): '.implode(', ', $holidays);
        }

        $closedDates = $this->getClosedDatesInRange($from, $to);
        if ($closedDates !== []) {
            $extra = count($closedDates) > 5 ? ' (and '.(count($closedDates) - 5).' more)' : '';
            $errors[] = 'Selected range includes closed days: '.implode(', ', array_slice($closedDates, 0, 5)).$extra;
        }

        return $errors;
    }
}
