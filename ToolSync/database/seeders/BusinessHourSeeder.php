<?php

namespace Database\Seeders;

use App\Models\BusinessHour;
use Illuminate\Database\Seeder;

class BusinessHourSeeder extends Seeder
{
    /**
     * Seed default business hours so date validation allows bookings.
     * Without these, every day is treated as "closed" and requests fail with
     * "Selected range includes closed days".
     */
    public function run(): void
    {
        $defaults = [
            ['day_of_week' => 0, 'enabled' => true, 'open_time' => '09:00', 'close_time' => '17:00'], // Sunday
            ['day_of_week' => 1, 'enabled' => true, 'open_time' => '09:00', 'close_time' => '17:00'], // Monday
            ['day_of_week' => 2, 'enabled' => true, 'open_time' => '09:00', 'close_time' => '17:00'], // Tuesday
            ['day_of_week' => 3, 'enabled' => true, 'open_time' => '09:00', 'close_time' => '17:00'], // Wednesday
            ['day_of_week' => 4, 'enabled' => true, 'open_time' => '09:00', 'close_time' => '17:00'], // Thursday
            ['day_of_week' => 5, 'enabled' => true, 'open_time' => '09:00', 'close_time' => '17:00'], // Friday
            ['day_of_week' => 6, 'enabled' => true, 'open_time' => '09:00', 'close_time' => '17:00'], // Saturday
        ];

        foreach ($defaults as $row) {
            BusinessHour::query()->updateOrInsert(
                ['day_of_week' => $row['day_of_week']],
                [
                    'enabled' => $row['enabled'],
                    'open_time' => $row['open_time'],
                    'close_time' => $row['close_time'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
