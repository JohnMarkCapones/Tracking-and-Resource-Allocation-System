<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'tool_id',
        'user_id',
        'start_date',
        'end_date',
        'status',
        'recurring',
        'recurrence_pattern',
    ];

    protected function casts(): array
    {
        return [
            // Date-only domain fields (no time component).
            'start_date' => 'date',
            'end_date' => 'date',
            'recurring' => 'boolean',
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
