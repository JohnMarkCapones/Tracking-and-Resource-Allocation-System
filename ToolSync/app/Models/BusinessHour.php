<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BusinessHour extends Model
{
    protected $fillable = ['day_of_week', 'enabled', 'open_time', 'close_time'];

    protected function casts(): array
    {
        return [
            'enabled' => 'boolean',
        ];
    }
}
