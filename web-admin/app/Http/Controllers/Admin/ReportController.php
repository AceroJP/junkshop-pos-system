<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function index()
    {
        // Monthly Revenue for Chart
        $monthlyRevenue = Payment::where('status', 'verified')
            ->select(
                DB::raw('sum(amount) as total'),
                DB::raw("strftime('%m', verified_at) as month")
            )
            ->whereYear('verified_at', date('Y'))
            ->groupBy('month')
            ->get()
            ->pluck('total', 'month')
            ->toArray();

        // Ensure all months are present
        $revenueData = [];
        for ($i = 1; $i <= 12; $i++) {
            $month = str_pad($i, 2, '0', STR_PAD_LEFT);
            $revenueData[] = $monthlyRevenue[$month] ?? 0;
        }

        $totalRevenue = Payment::where('status', 'verified')->sum('amount');
        $averageOrder = Payment::where('status', 'verified')->avg('amount');
        
        return view('admin.reports.index', compact('revenueData', 'totalRevenue', 'averageOrder'));
    }
}
