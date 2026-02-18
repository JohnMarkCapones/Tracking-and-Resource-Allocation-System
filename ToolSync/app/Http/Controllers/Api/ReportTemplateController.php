<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReportTemplateRequest;
use App\Http\Requests\UpdateReportTemplateRequest;
use App\Models\ReportTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportTemplateController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $templates = ReportTemplate::query()
            ->where('user_id', $user?->id ?? 0)
            ->orderByDesc('created_at')
            ->get()
            ->map(function (ReportTemplate $template): array {
                return [
                    'id' => $template->id,
                    'name' => $template->name,
                    'report_type' => $template->report_type,
                    'schedule' => $template->schedule,
                    'last_generated_at' => $template->last_generated_at?->toIso8601String(),
                    'columns' => $template->columns ?? [],
                ];
            })
            ->values()
            ->all();

        return response()->json([
            'data' => $templates,
        ]);
    }

    public function store(StoreReportTemplateRequest $request): JsonResponse
    {
        $user = $request->user();

        $template = ReportTemplate::query()->create([
            'user_id' => $user?->id,
            'name' => (string) $request->input('name'),
            'report_type' => (string) $request->input('report_type'),
            'schedule' => $request->input('schedule'),
            'columns' => (array) $request->input('columns', []),
        ]);

        return response()->json([
            'data' => [
                'id' => $template->id,
                'name' => $template->name,
                'report_type' => $template->report_type,
                'schedule' => $template->schedule,
                'last_generated_at' => $template->last_generated_at?->toIso8601String(),
                'columns' => $template->columns ?? [],
            ],
        ], 201);
    }

    public function update(UpdateReportTemplateRequest $request, ReportTemplate $reportTemplate): JsonResponse
    {
        $user = $request->user();

        if ($reportTemplate->user_id !== ($user?->id ?? null)) {
            abort(403);
        }

        $reportTemplate->fill($request->only([
            'name',
            'report_type',
            'schedule',
            'columns',
            'last_generated_at',
        ]));
        $reportTemplate->save();

        return response()->json([
            'data' => [
                'id' => $reportTemplate->id,
                'name' => $reportTemplate->name,
                'report_type' => $reportTemplate->report_type,
                'schedule' => $reportTemplate->schedule,
                'last_generated_at' => $reportTemplate->last_generated_at?->toIso8601String(),
                'columns' => $reportTemplate->columns ?? [],
            ],
        ]);
    }
}
