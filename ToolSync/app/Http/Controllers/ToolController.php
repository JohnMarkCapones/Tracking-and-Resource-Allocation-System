<?php

namespace App\Http\Controllers;

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
        // Static mock data for tool detail.
        $tools = [
            1 => [
                'id' => 1,
                'name' => 'MacBook Pro 14"',
                'toolId' => 'LP-0001',
                'category' => 'Laptops',
                'status' => 'Available',
                'condition' => 'Excellent',
                'description' => 'A powerful laptop for professionals. Features the M2 Pro chip with 16GB unified memory and 512GB SSD storage. Perfect for design work, development, and content creation.',
                'specifications' => [
                    'Processor' => 'Apple M2 Pro',
                    'Memory' => '16GB Unified',
                    'Storage' => '512GB SSD',
                    'Display' => '14.2" Liquid Retina XDR',
                    'Battery' => 'Up to 17 hours',
                    'Weight' => '1.6 kg',
                ],
                'lastMaintenance' => 'Jan 15, 2026',
                'totalBorrowings' => 24,
            ],
            2 => [
                'id' => 2,
                'name' => 'Dell XPS 15',
                'toolId' => 'LP-0002',
                'category' => 'Laptops',
                'status' => 'Borrowed',
                'condition' => 'Good',
                'description' => 'Premium Windows laptop with a stunning 4K OLED display. Ideal for both work and entertainment with its powerful Intel Core i7 processor.',
                'specifications' => [
                    'Processor' => 'Intel Core i7-12700H',
                    'Memory' => '32GB DDR5',
                    'Storage' => '1TB NVMe SSD',
                    'Display' => '15.6" 4K OLED',
                    'Graphics' => 'NVIDIA RTX 3050 Ti',
                    'Weight' => '1.86 kg',
                ],
                'lastMaintenance' => 'Dec 20, 2025',
                'totalBorrowings' => 18,
            ],
            3 => [
                'id' => 3,
                'name' => 'Epson EB-X51',
                'toolId' => 'PR-0001',
                'category' => 'Projectors',
                'status' => 'Available',
                'condition' => 'Good',
                'description' => 'Versatile business projector with bright 3800 lumens output. Features easy connectivity options and reliable performance for presentations.',
                'specifications' => [
                    'Brightness' => '3800 lumens',
                    'Resolution' => 'XGA (1024x768)',
                    'Contrast' => '16000:1',
                    'Lamp Life' => '12000 hours',
                    'Connectivity' => 'HDMI, VGA, USB',
                    'Weight' => '2.5 kg',
                ],
                'lastMaintenance' => 'Jan 10, 2026',
                'totalBorrowings' => 32,
            ],
        ];

        $tool = $tools[$id] ?? [
            'id' => $id,
            'name' => 'Unknown Tool',
            'toolId' => 'XX-0000',
            'category' => 'Other',
            'status' => 'Available',
            'condition' => 'Good',
            'description' => 'Tool details not available.',
            'specifications' => [],
            'lastMaintenance' => 'N/A',
            'totalBorrowings' => 0,
        ];

        return Inertia::render('Tools/DetailPage', [
            'tool' => $tool,
        ]);
    }
}
