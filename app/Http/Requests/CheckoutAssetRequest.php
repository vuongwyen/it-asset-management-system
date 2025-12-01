<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Asset;
use App\Models\StatusLabel;

class CheckoutAssetRequest extends FormRequest
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

                    // Check if asset is 'Ready to Deploy'
                    // Assuming 'deployable' type in StatusLabel is what we want, 
                    // or specifically a status named 'Ready to Deploy'.
                    // The requirement says: Asset phải có status là 'Ready to Deploy' (hoặc status_id tương ứng).
                    // We should check the status label type or name.
                    // Let's check if the status label type is 'deployable'.

                    if ($asset->statusLabel->type !== 'deployable') {
                        $fail('Tài sản này không ở trạng thái sẵn sàng cấp phát (Ready to Deploy).');
                    }

                    // Also check if it's already assigned
                    if ($asset->assigned_to) {
                        $fail('Tài sản này đã được cấp phát cho người khác.');
                    }
                },
            ],
            'user_id' => 'required|exists:users,id',
            'note' => 'nullable|string|max:500',
        ];
    }
}
