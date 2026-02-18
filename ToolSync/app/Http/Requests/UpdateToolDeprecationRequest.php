<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateToolDeprecationRequest extends FormRequest
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
            'reason' => ['sometimes', 'string', 'max:255'],
            'retire_date' => ['sometimes', 'date'],
            'replacement_tool_id' => ['sometimes', 'nullable', 'integer', 'exists:tools,id'],
            'status' => ['sometimes', 'string', 'in:pending,approved,retired'],
        ];
    }
}
