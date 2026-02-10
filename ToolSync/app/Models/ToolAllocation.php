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
        'status',
    ];

    protected function casts(): array
    {
        return [
            // Use 'datetime:Y-m-d' so the JSON output is a plain date string (e.g. "2026-02-10")
            // WITHOUT converting to UTC first. The plain 'date' / 'datetime' casts convert to UTC
            // which shifts the date back by 8 hours (Asia/Manila) causing Feb 10 to appear as Feb 9.
            'borrow_date' => 'datetime:Y-m-d',
            'expected_return_date' => 'datetime:Y-m-d',
            'actual_return_date' => 'datetime',
        ];
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
