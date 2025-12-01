<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::latest()->paginate(10);
        return CategoryResource::collection($categories);
    }

    public function store(StoreCategoryRequest $request)
    {
        $category = Category::create($request->validated());

        return response()->json([
            'message' => 'Tạo danh mục thành công!',
            'data'    => new CategoryResource($category)
        ], 201);
    }

    public function show($id)
    {
        $category = Category::findOrFail($id);
        return new CategoryResource($category);
    }

    public function update(UpdateCategoryRequest $request, $id)
    {
        $category = Category::findOrFail($id);
        $category->update($request->validated());

        return response()->json([
            'message' => 'Cập nhật thành công!',
            'data'    => new CategoryResource($category)
        ]);
    }

    public function destroy($id)
    {
        $category = Category::findOrFail($id);

        // Check foreign key constraint
        if ($category->deviceModels()->exists()) {
            return response()->json([
                'message' => 'Không thể xóa! Danh mục này đang được sử dụng bởi các mẫu thiết bị.'
            ], 422);
        }

        $category->delete();

        return response()->json(['message' => 'Xóa danh mục thành công']);
    }
}
