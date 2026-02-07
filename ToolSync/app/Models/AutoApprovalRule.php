<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AutoApprovalRule extends Model
{
    protected $fillable = ['name', 'condition', 'enabled'];

    protected function casts(): array
    {
        return [
            'enabled' => 'boolean',
        ];
    }
}
