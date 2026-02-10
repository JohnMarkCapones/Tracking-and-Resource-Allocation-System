<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ToolCategory extends Model
{
    use HasFactory;

    /** Disabled so inserts work even if the table was created without created_at/updated_at columns. */
    public $timestamps = false;

    protected $fillable = [
        'name',
    ];

    public function tools(): HasMany
    {
        return $this->hasMany(Tool::class, 'category_id');
    }
}
