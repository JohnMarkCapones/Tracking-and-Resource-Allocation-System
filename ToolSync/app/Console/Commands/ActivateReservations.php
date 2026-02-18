<?php

namespace App\Console\Commands;

use App\Models\Reservation;
use App\Models\Tool;
use App\Models\ToolAllocation;
use App\Models\ToolStatusLog;
use App\Services\ActivityLogger;
use App\Services\ToolAvailabilityService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ActivateReservations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reservations:activate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Activate UPCOMING reservations that have reached their start date and create allocations if applicable';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $today = Carbon::today();
        $this->info("Activating reservations for date: {$today->toDateString()}");

        // Find UPCOMING reservations that should be activated today
        $reservationsToActivate = Reservation::query()
            ->where('status', 'UPCOMING')
            ->whereDate('start_date', '<=', $today)
            ->with(['tool', 'user'])
            ->get();

        if ($reservationsToActivate->isEmpty()) {
            $this->info('No reservations to activate.');

            return self::SUCCESS;
        }

        $this->info("Found {$reservationsToActivate->count()} reservation(s) to activate.");

        $activated = 0;
        $skipped = 0;
        $errors = 0;

        $availabilityService = app(ToolAvailabilityService::class);

        foreach ($reservationsToActivate as $reservation) {
            try {
                $startDate = Carbon::parse($reservation->start_date);
                $endDate = Carbon::parse($reservation->end_date);

                // Check if tool is available
                $availabilityCheck = $availabilityService->checkAvailability(
                    $reservation->tool_id,
                    $startDate,
                    $endDate,
                    $reservation->id
                );

                if (! $availabilityCheck['available']) {
                    $this->warn("Reservation #{$reservation->id} skipped: {$availabilityCheck['reason']}");
                    $skipped++;

                    continue;
                }

                // Activate the reservation
                DB::transaction(function () use ($reservation, $startDate, $endDate): void {
                    // Lock the tool
                    $tool = Tool::query()->lockForUpdate()->findOrFail($reservation->tool_id);

                    // Double-check availability after locking
                    if ($tool->status !== 'AVAILABLE' || $tool->quantity < 1) {
                        throw new \RuntimeException("Tool #{$tool->id} is no longer available.");
                    }

                    // Create allocation for ACTIVE reservation
                    $allocation = ToolAllocation::create([
                        'tool_id' => $reservation->tool_id,
                        'user_id' => $reservation->user_id,
                        'borrow_date' => $startDate->format('Y-m-d'),
                        'expected_return_date' => $endDate->format('Y-m-d'),
                        'actual_return_date' => null,
                        'note' => 'Auto-allocated from reservation',
                        'status' => 'BORROWED',
                    ]);

                    // Update tool quantity
                    $oldStatus = $tool->status;
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
                            'changed_by' => null,
                            'changed_at' => now(),
                        ]);
                    }

                    // Update reservation status to COMPLETED since allocation was created
                    $reservation->update(['status' => 'COMPLETED']);

                    ActivityLogger::log(
                        'reservation.activated',
                        'Reservation',
                        $reservation->id,
                        "Reservation #{$reservation->id} activated and allocation #{$allocation->id} created.",
                        ['reservation_id' => $reservation->id, 'allocation_id' => $allocation->id],
                        null
                    );
                });

                $this->info("✓ Activated reservation #{$reservation->id} for tool #{$reservation->tool_id}");
                $activated++;
            } catch (\Exception $e) {
                $this->error("✗ Error activating reservation #{$reservation->id}: {$e->getMessage()}");
                $errors++;
            }
        }

        $this->info("\nSummary:");
        $this->info("  Activated: {$activated}");
        $this->info("  Skipped: {$skipped}");
        $this->info("  Errors: {$errors}");

        return self::SUCCESS;
    }
}
