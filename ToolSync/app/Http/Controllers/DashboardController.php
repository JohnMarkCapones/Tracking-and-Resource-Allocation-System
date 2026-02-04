<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        // Static mock data for the initial dashboard implementation.
        // This keeps the UI development unblocked while we design
        // the real data contracts and Eloquent queries.
        return Inertia::render('Dashboard/UserDashboardPage', [
            'userName' => 'User',
            'totalTools' => 45,
            'toolsUnderMaintenance' => 3,
            'borrowedItemsCount' => 5,
            'borrowingHistory' => [
                [
                    'equipment' => 'LAPTOP',
                    'toolId' => 'LP-0001',
                    'expectedReturnDate' => 'January 7, 2027',
                    'status' => 'Returned',
                ],
                [
                    'equipment' => 'PROJECTOR',
                    'toolId' => 'PR-0011',
                    'expectedReturnDate' => 'Feb 2, 2026',
                    'status' => 'Borrowed',
                ],
                [
                    'equipment' => 'LAPTOP',
                    'toolId' => 'LP-0023',
                    'expectedReturnDate' => 'January 8, 2026',
                    'status' => 'Overdue',
                ],
            ],
            'summary' => [
                'returnedPercent' => 55,
                'notReturnedPercent' => 45,
            ],
        ]);
    }
}
