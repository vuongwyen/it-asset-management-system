<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule; // Import cái này nếu muốn dùng Rule nâng cao

class StoreCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * QUAN TRỌNG: Mặc định Laravel để là false.
     * Em PHẢI đổi thành true. Nếu không, ai gọi API này cũng bị chặn cửa (403).
     */
    public function authorize(): bool
    {
        // Sau này làm phân quyền chặt chẽ thì check: return $this->user()->can('create_category');
        // Còn giờ cứ mở cửa cho qua đã.
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            // 1. Tên danh mục:
            // - required: Không được để trống.
            // - string: Phải là chuỗi ký tự.
            // - max:255: Không dài quá 255 ký tự (chuẩn độ rộng cột VARCHAR trong DB).
            // - unique:categories,name: Kiểm tra trong bảng 'categories', cột 'name' xem có trùng không.
            'name' => 'required|string|max:255|unique:categories,name',

            // 2. Loại danh mục:
            // - required: Bắt buộc chọn.
            // - in: Chỉ chấp nhận các giá trị cụ thể này. Tránh user hack gửi lên type="tào lao".
            'type' => 'required|in:hardware,software,consumable,component',

            // 3. Các trường phụ (Optional):
            // - nullable: Được phép để trống.
            'description' => 'nullable|string|max:500',
        ];
    }

    /**
     * (Optional) Tùy chỉnh thông báo lỗi cho thân thiện với người Việt.
     * Nếu không có hàm này, nó sẽ báo tiếng Anh: "The name has already been taken."
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Tên danh mục không được để trống.',
            'name.unique'   => 'Tên danh mục này đã tồn tại trong hệ thống.',
            'name.max'      => 'Tên danh mục không được vượt quá 255 ký tự.',
            'type.required' => 'Vui lòng chọn loại danh mục.',
            'type.in'       => 'Loại danh mục không hợp lệ (chỉ chấp nhận: hardware, software, consumable, component).',
        ];
    }
}
