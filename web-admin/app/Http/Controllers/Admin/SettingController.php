<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key');
        return view('admin.settings.index', compact('settings'));
    }

    public function verifyPassword(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        if (Hash::check($request->password, Auth::user()->password)) {
            return response()->json(['success' => true]);
        }

        return response()->json(['success' => false, 'message' => 'Incorrect password.'], 422);
    }

    public function update(Request $request)
    {
        $request->validate([
            'gcash_number' => 'required|string',
            'license_price' => 'required|numeric|min:0',
            'license_prefix' => 'required|string|max:10',
            'support_email' => 'required|email',
            'app_version' => 'required|string',
            'installer_download_link' => 'nullable|string',
            'master_recovery_key' => 'required|string|min:8|max:50',
            
            // Product Showcase Settings (JSON Array)
            'showcase_items' => 'nullable|array',
            'showcase_items.*.title' => 'required|string|max:100',
            'showcase_items.*.desc' => 'required|string|max:255',
            'showcase_items.*.image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        // Handle normal settings
        foreach ($request->except(['_token', 'showcase_items']) as $key => $value) {
            Setting::set($key, $value);
        }

        // Handle showcase items
        $existingItems = json_decode(Setting::get('showcase_items', '[]'), true);
        $newItems = $request->input('showcase_items', []);
        $finalItems = [];

        foreach ($newItems as $index => $item) {
            $processedItem = [
                'title' => $item['title'],
                'desc' => $item['desc'],
                'image_path' => $existingItems[$index]['image_path'] ?? null,
            ];

            // Handle new image upload
            if ($request->hasFile("showcase_items.$index.image")) {
                $file = $request->file("showcase_items.$index.image");
                $filename = time() . '_' . $index . '.' . $file->getClientOriginalExtension();
                $file->move(public_path('uploads/showcase'), $filename);
                $processedItem['image_path'] = 'uploads/showcase/' . $filename;
            }

            $finalItems[] = $processedItem;
        }

        Setting::set('showcase_items', json_encode($finalItems));

        return back()->with('status', 'System settings updated successfully.');
    }
}
