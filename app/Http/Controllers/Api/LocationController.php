<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Http\Requests\StoreLocationRequest;
use App\Http\Requests\UpdateLocationRequest;
use App\Http\Resources\LocationResource;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    public function index()
    {
        // Eager load parent for better performance
        $locations = Location::with('parent')->latest()->paginate(10);
        return LocationResource::collection($locations);
    }

    public function store(StoreLocationRequest $request)
    {
        $location = Location::create($request->validated());

        return response()->json([
            'message' => 'Tạo địa điểm thành công!',
            'data'    => new LocationResource($location)
        ], 201);
    }

    public function show($id)
    {
        // Eager load parent and children
        $location = Location::with(['parent', 'children'])->findOrFail($id);
        return new LocationResource($location);
    }

    public function update(UpdateLocationRequest $request, $id)
    {
        $location = Location::findOrFail($id);
        $location->update($request->validated());

        return response()->json([
            'message' => 'Cập nhật thành công!',
            'data'    => new LocationResource($location)
        ]);
    }

    public function destroy($id)
    {
        $location = Location::findOrFail($id);

        // Check foreign key constraints
        if ($location->users()->exists()) {
            return response()->json([
                'message' => 'Không thể xóa! Địa điểm này đang có nhân viên làm việc.'
            ], 422);
        }

        if ($location->children()->exists()) {
            return response()->json([
                'message' => 'Không thể xóa! Địa điểm này đang chứa các địa điểm con.'
            ], 422);
        }

        $location->delete();

        return response()->json(['message' => 'Xóa địa điểm thành công']);
    }
}
