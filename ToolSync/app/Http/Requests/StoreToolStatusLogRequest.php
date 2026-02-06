<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreToolStatusLogRequest extends FormRequest
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
            'old_status' => ['nullable', 'string', 'in:AVAILABLE,BORROWED,MAINTENANCE'],
            'new_status' => ['nullable', 'string', 'in:AVAILABLE,BORROWED,MAINTENANCE'],
            'changed_by' => ['nullable', 'integer', 'exists:users,id'],
            'changed_at' => ['sometimes', 'date'],
        ];
    }
}
