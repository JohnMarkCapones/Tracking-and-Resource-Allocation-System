<?php

namespace App\Http\Controllers;

use App\Models\Tool;
use App\Models\ToolConditionHistory;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

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

    public function show(string $slug): Response
    {
        /** @var Tool $dbTool */
        $dbTool = Tool::query()
            ->with('category')
            ->withCount('allocations')
            ->where('slug', $slug)
            ->firstOrFail();

        $conditionHistory = [];
        $latestAdminCondition = null;
        if (Schema::hasTable('tool_condition_histories')) {
            $conditionHistory = ToolConditionHistory::query()
                ->with([
                    'borrower:id,name,email',
                    'admin:id,name,email',
                    'allocation:id,borrow_date,expected_return_date,actual_return_date,status',
                ])
                ->where('tool_id', $dbTool->id)
                ->orderByDesc('created_at')
                ->get()
                ->map(function (ToolConditionHistory $history): array {
                    $borrowerImages = collect($history->borrower_images ?? [])
                        ->filter(fn ($path) => is_string($path) && trim($path) !== '')
                        ->map(fn (string $path) => Storage::disk('public')->url($path))
                        ->values()
                        ->all();

                    $adminImages = collect($history->admin_images ?? [])
                        ->filter(fn ($path) => is_string($path) && trim($path) !== '')
                        ->map(fn (string $path) => Storage::disk('public')->url($path))
                        ->values()
                        ->all();

                    return [
                        'id' => $history->id,
                        'allocation_id' => $history->allocation_id,
                        'created_at' => $history->created_at?->toIso8601String(),
                        'updated_at' => $history->updated_at?->toIso8601String(),
                        'borrower' => [
                            'id' => $history->borrower?->id,
                            'name' => $history->borrower?->name ?? 'Unknown user',
                            'email' => $history->borrower?->email,
                        ],
                        'admin' => [
                            'id' => $history->admin?->id,
                            'name' => $history->admin?->name,
                            'email' => $history->admin?->email,
                        ],
                        'allocation' => [
                            'borrow_date' => substr((string) $history->allocation?->getRawOriginal('borrow_date'), 0, 10),
                            'expected_return_date' => substr((string) $history->allocation?->getRawOriginal('expected_return_date'), 0, 10),
                            'actual_return_date' => $history->allocation?->actual_return_date?->toDateString(),
                            'status' => $history->allocation?->status,
                        ],
                        'borrower_condition' => $history->borrower_condition,
                        'borrower_notes' => $history->borrower_notes,
                        'borrower_images' => $borrowerImages,
                        'admin_condition' => $history->admin_condition,
                        'admin_notes' => $history->admin_notes,
                        'admin_images' => $adminImages,
                        'admin_reviewed_at' => $history->admin_reviewed_at?->toIso8601String(),
                    ];
                })
                ->values()
                ->all();

            $latestAdminCondition = ToolConditionHistory::query()
                ->where('tool_id', $dbTool->id)
                ->whereNotNull('admin_condition')
                ->orderByDesc('admin_reviewed_at')
                ->orderByDesc('updated_at')
                ->value('admin_condition');
        }

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
            'slug' => $dbTool->slug,
            'name' => $dbTool->name,
            'toolId' => $toolIdDisplay,
            'category' => $dbTool->category?->name ?? 'Other',
            'status' => $status,
            'condition' => $latestAdminCondition ?: ($dbTool->condition ?? 'Good'),
            'description' => $dbTool->description ?: 'No description available.',
            'specifications' => $dbTool->specifications ?? [],
            'lastMaintenance' => $dbTool->updated_at?->format('M d, Y') ?? 'N/A',
            'totalBorrowings' => (int) ($dbTool->allocations_count ?? 0),
            'imageUrl' => $dbTool->image_path ? asset('storage/'.$dbTool->image_path) : null,
        ];

        return Inertia::render('Tools/DetailPage', [
            'tool' => $tool,
            'conditionHistory' => $conditionHistory,
        ]);
    }
}
