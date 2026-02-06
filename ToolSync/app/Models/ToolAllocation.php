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
            'borrow_date' => 'datetime',
            'expected_return_date' => 'datetime',
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
