<?php

namespace App\Http\Controllers;

use App\Models\User;
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
        $returnedCount = 0;
        $toolsUnderMaintenance = 5;
        $totalUsers = 25;
        $activeBorrowings = 12;

        return Inertia::render('Dashboard/AdminDashboardPage', [
            'metrics' => [
                'totalTools' => $totalTools,
                'availableTools' => $availableTools,
                'returnedCount' => $returnedCount,
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

    public function allocationHistory(): Response
    {
        // Static mock data for allocation history. Later this can be
        // wired to real borrowing records from the database.
        $allocations = [
            [
                'id' => 1,
                'tool' => 'HP LaserJet Pro M404dn',
                'toolId' => 'LP-00011',
                'category' => 'Printers',
                'borrower' => 'user@gmail.com',
                'borrowDate' => 'Jan. 30, 2026',
                'expectedReturn' => 'Feb. 8, 2026',
                'status' => 'Returned',
                'statusDetail' => 'Returned on February 8, 2026',
            ],
            [
                'id' => 2,
                'tool' => 'Deli Projector Screen',
                'toolId' => 'PR-00020',
                'category' => 'Projectors',
                'borrower' => 'user@gmail.com',
                'borrowDate' => 'Jan. 30, 2026',
                'expectedReturn' => 'Feb. 8, 2026',
                'status' => 'Active',
                'statusDetail' => 'Due on February 8, 2026',
            ],
            [
                'id' => 3,
                'tool' => 'HP LaserJet Pro M404dn',
                'toolId' => 'LP-00021',
                'category' => 'Printers',
                'borrower' => 'user@gmail.com',
                'borrowDate' => 'Jan. 30, 2026',
                'expectedReturn' => 'Feb. 8, 2026',
                'status' => 'Overdue',
                'statusDetail' => 'Overdue since February 10, 2026',
            ],
        ];

        return Inertia::render('Dashboard/AdminAllocationHistoryPage', [
            'allocations' => $allocations,
        ]);
    }

    public function tools(): Response
    {
        // Static mock data for tools management.
        $tools = [
            [
                'id' => 1,
                'name' => 'MacBook Pro 14"',
                'toolId' => 'LP-0001',
                'category' => 'Laptops',
                'status' => 'Available',
                'condition' => 'Excellent',
                'lastMaintenance' => 'Jan 15, 2026',
                'totalBorrowings' => 24,
            ],
            [
                'id' => 2,
                'name' => 'Dell XPS 15',
                'toolId' => 'LP-0002',
                'category' => 'Laptops',
                'status' => 'Borrowed',
                'condition' => 'Good',
                'lastMaintenance' => 'Dec 20, 2025',
                'totalBorrowings' => 18,
            ],
            [
                'id' => 3,
                'name' => 'Epson EB-X51',
                'toolId' => 'PR-0001',
                'category' => 'Projectors',
                'status' => 'Available',
                'condition' => 'Good',
                'lastMaintenance' => 'Jan 10, 2026',
                'totalBorrowings' => 32,
            ],
            [
                'id' => 4,
                'name' => 'Canon EOS R6',
                'toolId' => 'CM-0001',
                'category' => 'Cameras',
                'status' => 'Maintenance',
                'condition' => 'Fair',
                'lastMaintenance' => 'Feb 1, 2026',
                'totalBorrowings' => 15,
            ],
            [
                'id' => 5,
                'name' => 'HP LaserJet Pro M404dn',
                'toolId' => 'PT-0001',
                'category' => 'Printers',
                'status' => 'Available',
                'condition' => 'Good',
                'lastMaintenance' => 'Jan 25, 2026',
                'totalBorrowings' => 8,
            ],
            [
                'id' => 6,
                'name' => 'iPad Pro 12.9"',
                'toolId' => 'TB-0001',
                'category' => 'Tablets',
                'status' => 'Borrowed',
                'condition' => 'Excellent',
                'lastMaintenance' => 'Jan 5, 2026',
                'totalBorrowings' => 21,
            ],
            [
                'id' => 7,
                'name' => 'Sony WH-1000XM5',
                'toolId' => 'AE-0001',
                'category' => 'Audio Equipment',
                'status' => 'Available',
                'condition' => 'Excellent',
                'lastMaintenance' => 'N/A',
                'totalBorrowings' => 12,
            ],
            [
                'id' => 8,
                'name' => 'ThinkPad X1 Carbon',
                'toolId' => 'LP-0003',
                'category' => 'Laptops',
                'status' => 'Available',
                'condition' => 'Good',
                'lastMaintenance' => 'Jan 18, 2026',
                'totalBorrowings' => 29,
            ],
        ];

        return Inertia::render('Admin/Tools/IndexPage', [
            'tools' => $tools,
        ]);
    }

    public function users(): Response
    {
        $users = User::query()
            ->with('department:id,name')
            ->withCount('toolAllocations')
            ->withCount([
                'toolAllocations as active_borrowings_count' => function ($q) {
                    $q->where('status', 'BORROWED');
                },
            ])
            ->orderBy('name')
            ->get()
            ->map(function (User $user): array {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'department' => $user->department?->name ?? 'Unassigned',
                    'departmentId' => $user->department_id,
                    'role' => $user->role === 'ADMIN' ? 'Admin' : 'User',
                    'status' => $user->status === 'ACTIVE' ? 'Active' : 'Inactive',
                    'activeBorrowings' => (int) ($user->active_borrowings_count ?? 0),
                    'totalBorrowings' => (int) ($user->tool_allocations_count ?? 0),
                    'joinedAt' => $user->created_at?->toDateString(),
                ];
            })
            ->values();

        return Inertia::render('Admin/Users/IndexPage', [
            'users' => $users,
        ]);
    }

    public function analytics(): Response
    {
        return Inertia::render('Admin/Analytics/IndexPage');
    }

    public function settings(): Response
    {
        return Inertia::render('Admin/Settings/IndexPage');
    }

    public function maintenance(): Response
    {
        return Inertia::render('Admin/Maintenance/IndexPage');
    }

    public function reports(): Response
    {
        return Inertia::render('Admin/Reports/IndexPage');
    }

    public function categories(): Response
    {
        return Inertia::render('Admin/Categories/IndexPage');
    }
}
