<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Manufacturer;
use App\Http\Requests\StoreManufacturerRequest;
use App\Http\Requests\UpdateManufacturerRequest;
use App\Http\Resources\ManufacturerResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ManufacturerController extends Controller
{
    public function index()
    {
        $manufacturers = Manufacturer::latest()->paginate(10);
        return ManufacturerResource::collection($manufacturers);
    }

    public function store(StoreManufacturerRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('manufacturers', 'public');
        }

        $manufacturer = Manufacturer::create($data);

        return response()->json([
            'message' => 'Tạo hãng sản xuất thành công!',
            'data'    => new ManufacturerResource($manufacturer)
        ], 201);
    }

    public function show($id)
    {
        $manufacturer = Manufacturer::findOrFail($id);
        return new ManufacturerResource($manufacturer);
    }

    public function update(UpdateManufacturerRequest $request, $id)
    {
        $manufacturer = Manufacturer::findOrFail($id);
        $data = $request->validated();

        if ($request->hasFile('image')) {
            // Delete old image
            if ($manufacturer->image) {
                Storage::disk('public')->delete($manufacturer->image);
            }
            $data['image'] = $request->file('image')->store('manufacturers', 'public');
        }

        $manufacturer->update($data);

        return response()->json([
            'message' => 'Cập nhật thành công!',
            'data'    => new ManufacturerResource($manufacturer)
        ]);
    }

    public function destroy($id)
    {
        $manufacturer = Manufacturer::findOrFail($id);

        // Check foreign key constraint
        if ($manufacturer->deviceModels()->exists()) {
            return response()->json([
                'message' => 'Không thể xóa! Hãng này đang được liên kết với các mẫu thiết bị.'
            ], 422);
        }

        if ($manufacturer->image) {
            Storage::disk('public')->delete($manufacturer->image);
        }

        $manufacturer->delete();

        return response()->json(['message' => 'Xóa hãng sản xuất thành công']);
    }
}
