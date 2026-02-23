<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ToolConditionHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'tool_id',
        'allocation_id',
        'borrower_id',
        'admin_id',
        'borrower_condition',
        'borrower_notes',
        'borrower_images',
        'admin_condition',
        'admin_notes',
        'admin_images',
        'admin_reviewed_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'borrower_images' => 'array',
            'admin_images' => 'array',
            'admin_reviewed_at' => 'datetime',
        ];
    }

    public function tool(): BelongsTo
    {
        return $this->belongsTo(Tool::class);
    }

    public function allocation(): BelongsTo
    {
        return $this->belongsTo(ToolAllocation::class, 'allocation_id');
    }

    public function borrower(): BelongsTo
    {
        return $this->belongsTo(User::class, 'borrower_id');
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
