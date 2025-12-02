<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMaintenanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'asset_id' => 'sometimes|exists:assets,id',
            'supplier_id' => 'sometimes|exists:suppliers,id',
            'start_date' => 'sometimes|date',
            'completion_date' => 'nullable|date|after_or_equal:start_date',
            'cost' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ];
    }
}
