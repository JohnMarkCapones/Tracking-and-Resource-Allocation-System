<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ToolDeprecation extends Model
{
    protected $fillable = [
        'tool_id',
        'reason',
        'retire_date',
        'replacement_tool_id',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'retire_date' => 'date',
        ];
    }

    public function tool(): BelongsTo
    {
        return $this->belongsTo(Tool::class);
    }

    public function replacementTool(): BelongsTo
    {
        return $this->belongsTo(Tool::class, 'replacement_tool_id');
    }
}
