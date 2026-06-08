import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend 
} from 'recharts';
import { generateReportPDF } from '../utils/pdfGenerator';

const Reports = ({ shopSettings }) => {
    const [period, setPeriod] = useState('overall');
    const [transactionDates, setTransactionDates] = useState([]);
    const [customDates, setCustomDates] = useState({
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [stats, setStats] = useState({ 
        totalPurchases: 0, 
        grandTotal: 0, 
        balanceOwed: 0, 
        salesByProduct: [], 
        transactions: [],
        creditSummary: [] 
    });
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [showExportDropdown, setShowExportDropdown] = useState(false);

    const COLORS = ['#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

    useEffect(() => {
        setIsMounted(true);
        loadStats();
        loadTransactionDates();

        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (showExportDropdown && !event.target.closest('.export-dropdown-container')) {
                setShowExportDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [period, customDates, showExportDropdown]);

    const loadTransactionDates = async () => {
        try {
            const dates = await window.electron.getTransactionDates();
            setTransactionDates(dates || []);
        } catch (err) {
            console.error('Failed to load transaction dates', err);
        }
    };

    const loadStats = async () => {
        setLoading(true);
        try {
            const result = await window.electron.getReportStats({ 
                period,
                startDate: period === 'custom' ? customDates.start : null,
                endDate: period === 'custom' ? customDates.end : null
            });
            if (result.success) {
                setStats({
                    totalPurchases: result.totalPurchases || 0,
                    grandTotal: result.grandTotal || 0,
                    balanceOwed: result.balanceOwed || 0,
                    salesByProduct: result.salesByProduct || [],
                    transactions: result.transactions || [],
                    creditSummary: result.creditSummary || []
                });
            }
        } catch (err) {
            console.error('Failed to load stats', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (exportPeriod, exportStartDate = null, exportEndDate = null) => {
        try {
            // Get data for the specific export period
            const result = await window.electron.getReportStats({ 
                period: exportPeriod,
                startDate: exportStartDate,
                endDate: exportEndDate
            });
            if (!result.success) throw new Error(result.error);

            // Fetch all transactions and filter them appropriately
            const allTransactions = await window.electron.getTransactions();
            let filteredTransactions = [];
            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

            if (exportPeriod === 'custom' && exportStartDate && exportEndDate) {
                const start = new Date(exportStartDate).getTime();
                const end = new Date(exportEndDate).setHours(23, 59, 59, 999);
                filteredTransactions = allTransactions.filter(t => {
                    const tDate = new Date(t.created_at + ' UTC').getTime();
                    return tDate >= start && tDate <= end;
                });
            } else if (exportPeriod === 'today') {
                filteredTransactions = allTransactions.filter(t => new Date(t.created_at + ' UTC').getTime() >= todayStart);
            } else if (exportPeriod === 'week') {
                const weekAgo = todayStart - (7 * 24 * 60 * 60 * 1000);
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

            // Generate PDF instead of Excel
            const reportData = {
                summary: result.salesByProduct,
                transactions: filteredTransactions
            };

            const pdfResult = await generateReportPDF(reportData, shopSettings, exportPeriod, exportStartDate, exportEndDate);
            
            // This will trigger the system print dialog in Electron
            if (window.electron && window.electron.savePDF) {
                const saveResult = await window.electron.savePDF({
                    filename: pdfResult.filename,
                    base64Data: pdfResult.base64Data,
                    printDirectly: true // Flag to suggest immediate printing
                });

                if (saveResult.success) {
                    Swal.fire({
                        title: 'Report Generated!',
                        text: 'PDF Report has been saved and is ready to print.',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false,
                        customClass: { popup: 'rounded-[2rem]' }
                    });
                }
            }
        } catch (err) {
            console.error('Export failed', err);
            Swal.fire('Error', 'Failed to export report.', 'error');
        }
    };

    const handleCustomExport = async () => {
        // Create a small HTML string for active dates
        const activeDatesHtml = transactionDates.length > 0 
            ? `<div class="mt-4 pt-4 border-t border-slate-100">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left mb-2">Available Transaction Dates:</p>
                <div class="flex flex-wrap gap-2">
                    ${transactionDates.slice(-8).reverse().map(date => `
                        <button onclick="document.getElementById('swal-start').value='${date}';document.getElementById('swal-end').value='${date}';" 
                                class="px-2 py-1 bg-brand-50 text-brand-600 rounded-md text-[9px] font-black border border-brand-100 hover:bg-brand-100 transition-colors">
                            ${new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </button>
                    `).join('')}
                </div>
               </div>`
            : '';

        const { value: formValues } = await Swal.fire({
            title: 'Custom Date Range',
            html: `
                <div class="space-y-4 p-4">
                    <div class="flex flex-col gap-2 text-left">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
                        <input id="swal-start" type="date" class="swal2-input !m-0 !w-full !rounded-xl !border-slate-100 !text-xs" value="${customDates.start}">
                    </div>
                    <div class="flex flex-col gap-2 mt-4 text-left">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Date</label>
                        <input id="swal-end" type="date" class="swal2-input !m-0 !w-full !rounded-xl !border-slate-100 !text-xs" value="${customDates.end}">
                    </div>
                    ${activeDatesHtml}
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Export PDF',
            confirmButtonColor: '#0ea5e9',
            customClass: {
                popup: 'rounded-[2rem]',
                confirmButton: 'rounded-xl font-black uppercase tracking-widest text-xs px-8 py-3',
                cancelButton: 'rounded-xl font-black uppercase tracking-widest text-xs px-8 py-3'
            },
            preConfirm: () => {
                return {
                    start: document.getElementById('swal-start').value,
                    end: document.getElementById('swal-end').value
                }
            }
        });

        if (formValues) {
            handleExport('custom', formValues.start, formValues.end);
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
                
                <div className="relative inline-block export-dropdown-container">
                    <button 
                        onClick={() => setShowExportDropdown(!showExportDropdown)}
                        className={`bg-brand-600 hover:bg-brand-700 text-white font-black px-6 py-3 rounded-xl transition-all text-[10px] lg:text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-brand-100 ${showExportDropdown ? 'ring-4 ring-brand-100' : ''}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export PDF Report
                        <svg className={`w-3 h-3 transition-transform duration-200 ${showExportDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                    </button>

                    {showExportDropdown && (
                        <div className="absolute top-full left-0 xl:right-0 xl:left-auto mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="px-4 py-2 mb-2 border-b border-slate-50">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Select Period</p>
                            </div>
                            {['today', 'week', 'month', 'year'].map((p) => (
                                <button 
                                    key={p}
                                    onClick={() => {
                                        handleExport(p);
                                        setShowExportDropdown(false);
                                    }}
                                    className="w-full text-left px-5 py-3 hover:bg-slate-50 transition-colors flex items-center gap-3 group"
                                >
                                    <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-brand-500 transition-colors"></div>
                                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest group-hover:text-brand-600">Export {p}</span>
                                </button>
                            ))}
                            <button 
                                onClick={() => {
                                    handleCustomExport();
                                    setShowExportDropdown(false);
                                }}
                                className="w-full text-left px-5 py-3 hover:bg-slate-50 transition-colors flex items-center gap-3 group border-t border-slate-50 mt-1"
                            >
                                <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-brand-500 transition-colors"></div>
                                <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest group-hover:text-brand-600">Custom Range</span>
                            </button>
                        </div>
                    )}
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

                        {/* Custom Date Inputs */}
                        <div className="pt-4 border-t border-slate-50 space-y-3">
                            <button 
                                onClick={() => setPeriod('custom')}
                                className={`w-full px-4 py-3 rounded-xl font-black text-[10px] lg:text-xs uppercase tracking-widest transition-all text-center md:text-left ${period === 'custom' ? 'bg-brand-600 text-white shadow-lg shadow-brand-100' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                Custom Range
                            </button>
                            
                            {period === 'custom' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">From</label>
                                        <input 
                                            type="date" 
                                            value={customDates.start}
                                            onChange={(e) => setCustomDates(prev => ({ ...prev, start: e.target.value }))}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-700 outline-none focus:border-brand-500 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">To</label>
                                        <input 
                                            type="date" 
                                            value={customDates.end}
                                            onChange={(e) => setCustomDates(prev => ({ ...prev, end: e.target.value }))}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-700 outline-none focus:border-brand-500 transition-colors"
                                        />
                                    </div>

                                    {/* Transaction Date Indicators */}
                                    <div className="pt-4 border-t border-slate-50">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Dates with Transactions</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {transactionDates.slice(-10).reverse().map(date => (
                                                <button
                                                    key={date}
                                                    onClick={() => {
                                                        setCustomDates({ start: date, end: date });
                                                    }}
                                                    className="px-2 py-1 bg-brand-50 hover:bg-brand-100 text-brand-600 rounded-md text-[9px] font-bold border border-brand-100 transition-colors flex items-center gap-1"
                                                >
                                                    <span className="w-1 h-1 bg-brand-500 rounded-full animate-pulse"></span>
                                                    {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </button>
                                            ))}
                                            {transactionDates.length === 0 && (
                                                <p className="text-[9px] text-slate-300 font-bold italic px-1">No transactions recorded yet</p>
                                            )}
                                        </div>
                                        <p className="text-[8px] text-slate-300 font-bold uppercase tracking-tighter mt-2 px-1">Tip: Click a date to select it</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-900 p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2rem] text-white space-y-4">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Period Purchases</p>
                            <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-400 leading-none break-words">
                                ₱{(stats.totalPurchases || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="pt-4 border-t border-white/10 space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overall Total Purchases</p>
                            <p className="text-xl lg:text-2xl font-black text-white leading-none">
                                ₱{(stats.grandTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pt-1">Period: {period}</p>
                    </div>

                    <div className="bg-rose-950 p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2rem] text-white space-y-2 border border-rose-900/50">
                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Total Balance Owed</p>
                        <p className="text-3xl lg:text-4xl font-black text-rose-400 leading-none break-words">
                            ₱{(stats.balanceOwed || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-[10px] font-bold text-rose-500/50 uppercase tracking-widest pt-2">Current outstanding credit</p>
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

            {/* Credit Summary Table */}
            <div className="bg-white rounded-[1.5rem] lg:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 lg:p-8 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="text-xs lg:text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                        <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                        Credit & Balance Summary
                    </h3>
                    <span className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">{stats.creditSummary.length} Active Credits</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 lg:px-10 py-4 lg:py-6 text-left text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Seller Name</th>
                                <th className="px-6 lg:px-10 py-4 lg:py-6 text-right text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Partial Paid</th>
                                <th className="px-6 lg:px-10 py-4 lg:py-6 text-right text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Balance Owed</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="3" className="px-10 py-10 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500 mx-auto"></div>
                                    </td>
                                </tr>
                            ) : stats.creditSummary.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-10 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-20">
                                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <p className="font-black uppercase tracking-[0.2em] text-[10px]">No outstanding credits</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                stats.creditSummary.map((c, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors group text-[11px] lg:text-sm">
                                        <td className="px-6 lg:px-10 py-4 lg:py-6">
                                            <span className="font-black text-slate-900 uppercase tracking-tight">{c.name}</span>
                                        </td>
                                        <td className="px-6 lg:px-10 py-4 lg:py-6 text-right">
                                            <span className="font-bold text-slate-400 italic">
                                                {c.total_partial_paid > 0 ? `₱${c.total_partial_paid.toFixed(2)}` : '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 lg:px-10 py-4 lg:py-6 text-right">
                                            <span className="font-black text-rose-600 text-sm lg:text-lg">₱{c.total_balance_owed.toFixed(2)}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
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
