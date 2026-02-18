<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateReportTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'report_type' => ['sometimes', 'string', 'in:borrowing_summary,tool_utilization,user_activity,overdue_report,maintenance_log,custom'],
            'columns' => ['sometimes', 'array', 'min:1'],
            'columns.*' => ['string'],
            'schedule' => ['sometimes', 'nullable', 'string', 'max:50'],
            'last_generated_at' => ['sometimes', 'nullable', 'date'],
        ];
    }
}
