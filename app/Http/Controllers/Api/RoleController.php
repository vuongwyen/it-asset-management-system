<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Spatie\Permission\Models\Role;
use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::latest()->paginate(10);
        return response()->json($roles);
    }

    public function store(StoreRoleRequest $request)
    {
        $role = Role::create(['name' => $request->name, 'guard_name' => 'web']);

        return response()->json([
            'message' => 'Tạo vai trò thành công!',
            'data'    => $role
        ], 201);
    }

    public function show($id)
    {
        $role = Role::findOrFail($id);
        return response()->json($role);
    }

    public function update(UpdateRoleRequest $request, $id)
    {
        $role = Role::findOrFail($id);
        $role->update(['name' => $request->name]);

        return response()->json([
            'message' => 'Cập nhật thành công!',
            'data'    => $role
        ]);
    }

    public function destroy($id)
    {
        $role = Role::findOrFail($id);

        // Prevent deleting critical roles if needed
        if ($role->name === 'Super Admin') {
            return response()->json(['message' => 'Không thể xóa vai trò Super Admin'], 403);
        }

        $role->delete();

        return response()->json(['message' => 'Xóa vai trò thành công']);
    }
}
