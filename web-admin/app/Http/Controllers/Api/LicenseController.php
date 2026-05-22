<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\License;
use App\Models\Device;
use App\Models\Setting;

class LicenseController extends Controller
{
    public function version()
    {
        return response()->json([
            'version' => Setting::get('app_version', '1.0.0'),
            'download_url' => route('customer.download')
        ]);
    }

    public function activate(Request $request)
    {
        $request->validate([
            'license_key' => 'required|string',
            'device_id' => 'required|string',
        ]);

        $license = License::where('license_key', $request->license_key)->first();

        if (!$license) {
            return response()->json(['message' => 'Invalid license key'], 404);
        }

        if ($license->status !== 'inactive') {
            // Check if it's already bound to this device
            $device = Device::where('license_id', $license->id)
                ->where('device_id', $request->device_id)
                ->first();

            if ($device) {
                return response()->json(['message' => 'License already activated on this device'], 200);
            }

            return response()->json(['message' => 'License already used on another device'], 403);
        }

        // Activate
        $license->update([
            'status' => 'active',
            'activated_at' => now(),
        ]);
        Device::create([
            'device_id' => $request->device_id,
            'license_id' => $license->id,
        ]);

        return response()->json(['message' => 'License activated successfully'], 200);
    }
}
