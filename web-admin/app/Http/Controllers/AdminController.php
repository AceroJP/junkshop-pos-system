<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\License;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    public function dashboard()
    {
        $pendingCount = Payment::where('status', 'pending')->count();
        $pendingTotal = Payment::where('status', 'pending')->sum('amount');

        $verifiedTodayCount = Payment::where('status', 'verified')
            ->whereDate('verified_at', now()->toDateString())
            ->count();
        $verifiedTodayTotal = Payment::where('status', 'verified')
            ->whereDate('verified_at', now()->toDateString())
            ->sum('amount');

        $activeLicensesCount = License::where('status', 'active')->count();

        $pendingPayments = Payment::with('user')
            ->where('status', 'pending')
            ->oldest()
            ->get();

        $recentVerifiedPayments = Payment::with(['user', 'verifiedBy', 'license'])
            ->where('status', 'verified')
            ->latest('verified_at')
            ->limit(10)
            ->get();

        return view('admin.dashboard', compact(
            'pendingCount', 'pendingTotal', 
            'verifiedTodayCount', 'verifiedTodayTotal', 
            'activeLicensesCount', 'pendingPayments', 
            'recentVerifiedPayments'
        ));
    }

    public function verifyPayment(Payment $payment)
    {
        if ($payment->status !== 'pending') {
            return back()->with('error', 'Payment is already processed.');
        }

        $payment->update([
            'status' => 'verified',
            'verified_at' => now(),
            'verified_by' => Auth::id(),
        ]);

        $prefix = Setting::get('license_prefix', 'JUNK');
        $licenseKey = strtoupper($prefix . '-' . Str::random(4) . '-' . Str::random(4) . '-' . Str::random(4));

        License::create([
            'license_key' => $licenseKey,
            'user_id' => $payment->user_id,
            'payment_id' => $payment->id,
            'status' => 'inactive',
            'activated_at' => null,
        ]);

        return back()->with('status', "Payment verified successfully. License Key generated: $licenseKey");
    }

    public function rejectPayment(Request $request, Payment $payment)
    {
        if ($payment->status !== 'pending') {
            return back()->with('error', 'Payment is already processed.');
        }

        $request->validate([
            'rejection_reason' => 'required|string|max:255',
        ]);

        if ($payment->receipt_image) {
            Storage::disk('public')->delete($payment->receipt_image);
        }

        $payment->update([
            'status' => 'rejected',
            'rejection_reason' => $request->rejection_reason,
            'verified_by' => Auth::id(),
            'receipt_image' => null, // Clear image path on rejection
        ]);

        return back()->with('status', 'Payment has been rejected.');
    }
}
