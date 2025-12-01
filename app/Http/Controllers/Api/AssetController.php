<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Http\Requests\StoreAssetRequest;
use App\Http\Requests\UpdateAssetRequest;
use App\Http\Resources\AssetResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AssetController extends Controller
{
    public function index()
    {
        $assets = Asset::with(['model', 'statusLabel', 'supplier', 'model.category', 'model.manufacturer'])
            ->latest()
            ->paginate(10);
        return AssetResource::collection($assets);
    }

    public function store(StoreAssetRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('assets', 'public');
        }

        $asset = Asset::create($data);

        return response()->json([
            'message' => 'Nhập kho tài sản thành công!',
            'data'    => new AssetResource($asset)
        ], 201);
    }

    public function show($id)
    {
        $asset = Asset::with(['model', 'statusLabel', 'supplier', 'model.category', 'model.manufacturer'])->findOrFail($id);
        return new AssetResource($asset);
    }

    public function update(UpdateAssetRequest $request, $id)
    {
        $asset = Asset::findOrFail($id);
        $data = $request->validated();

        if ($request->hasFile('image')) {
            // Delete old image
            if ($asset->image) {
                Storage::disk('public')->delete($asset->image);
            }
            $data['image'] = $request->file('image')->store('assets', 'public');
        }

        $asset->update($data);

        return response()->json([
            'message' => 'Cập nhật thành công!',
            'data'    => new AssetResource($asset)
        ]);
    }

    public function destroy($id)
    {
        $asset = Asset::findOrFail($id);

        // Asset uses SoftDeletes, so we just delete it.
        // If we wanted to prevent deletion if it has history, we could check that here.
        // For now, standard soft delete is fine.

        $asset->delete();

        return response()->json(['message' => 'Xóa tài sản thành công']);
    }
}
