<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(): Response
    {
        // Static mock data for the admin dashboard. This lets us
        // focus on UI and layout first, and swap in real queries later.
        $totalTools = 80;
        $availableTools = 45;
        $borrowedTools = 20;
        $toolsUnderMaintenance = 5;
        $totalUsers = 25;
        $activeBorrowings = 12;

        return Inertia::render('Dashboard/AdminDashboardPage', [
            'metrics' => [
                'totalTools' => $totalTools,
                'availableTools' => $availableTools,
                'borrowedTools' => $borrowedTools,
                'toolsUnderMaintenance' => $toolsUnderMaintenance,
                'totalUsers' => $totalUsers,
                'activeBorrowings' => $activeBorrowings,
            ],
            'mostBorrowedTools' => [
                ['name' => 'Laptop', 'count' => 18],
                ['name' => 'Projector', 'count' => 15],
                ['name' => 'Camera', 'count' => 9],
            ],
            'borrowingStatus' => [
                ['label' => 'Laptop', 'value' => 50],
                ['label' => 'Projector', 'value' => 50],
            ],
        ]);
    }
}
