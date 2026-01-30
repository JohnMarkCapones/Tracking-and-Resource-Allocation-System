<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateToolStatusLogRequest extends FormRequest
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
            'old_status' => ['sometimes', 'nullable', 'string', 'in:AVAILABLE,BORROWED,MAINTENANCE'],
            'new_status' => ['sometimes', 'nullable', 'string', 'in:AVAILABLE,BORROWED,MAINTENANCE'],
            'changed_by' => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
            'changed_at' => ['sometimes', 'date'],
        ];
    }
}
