<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateToolAllocationRequest extends FormRequest
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
            'user_id' => ['sometimes', 'integer', 'exists:users,id'],
            'borrow_date' => ['sometimes', 'date'],
            'expected_return_date' => ['sometimes', 'date'],
            'actual_return_date' => ['nullable', 'date'],
            'note' => ['nullable', 'string', 'max:1000'],
            'status' => ['sometimes', 'string', 'in:BORROWED,PENDING_RETURN,RETURNED'],
        ];
    }
}
