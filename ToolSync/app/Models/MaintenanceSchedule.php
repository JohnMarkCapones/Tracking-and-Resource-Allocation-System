<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceSchedule extends Model
{
    /**
     * Scope: schedules that require the tool to be unavailable for borrowing.
     * Equipment is available until the maintenance start date; only block when
     * the date has arrived (today or past) or maintenance is in progress/overdue.
     */
    public function scopeActiveForMaintenance(Builder $query): Builder
    {
        return $query->where(function (Builder $q): void {
            $q->whereIn('status', ['in_progress', 'overdue'])
                ->orWhere(function (Builder $q2): void {
                    $q2->where('status', 'scheduled')
                        ->where('scheduled_date', '<=', now()->startOfDay());
                });
        });
    }

    protected $fillable = [
        'tool_id',
        'type',
        'scheduled_date',
        'completed_date',
        'assignee',
        'status',
        'notes',
        'usage_count',
        'trigger_threshold',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_date' => 'date',
            'completed_date' => 'date',
        ];
    }

    public function tool(): BelongsTo
    {
        return $this->belongsTo(Tool::class);
    }
}
