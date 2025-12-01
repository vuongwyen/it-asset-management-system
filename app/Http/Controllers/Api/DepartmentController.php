<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Http\Requests\StoreDepartmentRequest;
use App\Http\Requests\UpdateDepartmentRequest;
use App\Http\Resources\DepartmentResource;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function index()
    {
        // Eager load manager
        $departments = Department::with('manager')->latest()->paginate(10);
        return DepartmentResource::collection($departments);
    }

    public function store(StoreDepartmentRequest $request)
    {
        $department = Department::create($request->validated());

        return response()->json([
            'message' => 'Tạo phòng ban thành công!',
            'data'    => new DepartmentResource($department)
        ], 201);
    }

    public function show($id)
    {
        $department = Department::with('manager')->findOrFail($id);
        return new DepartmentResource($department);
    }

    public function update(UpdateDepartmentRequest $request, $id)
    {
        $department = Department::findOrFail($id);
        $department->update($request->validated());

        return response()->json([
            'message' => 'Cập nhật thành công!',
            'data'    => new DepartmentResource($department)
        ]);
    }

    public function destroy($id)
    {
        $department = Department::findOrFail($id);

        // Check foreign key constraint
        if ($department->employees()->exists()) {
            return response()->json([
                'message' => 'Không thể xóa! Phòng ban này đang có nhân viên.'
            ], 422);
        }

        $department->delete();

        return response()->json(['message' => 'Xóa phòng ban thành công']);
    }
}
