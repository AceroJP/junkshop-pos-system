<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MasterLicense;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class MasterLicenseController extends Controller
{
    public function index()
    {
        $licenses = MasterLicense::with('creator')->latest()->paginate(15);
        $recoveryKey = Setting::get('master_recovery_key', 'JUNK-ADMIN-RESET-99');
        return view('admin.master-licenses.index', compact('licenses', 'recoveryKey'));
    }

    public function updateRecoveryKey(Request $request)
    {
        $request->validate([
            'recovery_key' => 'required|string|min:8|max:50',
        ]);

        Setting::set('master_recovery_key', $request->recovery_key, 'security');

        return back()->with('status', 'Master Recovery Key updated successfully.');
    }

    public function store(Request $request)
    {
        $request->validate([
            'description' => 'nullable|string|max:255',
            'expires_at' => 'nullable|date|after:today',
        ]);

        $key = 'JUNK-MSTR-' . strtoupper(Str::random(4)) . '-' . strtoupper(Str::random(4));

        MasterLicense::create([
            'license_key' => $key,
            'description' => $request->description,
            'expires_at' => $request->expires_at,
            'created_by' => Auth::id(),
            'is_active' => true,
        ]);

        return back()->with('status', 'Master License Key generated: ' . $key);
    }

    public function toggle(MasterLicense $license)
    {
        $license->update(['is_active' => !$license->is_active]);
        return back()->with('status', 'Master License status updated.');
    }

    public function destroy(MasterLicense $license)
    {
        $license->delete();
        return back()->with('status', 'Master License deleted successfully.');
    }
}
