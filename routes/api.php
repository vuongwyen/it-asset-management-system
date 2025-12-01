<?php

use App\Http\Controllers\Api\SupplierController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Quản lý nhà cung cấp (Suppliers)
    Route::apiResource('suppliers', SupplierController::class);
});
