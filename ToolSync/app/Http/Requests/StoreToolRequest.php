<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreToolRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'image_path' => ['nullable', 'string', 'max:255'],
            'category_id' => ['required', 'integer', 'exists:tool_categories,id'],
            'status' => ['sometimes', 'string', 'in:AVAILABLE,BORROWED,MAINTENANCE'],
            'quantity' => ['sometimes', 'integer', 'min:1'],
        ];
    }
}
