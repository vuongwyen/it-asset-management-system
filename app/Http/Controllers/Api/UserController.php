<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with(['department', 'location'])->latest()->paginate(10);
        return UserResource::collection($users);
    }

    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();
        $data['password'] = bcrypt($data['password']); // Hash password

        $user = User::create($data);

        // Assign role
        if ($request->has('role')) {
            $user->assignRole($request->role);
        } else {
            $user->assignRole('End-user');
        }

        return response()->json([
            'message' => 'Tạo người dùng thành công!',
            'data'    => new UserResource($user)
        ], 201);
    }

    public function show($id)
    {
        $user = User::with(['department', 'location'])->findOrFail($id);
        return new UserResource($user);
    }

    public function update(UpdateUserRequest $request, $id)
    {
        $user = User::findOrFail($id);
        $data = $request->validated();

        if (isset($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        // Sync role
        if ($request->has('role')) {
            $user->syncRoles([$request->role]);
        }

        return response()->json([
            'message' => 'Cập nhật thành công!',
            'data'    => new UserResource($user)
        ]);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // Check foreign key constraints
        if ($user->assets()->exists()) {
            return response()->json([
                'message' => 'Không thể xóa! Người dùng này đang giữ tài sản.'
            ], 422);
        }

        // Check if user is a manager of any department
        // Assuming Department model has 'manager_id'
        // We can check this via the user's relationship if defined, or query Department directly
        if (\App\Models\Department::where('manager_id', $id)->exists()) {
            return response()->json([
                'message' => 'Không thể xóa! Người dùng này đang là quản lý của một phòng ban.'
            ], 422);
        }

        $user->delete();

        return response()->json(['message' => 'Xóa người dùng thành công']);
    }
}
