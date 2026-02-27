<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Tool extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'slug',
        'description',
        'image_path',
        'category_id',
        'status',
        'condition',
        'quantity',
        'specifications',
    ];

    protected static function booted(): void
    {
        static::saving(function (Tool $tool): void {
            if ($tool->isDirty('name') || empty($tool->slug)) {
                $tool->slug = self::uniqueSlugForName($tool->name, $tool->id);
            }
        });
    }

    /**
     * Generate a unique slug from the tool name (used for URL and when name changes).
     */
    public static function uniqueSlugForName(string $name, ?int $excludeId = null): string
    {
        $base = Str::slug($name);
        if ($base === '') {
            $base = 'tool';
        }
        $query = static::query()->where('slug', 'like', $base.'%');
        if ($excludeId !== null) {
            $query->where('id', '!=', $excludeId);
        }
        $existing = $query->pluck('slug')->all();
        $slug = $base;
        $n = 0;
        while (in_array($slug, $existing, true)) {
            $n++;
            $slug = $base.'-'.$n;
        }

        return $slug;
    }

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

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
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

    public function conditionHistories(): HasMany
    {
        return $this->hasMany(ToolConditionHistory::class);
    }

    /**
     * Get a human-friendly identifier for the tool.
     *
     * Prefer the explicit `code` when present, otherwise fall back to "TL-{id}" so
     * all parts of the system can display a consistent identifier.
     */
    public function displayCode(): string
    {
        if (is_string($this->code) && trim($this->code) !== '') {
            return trim($this->code);
        }

        return 'TL-'.$this->id;
    }
}
