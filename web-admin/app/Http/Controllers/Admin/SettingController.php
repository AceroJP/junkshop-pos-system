<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key');
        return view('admin.settings.index', compact('settings'));
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'gcash_number' => 'required|string',
            'license_price' => 'required|numeric|min:0',
            'license_prefix' => 'required|string|max:10',
            'support_email' => 'required|email',
            'app_version' => 'required|string',
            'installer_download_link' => 'nullable|string',
        ]);

        foreach ($data as $key => $value) {
            Setting::set($key, $value);
        }

        return back()->with('status', 'System settings updated successfully.');
    }
}
