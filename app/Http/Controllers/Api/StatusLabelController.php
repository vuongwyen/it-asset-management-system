<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StatusLabel;
use App\Http\Requests\StoreStatusLabelRequest;
use App\Http\Requests\UpdateStatusLabelRequest;
use App\Http\Resources\StatusLabelResource;
use Illuminate\Http\Request;

class StatusLabelController extends Controller
{
    public function index()
    {
        $statusLabels = StatusLabel::latest()->paginate(10);
        return StatusLabelResource::collection($statusLabels);
    }

    public function store(StoreStatusLabelRequest $request)
    {
        $statusLabel = StatusLabel::create($request->validated());

        return response()->json([
            'message' => 'Tạo nhãn tình trạng thành công!',
            'data'    => new StatusLabelResource($statusLabel)
        ], 201);
    }

    public function show($id)
    {
        $statusLabel = StatusLabel::findOrFail($id);
        return new StatusLabelResource($statusLabel);
    }

    public function update(UpdateStatusLabelRequest $request, $id)
    {
        $statusLabel = StatusLabel::findOrFail($id);
        $statusLabel->update($request->validated());

        return response()->json([
            'message' => 'Cập nhật thành công!',
            'data'    => new StatusLabelResource($statusLabel)
        ]);
    }

    public function destroy($id)
    {
        $statusLabel = StatusLabel::findOrFail($id);

        // Check foreign key constraint
        if ($statusLabel->assets()->exists()) {
            return response()->json([
                'message' => 'Không thể xóa! Nhãn tình trạng này đang được gán cho tài sản.'
            ], 422);
        }

        $statusLabel->delete();

        return response()->json(['message' => 'Xóa nhãn tình trạng thành công']);
    }
}
