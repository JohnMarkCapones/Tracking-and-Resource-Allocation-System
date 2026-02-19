<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ToolAllocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'tool_id',
        'user_id',
        'borrow_date',
        'expected_return_date',
        'actual_return_date',
        'note',
        'condition',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'actual_return_date' => 'datetime',
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
}
