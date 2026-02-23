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
            'reported_condition' => ['sometimes', 'nullable', 'string', 'in:Excellent,Good,Fair,Poor,Damaged,Functional'],
            'admin_condition' => ['sometimes', 'nullable', 'string', 'in:Excellent,Good,Fair,Poor,Damaged,Functional'],
            'admin_review_note' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'return_proof_image' => ['sometimes', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'return_proof_images' => ['sometimes', 'array', 'max:5'],
            'return_proof_images.*' => ['file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'admin_proof_images' => ['sometimes', 'array', 'max:5'],
            'admin_proof_images.*' => ['file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'status' => ['sometimes', 'string', 'in:SCHEDULED,BORROWED,PENDING_RETURN,RETURNED'],
        ];
    }
}
