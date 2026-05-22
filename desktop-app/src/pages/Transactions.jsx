import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { generateReceiptPDF } from '../utils/pdfGenerator';

const Transactions = ({ shopSettings, openModal }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [downloading, setDownloading] = useState(false);
    
    // Pagination & Filter States
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    useEffect(() => {
        loadTransactions();
    }, []);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, dateFrom, dateTo]);

    const loadTransactions = async () => {
        if (!window.electron || !window.electron.getTransactions) {
            console.warn('Electron IPC not available for transactions');
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const data = await window.electron.getTransactions();
            setTransactions(data || []);
        } catch (err) {
            console.error('Failed to load transactions', err);
        } finally {
            setLoading(false);
        }
    };

    const viewDetails = async (transaction) => {
        try {
            const items = await window.electron.getTransactionItems(transaction.id);
            if (openModal) {
                openModal('receipt', {
                    transaction,
                    items,
                    onDownload: handleDownloadPDF,
                    onReprint: handleReprint
                });
            }
        } catch (err) {
            Swal.fire('Error', 'Failed to load transaction details', 'error');
        }
    };

    const handleReprint = async (id) => {
        try {
            const result = await window.electron.reprintReceipt(id);
            if (result.success) {
                Swal.fire({
                    title: 'Printing...',
                    text: 'The receipt has been sent to your printer.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    confirmButtonColor: '#0ea5e9',
                    customClass: {
                        title: 'font-black uppercase tracking-tight',
                        popup: 'rounded-[2rem]'
                    }
                });
            } else {
                let errorMessage = result.error || 'Something went wrong while printing.';
                if (result.error && (result.error.includes('No driver set') || result.error.includes('Printer driver error'))) {
                    errorMessage = 'Printer not found or driver error. Please check your printer connection or settings.';
                }
                
                Swal.fire({
                    title: 'Printer Error',
                    text: errorMessage,
                    icon: 'error',
                    confirmButtonColor: '#0ea5e9',
                    customClass: {
                        title: 'font-black uppercase tracking-tight',
                        popup: 'rounded-[2rem]'
                    }
                });
            }
        } catch (err) {
            Swal.fire({
                title: 'Error',
                text: 'We could not start the printing process. Please try again.',
                icon: 'error',
                confirmButtonColor: '#0ea5e9',
                customClass: {
                    title: 'font-black uppercase tracking-tight',
                    popup: 'rounded-[2rem]'
                }
            });
        }
    };

    const handleDownloadPDF = async (transaction) => {
        setDownloading(true);
        try {
            const items = await window.electron.getTransactionItems(transaction.id);
            const pdfData = await generateReceiptPDF(transaction, items, shopSettings);
            const result = await window.electron.savePDF(pdfData);

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Receipt saved successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } catch (err) {
            console.error('Download failed', err);
            Swal.fire('Error', 'Failed to generate PDF', 'error');
        } finally {
            setDownloading(false);
        }
    };

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.transaction_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.cashier_name && t.cashier_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (t.customer_name && t.customer_name.toLowerCase().includes(searchQuery.toLowerCase()));
        
        // Date filtering
        const transactionDate = new Date(t.created_at).toISOString().split('T')[0];
        const matchesDateFrom = !dateFrom || transactionDate >= dateFrom;
        const matchesDateTo = !dateTo || transactionDate <= dateTo;

        return matchesSearch && matchesDateFrom && matchesDateTo;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fade-in pb-20">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight leading-none">Transactions</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">View & reprint receipts</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Date Filters */}
                    <div className="flex items-center gap-2 bg-white border-2 border-slate-100 p-1.5 rounded-2xl">
                        <div className="flex flex-col px-3">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">From</span>
                            <input 
                                type="date" 
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="bg-transparent outline-none text-[11px] font-bold text-slate-900" 
                            />
                        </div>
                        <div className="w-px h-8 bg-slate-100"></div>
                        <div className="flex flex-col px-3">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">To</span>
                            <input 
                                type="date" 
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="bg-transparent outline-none text-[11px] font-bold text-slate-900" 
                            />
                        </div>
                        {(dateFrom || dateTo) && (
                            <button 
                                onClick={() => { setDateFrom(''); setDateTo(''); }}
                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                title="Clear Dates"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>

                    {/* Search */}
                    <div className="bg-white border-2 border-slate-100 h-14 w-full sm:w-72 rounded-2xl flex items-center px-4 gap-3 focus-within:ring-4 focus-within:ring-brand-500/10 focus-within:border-brand-500 transition-all">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent outline-none text-sm font-bold w-full text-slate-900 placeholder:text-slate-400" 
                        />
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-[2rem] lg:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    <table className="w-full min-w-[1100px]">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-4 lg:px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-[180px]">Transaction ID</th>
                                <th className="px-4 lg:px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-[200px]">Date & Time</th>
                                <th className="px-4 lg:px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-[180px]">Customer</th>
                                <th className="px-4 lg:px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-[120px]">Status</th>
                                <th className="px-4 lg:px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-[160px]">Total Amount</th>
                                <th className="sticky right-0 bg-slate-50 lg:bg-transparent px-4 lg:px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] shadow-[-12px_0_15px_-3px_rgba(0,0,0,0.02)] lg:shadow-none w-[260px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-10 py-20 text-center">
                                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500 mx-auto"></div>
                                    </td>
                                </tr>
                            ) : currentTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-10 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-20">
                                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1.01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            <p className="font-black uppercase tracking-[0.3em] text-xs">No transactions found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentTransactions.map(t => (
                                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-4 lg:px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">ID</span>
                                                <span className="font-black text-slate-900 uppercase tracking-tight text-xs lg:text-sm">{t.transaction_number.replace('TXN-', '')}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 lg:px-8 py-6">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-bold text-slate-700 text-xs lg:text-sm">{new Date(t.created_at + ' UTC').toLocaleDateString()}</span>
                                                <span className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(t.created_at + ' UTC').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                {t.status === 'completed' && t.paid_at && (
                                                    <div className="mt-1 flex items-center gap-1 whitespace-nowrap">
                                                        <span className="text-[7px] lg:text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-1 py-0.5 rounded">Paid</span>
                                                        <span className="text-[8px] lg:text-[9px] font-bold text-emerald-600 uppercase tracking-tight">
                                                            {new Date(t.paid_at + ' UTC').toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                        </span>
                                                    </div>
                                                )}
                                                {t.status === 'partial' && t.paid_at && (
                                                    <div className="mt-1 flex items-center gap-1 whitespace-nowrap">
                                                        <span className="text-[7px] lg:text-[8px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-1 py-0.5 rounded">Part</span>
                                                        <span className="text-[8px] lg:text-[9px] font-bold text-amber-600 uppercase tracking-tight">
                                                            {new Date(t.paid_at + ' UTC').toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 lg:px-8 py-6">
                                            <span className="font-bold text-slate-600 text-xs lg:text-sm">{t.customer_name || 'Walk-in'}</span>
                                        </td>
                                        <td className="px-4 lg:px-8 py-6">
                                            <span className={`text-[9px] lg:text-[10px] font-black px-2.5 lg:px-3 py-1 rounded-full uppercase tracking-widest w-fit ${
                                                t.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 
                                                t.status === 'unpaid' ? 'bg-rose-50 text-rose-600' : 
                                                t.status === 'partial' ? 'bg-amber-50 text-amber-600' :
                                                'bg-slate-50 text-slate-600'
                                            }`}>
                                                {t.status === 'completed' ? 'Paid' : 
                                                 t.status === 'unpaid' ? 'Unpaid' : 
                                                 'Partial'}
                                            </span>
                                        </td>
                                        <td className="px-4 lg:px-8 py-6 text-right">
                                            <span className="font-black text-brand-600 text-base lg:text-lg whitespace-nowrap">₱{t.total_amount.toFixed(2)}</span>
                                        </td>
                                        <td className="sticky right-0 bg-white group-hover:bg-slate-50/50 px-4 lg:px-8 py-6 text-right shadow-[-12px_0_15px_-3px_rgba(0,0,0,0.02)] lg:shadow-none transition-colors">
                                            <div className="flex items-center justify-end gap-1.5 lg:gap-2">
                                                <button 
                                                    onClick={() => viewDetails(t)}
                                                    className="flex items-center gap-1.5 px-2.5 lg:px-3 py-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-brand-50 hover:text-brand-600 transition-all active:scale-95 whitespace-nowrap"
                                                    title="View Details"
                                                >
                                                    <svg className="w-3.5 h-3.5 lg:w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest hidden sm:inline">View</span>
                                                </button>
                                                <button 
                                                    disabled={downloading}
                                                    onClick={() => handleDownloadPDF(t)}
                                                    className="flex items-center gap-1.5 px-2.5 lg:px-3 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-95 whitespace-nowrap"
                                                    title="Download PDF"
                                                >
                                                    <svg className="w-3.5 h-3.5 lg:w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                    <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest hidden sm:inline">PDF</span>
                                                </button>
                                                <button 
                                                    onClick={() => handleReprint(t.id)}
                                                    className="flex items-center gap-1.5 px-2.5 lg:px-3 py-2 bg-brand-50 text-brand-600 rounded-xl hover:bg-brand-600 hover:text-white transition-all active:scale-95 whitespace-nowrap"
                                                    title="Reprint Receipt"
                                                >
                                                    <svg className="w-3.5 h-3.5 lg:w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                                    <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest hidden sm:inline">Print</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {!loading && totalPages > 1 && (
                    <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTransactions.length)} of {filteredTransactions.length}
                        </p>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            
                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => paginate(i + 1)}
                                        className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                                            currentPage === i + 1 
                                            ? 'bg-brand-500 text-white shadow-lg shadow-brand-200' 
                                            : 'bg-white text-slate-400 border border-slate-200 hover:border-brand-500 hover:text-brand-600'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button 
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Transactions;