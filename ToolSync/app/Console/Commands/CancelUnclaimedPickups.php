<?php

namespace App\Console\Commands;

use App\Models\ToolAllocation;
use App\Models\User;
use App\Notifications\InAppSystemNotification;
use App\Services\ActivityLogger;
use App\Services\ToolAvailabilityService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Schema;

class CancelUnclaimedPickups extends Command
{
    protected $signature = 'allocations:cancel-unclaimed-pickups {--dry-run : Preview unclaimed pickups without updating records}';

    protected $aliases = ['allocations:cancel-missed-pickups'];

    protected $description = 'Automatically cancel scheduled pickups that were not claimed on or before pickup date';

    public function handle(): int
    {
        if (! Schema::hasTable('tool_allocations')) {
            $this->warn('tool_allocations table not found.');

            return self::SUCCESS;
        }

        foreach (['cancelled_at', 'cancellation_reason', 'penalty_until'] as $requiredColumn) {
            if (! Schema::hasColumn('tool_allocations', $requiredColumn)) {
                $this->warn("Required column {$requiredColumn} is missing. Run migrations first.");

                return self::INVALID;
            }
        }
        $hasUnclaimedAt = Schema::hasColumn('tool_allocations', 'unclaimed_at');
        $hasMissedPickupAt = Schema::hasColumn('tool_allocations', 'missed_pickup_at');
        if (! $hasUnclaimedAt && ! $hasMissedPickupAt) {
            $this->warn('Required column unclaimed_at (or legacy missed_pickup_at) is missing. Run migrations first.');

            return self::INVALID;
        }

        $isDryRun = (bool) $this->option('dry-run');
        $today = now()->startOfDay();
        $todayDate = $today->toDateString();
        $processed = 0;

        $query = ToolAllocation::query()
            ->where('status', 'SCHEDULED')
            ->whereDate('borrow_date', '<', $todayDate)
            ->with(['user', 'tool'])
            ->orderBy('id');

        $candidateCount = (clone $query)->count();
        if ($candidateCount === 0) {
            $this->info('No unclaimed scheduled pickups found.');

            return self::SUCCESS;
        }

        if ($isDryRun) {
            $this->info("{$candidateCount} allocation(s) would be auto-cancelled.");
            $query->limit(25)->get()->each(function (ToolAllocation $allocation): void {
                $pickupDate = substr((string) $allocation->getRawOriginal('borrow_date'), 0, 10);
                $this->line("- #{$allocation->id} | user {$allocation->user_id} | tool {$allocation->tool_id} | pickup {$pickupDate}");
            });

            return self::SUCCESS;
        }

        $penaltyDays = app(ToolAvailabilityService::class)->getUnclaimedPickupPenaltyDays();
        $adminRecipients = User::query()->where('role', 'ADMIN')->get();

        $query->chunkById(100, function ($allocations) use (&$processed, $today, $penaltyDays, $hasUnclaimedAt, $hasMissedPickupAt): void {
            /** @var ToolAllocation $allocation */
            foreach ($allocations as $allocation) {
                $updatedAllocation = DB::transaction(function () use ($allocation, $today, $penaltyDays, $hasUnclaimedAt, $hasMissedPickupAt): ?ToolAllocation {
                    /** @var ToolAllocation $lockedAllocation */
                    $lockedAllocation = ToolAllocation::query()->lockForUpdate()->findOrFail($allocation->id);
                    if ($lockedAllocation->status !== 'SCHEDULED') {
                        return null;
                    }

                    $pickupDate = Carbon::parse(substr((string) $lockedAllocation->getRawOriginal('borrow_date'), 0, 10))->startOfDay();
                    if (! $pickupDate->lt($today)) {
                        return null;
                    }

                    $penaltyUntil = now()->copy()->addDays($penaltyDays)->endOfDay();
                    $updatePayload = [
                        'status' => 'CANCELLED',
                        'cancelled_at' => now(),
                        'cancellation_reason' => 'Unclaimed pickup - automatically cancelled',
                        'penalty_until' => $penaltyUntil,
                    ];
                    if ($hasUnclaimedAt) {
                        $updatePayload['unclaimed_at'] = now();
                    }
                    if ($hasMissedPickupAt) {
                        $updatePayload['missed_pickup_at'] = now();
                    }

                    $lockedAllocation->update($updatePayload);

                    return $lockedAllocation->fresh(['user', 'tool']);
                });

                if (! $updatedAllocation) {
                    continue;
                }

                $processed++;
                $toolName = $updatedAllocation->tool?->name ?? "Tool #{$updatedAllocation->tool_id}";
                $penaltyLabel = $updatedAllocation->penalty_until?->toFormattedDateString() ?? 'the restriction period ends';

                ActivityLogger::log(
                    'tool_allocation.auto_cancelled_unclaimed_pickup',
                    'ToolAllocation',
                    $updatedAllocation->id,
                    "Scheduled pickup #{$updatedAllocation->id} was auto-cancelled after an unclaimed pickup.",
                    [
                        'tool_id' => $updatedAllocation->tool_id,
                        'user_id' => $updatedAllocation->user_id,
                        'new_status' => 'CANCELLED',
                        'reason' => $updatedAllocation->cancellation_reason,
                        'penalty_until' => $updatedAllocation->penalty_until?->toDateTimeString(),
                    ],
                    null
                );

                $updatedAllocation->user?->notify(new InAppSystemNotification(
                    'alert',
                    'Unclaimed pickup reservation cancelled',
                    "Your scheduled pickup for {$toolName} was unclaimed and has been automatically cancelled. You can request this tool again after {$penaltyLabel}.",
                    '/borrowings'
                ));
            }
        });

        if ($processed > 0 && $adminRecipients->isNotEmpty()) {
            Notification::send($adminRecipients, new InAppSystemNotification(
                'alert',
                'Unclaimed pickups auto-cancelled',
                "{$processed} unclaimed scheduled pickup(s) were automatically cancelled today.",
                '/admin/allocation-history'
            ));
        }

        $this->info("Auto-cancelled {$processed} unclaimed pickup allocation(s).");

        return self::SUCCESS;
    }
}
