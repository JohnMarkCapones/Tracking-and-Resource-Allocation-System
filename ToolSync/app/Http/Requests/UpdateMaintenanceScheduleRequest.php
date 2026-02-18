<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMaintenanceScheduleRequest extends FormRequest
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
            'tool_id' => ['sometimes', 'integer', 'exists:tools,id'],
            'type' => ['sometimes', 'string', 'in:routine,repair,inspection,calibration'],
            'scheduled_date' => ['sometimes', 'date'],
            'completed_date' => ['sometimes', 'nullable', 'date'],
            'assignee' => ['sometimes', 'string', 'max:150'],
            'status' => ['sometimes', 'string', 'in:scheduled,in_progress,completed,overdue'],
            'notes' => ['sometimes', 'nullable', 'string'],
            'usage_count' => ['sometimes', 'integer', 'min:0'],
            'trigger_threshold' => ['sometimes', 'integer', 'min:1'],
        ];
    }
}
