<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateToolRequest extends FormRequest
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
            'code' => ['nullable', 'string', 'max:50'],
            'name' => ['sometimes', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'image_path' => ['nullable', 'string', 'max:255'],
            'image' => ['nullable', 'image', 'max:2048'],
            'category_id' => ['sometimes', 'integer', 'exists:tool_categories,id'],
            'status' => ['sometimes', 'string', 'in:AVAILABLE,BORROWED,MAINTENANCE'],
            'condition' => ['sometimes', 'string', 'in:Excellent,Good,Fair,Poor,Damaged,Functional'],
            'quantity' => ['sometimes', 'integer', 'min:1'],
            'condition' => ['nullable', 'string', 'max:50'],
            'specifications' => ['nullable', 'string'],
        ];
    }
}
