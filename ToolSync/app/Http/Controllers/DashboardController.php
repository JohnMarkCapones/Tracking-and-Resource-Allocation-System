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
        $totalTools = 80;
        $toolsUnderMaintenance = 3;
        $borrowedItemsCount = 12;
        $availableTools = $totalTools - $toolsUnderMaintenance - $borrowedItemsCount;

        return Inertia::render('Dashboard/UserDashboardPage', [
            'userName' => 'User',
            'totalTools' => $totalTools,
            'toolsUnderMaintenance' => $toolsUnderMaintenance,
            'borrowedItemsCount' => $borrowedItemsCount,
            'availableTools' => $availableTools,
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
                'returned' => 45,
                'borrowed' => $borrowedItemsCount,
                'underMaintenance' => $toolsUnderMaintenance,
                'available' => $availableTools,
                'overdue' => 2,
            ],
        ]);
    }

    public function borrowings(): Response
    {
        // Static mock data for the borrowings page.
        $borrowings = [
            [
                'id' => 1,
                'tool' => [
                    'id' => 1,
                    'name' => 'MacBook Pro 14"',
                    'toolId' => 'LP-0001',
                    'category' => 'Laptops',
                ],
                'borrowDate' => 'Jan 15, 2026',
                'dueDate' => '2026-02-15',
                'status' => 'Active',
            ],
            [
                'id' => 2,
                'tool' => [
                    'id' => 3,
                    'name' => 'Epson EB-X51',
                    'toolId' => 'PR-0001',
                    'category' => 'Projectors',
                ],
                'borrowDate' => 'Jan 10, 2026',
                'dueDate' => '2026-01-20',
                'status' => 'Overdue',
            ],
            [
                'id' => 3,
                'tool' => [
                    'id' => 2,
                    'name' => 'Dell XPS 15',
                    'toolId' => 'LP-0002',
                    'category' => 'Laptops',
                ],
                'borrowDate' => 'Dec 1, 2025',
                'dueDate' => '2025-12-15',
                'returnDate' => 'Dec 14, 2025',
                'status' => 'Returned',
            ],
            [
                'id' => 4,
                'tool' => [
                    'id' => 7,
                    'name' => 'Sony WH-1000XM5',
                    'toolId' => 'AE-0001',
                    'category' => 'Audio Equipment',
                ],
                'borrowDate' => 'Nov 20, 2025',
                'dueDate' => '2025-11-30',
                'returnDate' => 'Nov 28, 2025',
                'status' => 'Returned',
            ],
        ];

        return Inertia::render('Borrowings/IndexPage', [
            'borrowings' => $borrowings,
        ]);
    }

    public function notifications(): Response
    {
        // Static mock data for notifications.
        $notifications = [
            [
                'id' => 1,
                'type' => 'alert',
                'title' => 'Tool overdue',
                'message' => 'Your borrowing of Epson EB-X51 (PR-0001) is overdue by 3 days.',
                'createdAt' => '2 hours ago',
                'read' => false,
            ],
            [
                'id' => 2,
                'type' => 'info',
                'title' => 'Return reminder',
                'message' => 'Your borrowing of MacBook Pro 14" (LP-0001) is due in 5 days.',
                'createdAt' => '1 day ago',
                'read' => false,
            ],
            [
                'id' => 3,
                'type' => 'success',
                'title' => 'Request approved',
                'message' => 'Your borrowing request for Dell XPS 15 has been approved by Admin.',
                'createdAt' => '2 days ago',
                'read' => true,
            ],
            [
                'id' => 4,
                'type' => 'maintenance',
                'title' => 'Scheduled maintenance',
                'message' => 'The Canon EOS R6 you frequently borrow will be under maintenance until Feb 10.',
                'createdAt' => '3 days ago',
                'read' => true,
            ],
            [
                'id' => 5,
                'type' => 'info',
                'title' => 'New tool available',
                'message' => 'A new Sony Alpha A7 IV camera has been added to the catalog.',
                'createdAt' => '1 week ago',
                'read' => true,
            ],
        ];

        return Inertia::render('Notifications/IndexPage', [
            'notifications' => $notifications,
        ]);
    }
}
