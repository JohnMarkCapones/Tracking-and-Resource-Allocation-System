<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReportTemplateRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'report_type' => ['required', 'string', 'in:borrowing_summary,tool_utilization,user_activity,overdue_report,maintenance_log,custom'],
            'columns' => ['required', 'array', 'min:1'],
            'columns.*' => ['string'],
            'schedule' => ['nullable', 'string', 'max:50'],
        ];
    }
}
