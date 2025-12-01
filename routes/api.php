<?php

use App\Http\Controllers\Api\SupplierController;
<<<<<<< HEAD
use App\Http\Controllers\Api\DeviceModelController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\ManufacturerController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\StatusLabelController;
=======
>>>>>>> 9ac7679dc8da8f10996989599739b6e92dc3de03
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Quản lý nhà cung cấp (Suppliers)
    Route::apiResource('suppliers', SupplierController::class);
<<<<<<< HEAD
    Route::apiResource('device-models', DeviceModelController::class);
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('locations', LocationController::class);
    Route::apiResource('manufacturers', ManufacturerController::class);
    Route::apiResource('departments', DepartmentController::class);
    Route::apiResource('status-labels', StatusLabelController::class);
=======
>>>>>>> 9ac7679dc8da8f10996989599739b6e92dc3de03
});
