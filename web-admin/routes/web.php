<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    $settings = [
        'license_price' => \App\Models\Setting::get('license_price', 2999.00),
        'showcase_items' => \App\Models\Setting::get('showcase_items'),
    ];
    return view('welcome', compact('settings'));
});

// Public Download Route
Route::get('/download-app', [CustomerController::class, 'downloadInstaller'])->name('public.download');

// Role-based Dashboard Redirect
Route::get('/dashboard', function () {
    if (auth()->user()->isAdmin()) {
        return redirect()->route('admin.dashboard');
    }
    return redirect()->route('customer.dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Customer Routes
Route::middleware(['auth', 'verified', 'customer'])->prefix('customer')->name('customer.')->group(function () {
    Route::get('/dashboard', [CustomerController::class, 'dashboard'])->name('dashboard');
    Route::post('/submit-payment', [CustomerController::class, 'submitPayment'])->name('submit-payment');
    Route::post('/cancel-payment/{payment}', [CustomerController::class, 'cancelPayment'])->name('cancel-payment');
    Route::get('/download', [CustomerController::class, 'downloadInstaller'])->name('download');
});

// Admin Routes
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::post('/payments/{payment}/verify', [AdminController::class, 'verifyPayment'])->name('payments.verify');
    Route::post('/payments/{payment}/reject', [AdminController::class, 'rejectPayment'])->name('payments.reject');

    // User Management
    Route::get('/users', [App\Http\Controllers\Admin\UserController::class, 'index'])->name('users.index');
    Route::post('/users/{user}/toggle-status', [App\Http\Controllers\Admin\UserController::class, 'toggleStatus'])->name('users.toggle-status');

    // License Management
    Route::get('/licenses', [App\Http\Controllers\Admin\LicenseController::class, 'index'])->name('licenses.index');
    Route::post('/licenses/{license}/revoke', [App\Http\Controllers\Admin\LicenseController::class, 'revoke'])->name('licenses.revoke');

    // Master License Management
    Route::middleware(['super_admin'])->group(function () {
        Route::get('/master-licenses', [App\Http\Controllers\Admin\MasterLicenseController::class, 'index'])->name('master-licenses.index');
        Route::post('/master-licenses', [App\Http\Controllers\Admin\MasterLicenseController::class, 'store'])->name('master-licenses.store');
        Route::post('/master-licenses/recovery-key', [App\Http\Controllers\Admin\MasterLicenseController::class, 'updateRecoveryKey'])->name('master-licenses.recovery-key');
        Route::post('/master-licenses/{license}/toggle', [App\Http\Controllers\Admin\MasterLicenseController::class, 'toggle'])->name('master-licenses.toggle');
        Route::delete('/master-licenses/{license}', [App\Http\Controllers\Admin\MasterLicenseController::class, 'destroy'])->name('master-licenses.destroy');
    });

    // Revenue Reports
    Route::get('/reports', [App\Http\Controllers\Admin\ReportController::class, 'index'])->name('reports.index');

    // System Settings
    Route::get('/settings', [App\Http\Controllers\Admin\SettingController::class, 'index'])->name('settings.index');
    Route::post('/settings/update', [App\Http\Controllers\Admin\SettingController::class, 'update'])->name('settings.update');
    Route::post('/verify-password', [App\Http\Controllers\Admin\SettingController::class, 'verifyPassword'])->name('verify-password');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
