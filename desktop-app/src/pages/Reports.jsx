import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend 
} from 'recharts';
import { generateReportPDF } from '../utils/pdfGenerator';

const Reports = ({ shopSettings }) => {
    const [period, setPeriod] = useState('today');
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
        creditSummary: [],
        trendData: []
    });
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [showExportDropdown, setShowExportDropdown] = useState(false);

    const COLORS = ['#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

    const handleGraphClick = (data) => {
        if (!data || !data.activePayload || !data.activePayload[0]) return;
        
        const payload = data.activePayload[0].payload;
        const value = payload.filter_value;

        if (period === 'month') {
            // Drill down from Week to Days
            // Calculate start and end of that week in the current month
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth();
            const weekNum = parseInt(value);
            
            const startDay = (weekNum - 1) * 7 + 1;
            const endDay = Math.min(weekNum * 7, new Date(year, month + 1, 0).getDate());
            
            const startDate = new Date(year, month, startDay).toISOString().split('T')[0];
            const endDate = new Date(year, month, endDay).toISOString().split('T')[0];
            
            setCustomDates({ start: startDate, end: endDate });
            setPeriod('custom');
        } else if (period === 'week' || (period === 'custom' && customDates.start !== customDates.end)) {
            // Drill down from Day to Hours
            setCustomDates({ start: value, end: value });
            setPeriod('custom');
        }
    };

    const selectQuickMonth = (monthsBack) => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1).toISOString().split('T')[0];
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        setCustomDates({ start, end });
        setPeriod('custom');
    };

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
                    creditSummary: result.creditSummary || [],
                    trendData: result.trendData || []
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
                        <div className="grid grid-cols-3 md:grid-cols-1 gap-2">
                            {['today', 'week', 'month'].map((p) => (
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
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => selectQuickMonth(0)}
                                    className="flex-1 px-2 py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg text-[8px] font-black uppercase tracking-widest border border-slate-100 transition-colors"
                                >
                                    This Month
                                </button>
                                <button 
                                    onClick={() => selectQuickMonth(1)}
                                    className="flex-1 px-2 py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg text-[8px] font-black uppercase tracking-widest border border-slate-100 transition-colors"
                                >
                                    Last 2 Mos
                                </button>
                            </div>
                            
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

                    <div className="bg-slate-900 p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2rem] text-white space-y-4 shadow-2xl shadow-slate-200">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Period Purchases Total</p>
                            <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-400 leading-none break-words">
                                ₱{(stats.totalPurchases || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pt-1 border-t border-white/5">
                            Active Period: <span className="text-white">{period === 'custom' ? `${customDates.start} to ${customDates.end}` : period}</span>
                        </p>
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
                <div className="md:col-span-1 lg:col-span-3 grid grid-cols-1 gap-4 lg:gap-6">
                    {/* Purchase Trends Chart */}
                    <div className="bg-white p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2rem] border border-slate-100 shadow-sm flex flex-col min-h-[400px]">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xs lg:text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                                <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></span>
                                Purchase Trends
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                    {period === 'today' ? 'Real-time View' : period === 'week' ? 'Daily View' : 'Weekly View'}
                                </span>
                                <p className="text-[8px] font-black text-brand-600 uppercase tracking-widest bg-brand-50 px-2 py-1 rounded-md border border-brand-100 animate-bounce">
                                    Click Bar to Drill Down
                                </p>
                            </div>
                        </div>
                        <div className="flex-1 min-h-[300px]">
                            {isMounted && stats.trendData && stats.trendData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.trendData} onClick={handleGraphClick}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis 
                                            dataKey="label" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fontSize: 9, fontWeight: 'black', fill: '#64748b' }} 
                                            dy={10} 
                                        />
                                        <YAxis 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fontSize: 9, fontWeight: 'black', fill: '#64748b' }} 
                                            tickFormatter={(val) => `₱${val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}`}
                                        />
                                        <Tooltip 
                                            cursor={{ fill: '#f1f5f9', radius: 8 }}
                                            contentStyle={{ 
                                                borderRadius: '1.5rem', 
                                                border: 'none', 
                                                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                                padding: '12px 16px'
                                            }}
                                            formatter={(value) => [`₱${value.toLocaleString()}`, 'Amount']}
                                            labelStyle={{ fontSize: '10px', fontWeight: '900', color: '#0f172a', marginBottom: '4px', textTransform: 'uppercase' }}
                                        />
                                        <Bar 
                                            dataKey="amount" 
                                            fill="#0ea5e9" 
                                            radius={[8, 8, 8, 8]} 
                                            barSize={period === 'today' ? undefined : 40}
                                            className="cursor-pointer hover:fill-brand-600 transition-colors"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-20">
                                    <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                                    <p className="text-[10px] font-black uppercase tracking-widest">No trend data for this period</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                        <div className="bg-white p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2rem] border border-slate-100 shadow-sm flex flex-col min-h-[350px]">
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
                                                innerRadius={60}
                                                outerRadius={80}
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

                        <div className="bg-white p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2rem] border border-slate-100 shadow-sm flex flex-col min-h-[350px]">
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
            </div>
        </div>
    );
};

export default Reports;
