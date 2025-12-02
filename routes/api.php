<?php

use App\Http\Controllers\Api\AssetController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ManufacturerController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\StatusLabelController;
use App\Http\Controllers\Api\AssetTransactionController;
use App\Http\Controllers\Api\MaintenanceController;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Public Routes
    Route::post('login', [AuthController::class, 'login']);

    // Protected Routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);

        // Master Data
        Route::apiResource('categories', CategoryController::class);
        Route::apiResource('manufacturers', ManufacturerController::class);
        Route::apiResource('departments', DepartmentController::class);
        Route::apiResource('status-labels', StatusLabelController::class);

        // Assets
        Route::apiResource('assets', AssetController::class);

        // Asset Transactions
        Route::post('assets/checkout', [AssetTransactionController::class, 'checkout']);
        Route::post('assets/checkin', [AssetTransactionController::class, 'checkin']);

        // Maintenance
        Route::apiResource('maintenances', MaintenanceController::class);
    });
});
