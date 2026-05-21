<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\License;
use Illuminate\Http\Request;

class LicenseController extends Controller
{
    public function index()
    {
        $licenses = License::with(['user', 'payment', 'device'])
            ->latest()
            ->paginate(15);

        return view('admin.licenses.index', compact('licenses'));
    }

    public function revoke(License $license)
    {
        $license->update(['status' => 'revoked']);
        return back()->with('status', 'License key has been revoked.');
    }
}
