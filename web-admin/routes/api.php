<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\LicenseController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/version', [LicenseController::class, 'version']);
Route::post('/validate-master-key', [LicenseController::class, 'validateMasterKey']);
Route::post('/activate', [LicenseController::class, 'activate']);
