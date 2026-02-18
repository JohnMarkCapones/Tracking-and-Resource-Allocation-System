<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreToolDeprecationRequest extends FormRequest
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
            'reason' => ['required', 'string', 'max:255'],
            'retire_date' => ['required', 'date'],
            'replacement_tool_id' => ['nullable', 'integer', 'exists:tools,id'],
        ];
    }
}
