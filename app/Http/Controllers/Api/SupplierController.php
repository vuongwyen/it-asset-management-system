<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Http\Resources\SupplierResource;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    /**
     * Lấy danh sách Supplier (có phân trang)
     */
    public function index()
    {
        // withCount('assets') giúp đếm số lượng tài sản mà Supplier này cung cấp
        $suppliers = Supplier::withCount('assets')
            ->orderBy('id', 'desc')
            ->paginate(10);

        return SupplierResource::collection($suppliers);
    }

    /**
     * Tạo mới Supplier
     */
    public function store(StoreSupplierRequest $request)
    {
        // Dữ liệu đã được validate ở Request, an tâm dùng
        $supplier = Supplier::create($request->validated());

        return response()->json([
            'message' => 'Thêm nhà cung cấp thành công!',
            'data'    => new SupplierResource($supplier)
        ], 201);
    }

    /**
     * Xem chi tiết 1 Supplier
     */
    public function show($id)
    {
        $supplier = Supplier::withCount('assets')->findOrFail($id);
        return new SupplierResource($supplier);
    }

    /**
     * Cập nhật (Update)
     * Lưu ý: Em cần tạo file UpdateSupplierRequest tương tự StoreSupplierRequest
     * Nếu chưa tạo thì tạm thời dùng Request thường (không khuyến khích)
     */
    public function update(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);

        // Demo validate nhanh trong controller (nhưng đúng ra phải dùng Request riêng nhé)
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:suppliers,name,' . $id,
            'phone' => 'nullable|string|max:20',
        ]);

        $supplier->update($validated);

        return response()->json([
            'message' => 'Cập nhật thành công!',
            'data'    => new SupplierResource($supplier)
        ]);
    }

    /**
     * Xóa Supplier
     */
    public function destroy($id)
    {
        $supplier = Supplier::findOrFail($id);

        // CHECK LOGIC: Nếu Supplier này đã cung cấp tài sản thì KHÔNG ĐƯỢC XÓA
        if ($supplier->assets()->exists()) {
            return response()->json([
                'message' => 'Không thể xóa! Nhà cung cấp này đang liên kết với tài sản trong kho.'
            ], 422);
        }

        $supplier->delete();

        return response()->json(['message' => 'Xóa thành công']);
    }
}
