<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreManufacturerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Đã mở cửa
    }

    public function rules(): array
    {
        return [
            // 1. Tên hãng: Check trùng trong bảng 'manufacturers'
            'name' => 'required|string|max:255|unique:manufacturers,name',

            // 2. Các thông tin liên hệ (Optional - có thể để trống)
            'support_url'   => 'nullable|url|max:255',      // Phải là link web
            'support_phone' => 'nullable|string|max:20',    // Số điện thoại hỗ trợ
            'support_email' => 'nullable|email|max:255',    // Email hỗ trợ

            // 3. Logo hãng (Optional)
            'image' => 'nullable|image|mimes:jpeg,png,jpg,svg|max:2048',
        ];
    }

    // Thêm cái này để báo lỗi tiếng Việt cho sướng
    public function messages(): array
    {
        return [
            'name.required' => 'Tên hãng sản xuất là bắt buộc.',
            'name.unique'   => 'Hãng này đã tồn tại trong hệ thống.',
            'support_url.url' => 'Đường dẫn website không hợp lệ.',
        ];
    }
}
