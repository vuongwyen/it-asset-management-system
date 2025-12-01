<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeviceModel;
use App\Http\Requests\StoreDeviceModelRequest;
use App\Http\Requests\UpdateDeviceModelRequest;
use App\Http\Resources\DeviceModelResource; // Em nhớ tạo Resource này nhé
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DeviceModelController extends Controller
{
    public function index()
    {
        // Eager load Hãng và Loại để hiển thị cho đầy đủ
        $models = DeviceModel::with(['manufacturer', 'category'])
            ->latest()
            ->paginate(10);

        return DeviceModelResource::collection($models);
    }

    public function store(StoreDeviceModelRequest $request)
    {
        $data = $request->validated();

        // 📸 Xử lý ảnh Model (Ví dụ ảnh minh họa của dòng máy XPS 13)
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('models', 'public');
        }

        $deviceModel = DeviceModel::create($data);

        return response()->json([
            'message' => 'Tạo mẫu thiết bị thành công!',
            'data'    => new DeviceModelResource($deviceModel)
        ], 201);
    }

    public function show($id)
    {
        $deviceModel = DeviceModel::with(['manufacturer', 'category'])->findOrFail($id);
        return new DeviceModelResource($deviceModel);
    }

    public function update(UpdateDeviceModelRequest $request, $id)
    {
        $deviceModel = DeviceModel::findOrFail($id);
        $data = $request->validated();

        if ($request->hasFile('image')) {
            // Xóa ảnh cũ
            if ($deviceModel->image) {
                Storage::disk('public')->delete($deviceModel->image);
            }
            $data['image'] = $request->file('image')->store('models', 'public');
        }

        $deviceModel->update($data);

        return response()->json([
            'message' => 'Cập nhật thành công!',
            'data'    => new DeviceModelResource($deviceModel)
        ]);
    }

    public function destroy($id)
    {
        $deviceModel = DeviceModel::findOrFail($id);

        // 🛡️ Logic bảo vệ: Không cho xóa Model nếu đã có tài sản thuộc model này
        // (Dù DB đã có khóa ngoại restrict, nhưng check ở đây để báo lỗi thân thiện hơn)
        if ($deviceModel->assets()->exists()) {
            return response()->json([
                'message' => 'Không thể xóa! Đang có tài sản thuộc mẫu thiết bị này trong kho.'
            ], 422);
        }

        if ($deviceModel->image) {
            Storage::disk('public')->delete($deviceModel->image);
        }

        $deviceModel->delete();

        return response()->json(['message' => 'Xóa mẫu thiết bị thành công']);
    }
}
