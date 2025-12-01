<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAssetRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'asset_tag' => 'required|string|max:255|unique:assets,asset_tag,' . $this->route('asset'),
            'serial' => 'required|string|max:255|unique:assets,serial,' . $this->route('asset'),
            'model_id' => 'required|exists:models,id',
            'status_id' => 'required|exists:status_labels,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'purchase_cost' => 'nullable|numeric|min:0',
            'purchase_date' => 'nullable|date',
            'warranty_months' => 'nullable|integer|min:0',
            'image' => 'nullable|image|max:2048',
        ];
    }
}
