<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMaintenanceScheduleRequest extends FormRequest
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
            'tool_id' => ['required', 'integer', 'exists:tools,id'],
            'type' => ['required', 'string', 'in:routine,repair,inspection,calibration'],
            'scheduled_date' => ['required', 'date'],
            'assignee' => ['required', 'string', 'max:150'],
            'notes' => ['nullable', 'string'],
            'usage_count' => ['sometimes', 'integer', 'min:0'],
            'trigger_threshold' => ['sometimes', 'integer', 'min:1'],
        ];
    }
}
