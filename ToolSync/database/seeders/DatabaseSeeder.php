<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(BusinessHourSeeder::class);

        // Ensure a default user exists for tool allocations (e.g. user_id 1).
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
            ]
        );

        // Admin account for managing the system (updateOrCreate so role stays ADMIN).
        $admin = User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'role' => 'ADMIN',
                'password' => bcrypt('password'),
            ]
        );

        // Ensure seeded admin can sign in without email verification flow.
        $admin->forceFill([
            'email_verified_at' => now(),
        ])->save();

        // Set all tools to quantity 1 so one borrow flips status to BORROWED.
        $this->call(SetToolQuantitiesToOneSeeder::class);
    }
}
