<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tool extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'image_path',
        'category_id',
        'status',
        'condition',
        'quantity',
        'specifications',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'specifications' => 'array',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ToolCategory::class, 'category_id');
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(ToolAllocation::class);
    }

    public function statusLogs(): HasMany
    {
        return $this->hasMany(ToolStatusLog::class);
    }

    public function maintenanceSchedules(): HasMany
    {
        return $this->hasMany(MaintenanceSchedule::class);
    }

    public function deprecations(): HasMany
    {
        return $this->hasMany(ToolDeprecation::class);
    }
}
