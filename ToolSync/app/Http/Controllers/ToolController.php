<?php

namespace App\Http\Controllers;

use App\Models\Tool;
use Inertia\Inertia;
use Inertia\Response;

class ToolController extends Controller
{
    public function catalog(): Response
    {
        // Static mock data for tool catalog.
        $tools = [
            [
                'id' => 1,
                'name' => 'MacBook Pro 14"',
                'toolId' => 'LP-0001',
                'category' => 'Laptops',
                'status' => 'Available',
                'condition' => 'Excellent',
            ],
            [
                'id' => 2,
                'name' => 'Dell XPS 15',
                'toolId' => 'LP-0002',
                'category' => 'Laptops',
                'status' => 'Borrowed',
                'condition' => 'Good',
            ],
            [
                'id' => 3,
                'name' => 'Epson EB-X51',
                'toolId' => 'PR-0001',
                'category' => 'Projectors',
                'status' => 'Available',
                'condition' => 'Good',
            ],
            [
                'id' => 4,
                'name' => 'Canon EOS R6',
                'toolId' => 'CM-0001',
                'category' => 'Cameras',
                'status' => 'Maintenance',
                'condition' => 'Fair',
            ],
            [
                'id' => 5,
                'name' => 'HP LaserJet Pro M404dn',
                'toolId' => 'PT-0001',
                'category' => 'Printers',
                'status' => 'Available',
                'condition' => 'Good',
            ],
            [
                'id' => 6,
                'name' => 'iPad Pro 12.9"',
                'toolId' => 'TB-0001',
                'category' => 'Tablets',
                'status' => 'Borrowed',
                'condition' => 'Excellent',
            ],
            [
                'id' => 7,
                'name' => 'Sony WH-1000XM5',
                'toolId' => 'AE-0001',
                'category' => 'Audio Equipment',
                'status' => 'Available',
                'condition' => 'Excellent',
            ],
            [
                'id' => 8,
                'name' => 'ThinkPad X1 Carbon',
                'toolId' => 'LP-0003',
                'category' => 'Laptops',
                'status' => 'Available',
                'condition' => 'Good',
            ],
            [
                'id' => 9,
                'name' => 'BenQ TK700STi',
                'toolId' => 'PR-0002',
                'category' => 'Projectors',
                'status' => 'Available',
                'condition' => 'Excellent',
            ],
            [
                'id' => 10,
                'name' => 'Sony Alpha A7 III',
                'toolId' => 'CM-0002',
                'category' => 'Cameras',
                'status' => 'Available',
                'condition' => 'Good',
            ],
        ];

        $categories = [
            'Laptops',
            'Projectors',
            'Cameras',
            'Printers',
            'Tablets',
            'Audio Equipment',
        ];

        return Inertia::render('Tools/CatalogPage', [
            'tools' => $tools,
            'categories' => $categories,
        ]);
    }

    public function show(int $id): Response
    {
        /** @var Tool $dbTool */
        $dbTool = Tool::query()
            ->with('category')
            ->withCount('allocations')
            ->findOrFail($id);

        $status = match ($dbTool->status) {
            'BORROWED' => 'Borrowed',
            'MAINTENANCE' => 'Maintenance',
            default => 'Available',
        };

        $toolIdDisplay = $dbTool->code && trim((string) $dbTool->code) !== ''
            ? trim((string) $dbTool->code)
            : 'TL-'.$dbTool->id;

        $tool = [
            'id' => $dbTool->id,
            'name' => $dbTool->name,
            'toolId' => $toolIdDisplay,
            'category' => $dbTool->category?->name ?? 'Other',
            'status' => $status,
            'condition' => $dbTool->condition ?? 'Good',
            'description' => $dbTool->description ?: 'No description available.',
            'specifications' => $dbTool->specifications ?? [],
            'lastMaintenance' => $dbTool->updated_at?->format('M d, Y') ?? 'N/A',
            'totalBorrowings' => (int) ($dbTool->allocations_count ?? 0),
            'imageUrl' => $dbTool->image_path ? asset('storage/'.$dbTool->image_path) : null,
        ];

        return Inertia::render('Tools/DetailPage', [
            'tool' => $tool,
        ]);
    }
}
