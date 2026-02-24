<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ToolAllocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'tool_id',
        'user_id',
        'borrow_date',
        'expected_return_date',
        'claimed_at',
        'claimed_by',
        'actual_return_date',
        'cancelled_at',
        'cancellation_reason',
        'unclaimed_at',
        'missed_pickup_at',
        'penalty_until',
        'note',
        'reported_condition',
        'return_proof_image_path',
        'admin_condition',
        'admin_review_note',
        'admin_reviewed_at',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'claimed_at' => 'datetime',
            'actual_return_date' => 'datetime',
            'cancelled_at' => 'datetime',
            'unclaimed_at' => 'datetime',
            'missed_pickup_at' => 'datetime',
            'penalty_until' => 'datetime',
            'admin_reviewed_at' => 'datetime',
        ];
    }

    /**
     * Override toArray so borrow_date and expected_return_date are always plain Y-m-d strings
     * read directly from the raw DB value. This completely bypasses Carbon/timezone serialization
     * which was shifting dates back by one day (Asia/Manila UTC+8 → UTC conversion).
     */
    public function toArray(): array
    {
        $array = parent::toArray();

        foreach (['borrow_date', 'expected_return_date'] as $field) {
            $raw = $this->getRawOriginal($field);
            if ($raw !== null) {
                // Raw DB value is e.g. "2026-02-10 00:00:00"; take just the date part.
                $array[$field] = substr((string) $raw, 0, 10);
            }
        }

        return $array;
    }

    public function tool(): BelongsTo
    {
        return $this->belongsTo(Tool::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function claimer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'claimed_by');
    }

    public function conditionHistory(): HasOne
    {
        return $this->hasOne(ToolConditionHistory::class, 'allocation_id');
    }
}
