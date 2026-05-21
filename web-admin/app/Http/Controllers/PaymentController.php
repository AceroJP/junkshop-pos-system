<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    /**
     * Show the payment submission form.
     */
    public function create()
    {
        return view('payments.create');
    }

    /**
     * Store a new payment request (GCash manual verification).
     */
    public function store(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'reference_number' => 'required|string|unique:payments,reference_number',
        ]);

        Payment::create([
            'user_id' => Auth::id(),
            'amount' => $request->amount,
            'reference_number' => $request->reference_number,
            'status' => 'pending',
        ]);

        return redirect()->route('dashboard')->with('status', 'Payment submitted successfully. Please wait for admin verification.');
    }
}
