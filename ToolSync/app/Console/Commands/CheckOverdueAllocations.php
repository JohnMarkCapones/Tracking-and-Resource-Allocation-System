<?php

namespace App\Console\Commands;

use App\Models\ToolAllocation;
use App\Models\User;
use App\Notifications\InAppSystemNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Notification;

class CheckOverdueAllocations extends Command
{
    protected $signature = 'allocations:check-overdue';

    protected $description = 'Notify users and admins about overdue tool allocations';

    public function handle(): int
    {
        $today = now()->toDateString();

        $overdueAllocations = ToolAllocation::query()
            ->where('status', 'BORROWED')
            ->whereRaw('DATE(expected_return_date) < ?', [$today])
            ->with(['user', 'tool'])
            ->get();

        if ($overdueAllocations->isEmpty()) {
            $this->info('No overdue allocations found.');

            return self::SUCCESS;
        }

        $admins = User::query()->where('role', 'ADMIN')->get();

        foreach ($overdueAllocations as $allocation) {
            $toolName = $allocation->tool?->name ?? "Tool #{$allocation->tool_id}";
            $dueDate = substr((string) $allocation->getRawOriginal('expected_return_date'), 0, 10);

            $allocation->user?->notify(new InAppSystemNotification(
                'alert',
                'Overdue return',
                "Your borrowing of {$toolName} was due on {$dueDate}. Please return it as soon as possible.",
                '/borrowings'
            ));
        }

        $overdueCount = $overdueAllocations->count();

        if ($admins->isNotEmpty()) {
            Notification::send($admins, new InAppSystemNotification(
                'alert',
                'Overdue tools summary',
                "{$overdueCount} tool borrowing(s) are overdue. Review the allocation history to follow up.",
                '/admin/allocation-history'
            ));
        }

        $this->info("Notified {$overdueCount} overdue borrower(s) and admin(s).");

        return self::SUCCESS;
    }
}
