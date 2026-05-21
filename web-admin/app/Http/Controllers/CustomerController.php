<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class CustomerController extends Controller
{
    public function dashboard()
    {
        $user = Auth::user();
        
        $activeLicense = $user->licenses()
            ->whereIn('status', ['active', 'inactive'])
            ->first();
        $pendingPayment = $user->payments()->where('status', 'pending')->first();
        $paymentHistory = $user->payments()->latest()->get();
        $latestRejectedPayment = $user->payments()
            ->where('status', 'rejected')
            ->latest()
            ->first();

        // Only show rejection alert if it's the most recent activity and no pending/active license
        if ($latestRejectedPayment && ($paymentHistory->first()->id !== $latestRejectedPayment->id || $activeLicense || $pendingPayment)) {
            $latestRejectedPayment = null;
        }

        $settings = [
            'gcash_number' => Setting::get('gcash_number', '09123456789'),
            'license_price' => Setting::get('license_price', 4999.00),
        ];

        return view('customer.dashboard', compact('activeLicense', 'pendingPayment', 'paymentHistory', 'settings', 'latestRejectedPayment'));
    }

    public function submitPayment(Request $request)
    {
        $request->validate([
            'reference_number' => [
                'required',
                'string',
                'regex:/^09\d{9}$/',
                function ($attribute, $value, $fail) {
                    $exists = Payment::where('reference_number', $value)
                        ->whereIn('status', ['pending', 'verified'])
                        ->exists();
                    if ($exists) {
                        $fail('This GCash number has already been used for a pending or verified payment.');
                    }
                },
            ],
            'receipt_image' => 'required|image|mimes:jpeg,png|max:2048',
        ], [
            'reference_number.regex' => 'The GCash number must be 11 digits and start with 09.',
        ]);

        $licensePrice = Setting::get('license_price', 4999.00);
        $path = $request->file('receipt_image')->store('payments', 'public');

        Payment::create([
            'user_id' => Auth::id(),
            'amount' => $licensePrice,
            'reference_number' => $request->reference_number,
            'receipt_image' => $path,
            'status' => 'pending',
        ]);

        return back()->with('status', 'Payment submitted successfully. Please wait for admin verification.');
    }

    public function cancelPayment(Payment $payment)
    {
        if ($payment->user_id !== Auth::id() || $payment->status !== 'pending') {
            abort(403);
        }

        if ($payment->receipt_image) {
            Storage::disk('public')->delete($payment->receipt_image);
        }

        $payment->delete();

        return back()->with('status', 'Payment request cancelled.');
    }

    public function downloadInstaller()
    {
        $downloadLink = Setting::get('installer_download_link', '#');

        if (!$downloadLink || $downloadLink === '#') {
            return back()->with('status', 'The installer is currently being prepared. Please check back later or contact support.');
        }

        return redirect()->away($downloadLink);
    }
}
