<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMaintenanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'asset_id' => 'required|exists:assets,id',
            'supplier_id' => 'required|exists:suppliers,id',
            'start_date' => 'required|date',
            'completion_date' => 'nullable|date|after_or_equal:start_date',
            'cost' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ];
    }
}
