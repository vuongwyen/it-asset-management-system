<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Asset;

class CheckinAssetRequest extends FormRequest
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
            'asset_id' => [
                'required',
                'exists:assets,id',
                function ($attribute, $value, $fail) {
                    $asset = Asset::find($value);
                    if (!$asset) return;

                    // Check if asset is currently assigned (Deployed)
                    if (!$asset->assigned_to) {
                        $fail('Tài sản này chưa được cấp phát cho ai, không thể thu hồi.');
                    }
                },
            ],
            'status_id' => 'required|exists:status_labels,id', // Trạng thái sau khi trả (Ready, Broken, etc.)
            'note' => 'nullable|string|max:500',
        ];
    }
}
