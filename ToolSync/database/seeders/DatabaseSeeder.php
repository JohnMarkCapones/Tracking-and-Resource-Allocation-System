<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(BusinessHourSeeder::class);
        $this->call(CategorySeeder::class);
        $this->call(DepartmentSeeder::class);

        $firstDepartmentId = Department::query()->first()?->id;

        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
                'department_id' => $firstDepartmentId,
            ]
        );

        $admin = User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'role' => 'ADMIN',
                'password' => bcrypt('password'),
                'department_id' => $firstDepartmentId,
            ]
        );

        $admin->forceFill([
            'email_verified_at' => now(),
        ])->save();

        $this->call(ToolSeeder::class);
        $this->call(SetToolQuantitiesToOneSeeder::class);
    }
}
