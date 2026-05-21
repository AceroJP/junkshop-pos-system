import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend 
} from 'recharts';

const Reports = () => {
    const [period, setPeriod] = useState('overall');
    const [stats, setStats] = useState({ totalPurchases: 0, salesByProduct: [], transactions: [] });
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    const COLORS = ['#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

    useEffect(() => {
        setIsMounted(true);
        loadStats();
    }, [period]);

    const loadStats = async () => {
        setLoading(true);
        try {
            const result = await window.electron.getReportStats({ period });
            if (result.success) {
                setStats({
                    totalPurchases: result.totalPurchases ?? result.totalIncome ?? 0,
                    salesByProduct: result.salesByProduct || [],
                    transactions: result.transactions || []
                });
            }
        } catch (err) {
            console.error('Failed to load stats', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (exportPeriod) => {
        try {
            // Get data for the specific export period
            const result = await window.electron.getReportStats({ period: exportPeriod });
            if (!result.success) throw new Error(result.error);

            // Fetch transactions for detailed export
            // We'll use getTransactions and filter them based on the period
            const allTransactions = await window.electron.getTransactions();
            let filteredTransactions = [];
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

            if (exportPeriod === 'today') {
                filteredTransactions = allTransactions.filter(t => new Date(t.created_at + ' UTC').getTime() >= today);
            } else if (exportPeriod === 'week') {
                const weekAgo = today - (7 * 24 * 60 * 60 * 1000);
                filteredTransactions = allTransactions.filter(t => new Date(t.created_at + ' UTC').getTime() >= weekAgo);
            } else if (exportPeriod === 'month') {
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
                filteredTransactions = allTransactions.filter(t => new Date(t.created_at + ' UTC').getTime() >= monthStart);
            } else if (exportPeriod === 'year') {
                const yearStart = new Date(now.getFullYear(), 0, 1).getTime();
                filteredTransactions = allTransactions.filter(t => new Date(t.created_at + ' UTC').getTime() >= yearStart);
            } else {
                filteredTransactions = allTransactions;
            }

            // Prepare Excel data
            const wsData = filteredTransactions.map(t => ({
                'Transaction ID': t.transaction_number,
                'Date': new Date(t.created_at + ' UTC').toLocaleDateString(),
                'Time': new Date(t.created_at + ' UTC').toLocaleTimeString(),
                'Customer': t.customer_name || 'Walk-in',
                'Cashier': t.cashier_name || 'System',
                'Total Amount': t.total_amount
            }));

            // Summary Sheet
            const summaryData = result.salesByProduct.map(p => ({
                'Item Name': p.name,
                'Total Weight (kg)': p.total_weight,
                'Total Purchases': p.total_amount
            }));

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(wsData);
            const wsSummary = XLSX.utils.json_to_sheet(summaryData);

            XLSX.utils.book_append_sheet(wb, ws, "Transactions");
            XLSX.utils.book_append_sheet(wb, wsSummary, "Scrap Sales Summary");

            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const base64Data = btoa(String.fromCharCode.apply(null, new Uint8Array(excelBuffer)));

            const saveResult = await window.electron.saveExcel({
                filename: `Report_${exportPeriod}_${new Date().toISOString().split('T')[0]}.xlsx`,
                base64Data
            });

            if (saveResult.success) {
                Swal.fire({
                    title: 'Export Success!',
                    text: 'Report saved successfully.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: { popup: 'rounded-[2rem]' }
                });
            }
        } catch (err) {
            console.error('Export failed', err);
            Swal.fire('Error', 'Failed to export report.', 'error');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-10 animate-fade-in pb-20 px-2 sm:px-0">
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-3xl lg:text-4xl font-black text-slate-900 uppercase tracking-tight leading-none">Reports</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[9px] lg:text-[10px]">Analyze sales & performance</p>
                </div>
                
                <div className="flex flex-wrap gap-2 lg:gap-3">
                    {['today', 'week', 'month', 'year'].map((p) => (
                        <button 
                            key={p}
                            onClick={() => handleExport(p)}
                            className="flex-1 min-w-[120px] sm:flex-none bg-white border-2 border-slate-100 hover:border-brand-500 hover:text-brand-600 text-slate-500 font-black px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl transition-all text-[9px] lg:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Export {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Filter & Income Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {/* Filters */}
                <div className="md:col-span-1 lg:col-span-1 space-y-4">
                    <div className="bg-white p-6 rounded-[1.5rem] lg:rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Period Filter</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-1 gap-2">
                            {['overall', 'today', 'week', 'month'].map((p) => (
                                <button 
                                    key={p}
                                    onClick={() => setPeriod(p)}
                                    className={`px-4 py-3 rounded-xl font-black text-[10px] lg:text-xs uppercase tracking-widest transition-all text-center md:text-left ${period === p ? 'bg-brand-600 text-white shadow-lg shadow-brand-100' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-900 p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2rem] text-white space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Purchases</p>
                        <p className="text-3xl lg:text-4xl font-black text-emerald-400 leading-none truncate">
                            ₱{(stats.totalPurchases || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pt-2">For {period} period</p>
                    </div>
                </div>

                {/* Charts Area */}
                <div className="md:col-span-1 lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    <div className="bg-white p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2rem] border border-slate-100 shadow-sm flex flex-col min-h-[350px] lg:h-[400px]">
                        <h3 className="text-xs lg:text-sm font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-2 h-2 bg-brand-500 rounded-full"></span>
                            Scrap Sales Distribution
                        </h3>
                        <div className="flex-1 min-h-[250px] lg:min-h-0">
                            {isMounted && stats.salesByProduct.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.salesByProduct}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={window.innerWidth < 1024 ? 40 : 60}
                                            outerRadius={window.innerWidth < 1024 ? 60 : 80}
                                            paddingAngle={5}
                                            dataKey="total_amount"
                                        >
                                            {stats.salesByProduct.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value) => `₱${value.toFixed(2)}`}
                                        />
                                        <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-20">
                                    <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                    <p className="text-[10px] font-black uppercase tracking-widest">No data for charts</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2rem] border border-slate-100 shadow-sm flex flex-col min-h-[350px] lg:h-[400px]">
                        <h3 className="text-xs lg:text-sm font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                            Volume by Scrap Type (kg)
                        </h3>
                        <div className="flex-1 min-h-[250px] lg:min-h-0">
                            {isMounted && stats.salesByProduct.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.salesByProduct}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold' }} />
                                        <Tooltip 
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value) => `${value.toFixed(2)} kg`}
                                        />
                                        <Bar dataKey="total_weight" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={window.innerWidth < 640 ? 15 : 30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-20">
                                    <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                    <p className="text-[10px] font-black uppercase tracking-widest">No data for charts</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-[1.5rem] lg:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 lg:p-8 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="text-xs lg:text-sm font-black text-slate-900 uppercase tracking-tight">Period Transactions</h3>
                    <span className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">{stats.transactions.length} Records</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 lg:px-10 py-4 lg:py-6 text-left text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction ID</th>
                                <th className="px-6 lg:px-10 py-4 lg:py-6 text-left text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date & Time</th>
                                <th className="px-6 lg:px-10 py-4 lg:py-6 text-left text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer</th>
                                <th className="px-6 lg:px-10 py-4 lg:py-6 text-left text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cashier</th>
                                <th className="px-6 lg:px-10 py-4 lg:py-6 text-right text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-10 py-20 text-center">
                                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500 mx-auto"></div>
                                    </td>
                                </tr>
                            ) : stats.transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-10 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-20">
                                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            <p className="font-black uppercase tracking-[0.3em] text-xs">No transactions found for this period</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                stats.transactions.map(t => (
                                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group text-[11px] lg:text-sm">
                                        <td className="px-6 lg:px-10 py-4 lg:py-6">
                                            <span className="font-black text-slate-900 uppercase tracking-tight">{t.transaction_number}</span>
                                        </td>
                                        <td className="px-6 lg:px-10 py-4 lg:py-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700">{new Date(t.created_at + ' UTC').toLocaleDateString()}</span>
                                                <span className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(t.created_at + ' UTC').toLocaleTimeString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 lg:px-10 py-4 lg:py-6">
                                            <span className="font-bold text-slate-600">{t.customer_name || 'Walk-in'}</span>
                                        </td>
                                        <td className="px-6 lg:px-10 py-4 lg:py-6">
                                            <span className="font-bold text-slate-600">{t.cashier_name || 'System'}</span>
                                        </td>
                                        <td className="px-6 lg:px-10 py-4 lg:py-6 text-right">
                                            <span className="font-black text-brand-600 text-sm lg:text-lg">₱{t.total_amount.toFixed(2)}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
