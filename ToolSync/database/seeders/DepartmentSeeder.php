<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        if (! Schema::hasTable('departments')) {
            return;
        }

        $departments = [
            'Engineering',
            'Marketing',
            'Human Resources',
            'Finance',
            'Operations',
            'IT & Support',
            'Sales',
            'Design',
            'Customer Success',
            'Legal',
        ];

        foreach ($departments as $name) {
            Department::firstOrCreate(['name' => $name]);
        }
    }
}
