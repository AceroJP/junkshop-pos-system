import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { generateReceiptPDF } from '../utils/pdfGenerator';

const Transactions = ({ shopSettings }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [transactionItems, setTransactionItems] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        loadTransactions();
    }, []);

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
            setSelectedTransaction(transaction);
            setTransactionItems(items);
            setIsModalOpen(true);
        } catch (err) {
            Swal.fire('Error', 'Failed to load transaction details', 'error');
        }
    };

    const handleReprint = async (id) => {
        try {
            const result = await window.electron.reprintReceipt(id);
            if (result.success) {
                Swal.fire({
                    title: 'Reprinting...',
                    text: 'Receipt has been sent to the printer',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    confirmButtonColor: '#0ea5e9'
                });
            } else {
                Swal.fire('Error', result.error || 'Failed to print receipt', 'error');
            }
        } catch (err) {
            Swal.fire('Error', 'An unexpected error occurred', 'error');
        }
    };

    const handleDownloadPDF = async (transaction) => {
        setDownloading(true);
        try {
            let items = transactionItems;
            if (!selectedTransaction || selectedTransaction.id !== transaction.id) {
                items = await window.electron.getTransactionItems(transaction.id);
            }

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

    const filteredTransactions = transactions.filter(t => 
        t.transaction_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.cashier_name && t.cashier_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.customer_name && t.customer_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight leading-none">Transactions</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">View & reprint receipts</p>
                </div>
                
                <div className="bg-white border-2 border-slate-100 h-14 w-full sm:w-80 rounded-2xl flex items-center px-4 gap-3 focus-within:ring-4 focus-within:ring-brand-500/10 focus-within:border-brand-500 transition-all">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input 
                        type="text" 
                        placeholder="Search ID, Cashier or Customer..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent outline-none text-sm font-bold w-full text-slate-900 placeholder:text-slate-400" 
                    />
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-[2rem] lg:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 lg:px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction ID</th>
                                <th className="px-6 lg:px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date & Time</th>
                                <th className="px-6 lg:px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer</th>
                                <th className="px-6 lg:px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cashier</th>
                                <th className="px-6 lg:px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Amount</th>
                                <th className="px-6 lg:px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-10 py-20 text-center">
                                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500 mx-auto"></div>
                                    </td>
                                </tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-10 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-20">
                                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            <p className="font-black uppercase tracking-[0.3em] text-xs">No transactions found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map(t => (
                                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 lg:px-10 py-6">
                                            <span className="font-black text-slate-900 uppercase tracking-tight text-sm">{t.transaction_number}</span>
                                        </td>
                                        <td className="px-6 lg:px-10 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700 text-sm">{new Date(t.created_at + ' UTC').toLocaleDateString()}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(t.created_at + ' UTC').toLocaleTimeString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 lg:px-10 py-6">
                                            <span className="font-bold text-slate-600 text-sm">{t.customer_name || <span className="text-slate-300 italic">Walk-in</span>}</span>
                                        </td>
                                        <td className="px-6 lg:px-10 py-6">
                                            <span className="font-bold text-slate-600 text-sm">{t.cashier_name || 'System'}</span>
                                        </td>
                                        <td className="px-6 lg:px-10 py-6">
                                            <span className="font-black text-brand-600 text-lg">₱{t.total_amount.toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 lg:px-10 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button 
                                                    onClick={() => viewDetails(t)}
                                                    className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-brand-50 hover:text-brand-600 transition-all active:scale-90"
                                                    title="View Details"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                </button>
                                                <button 
                                                    disabled={downloading}
                                                    onClick={() => handleDownloadPDF(t)}
                                                    className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all active:scale-90"
                                                    title="Download PDF"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                </button>
                                                <button 
                                                    onClick={() => handleReprint(t.id)}
                                                    className="p-3 bg-brand-50 text-brand-600 rounded-2xl hover:bg-brand-600 hover:text-white transition-all active:scale-90"
                                                    title="Reprint Receipt"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Receipt Details Modal */}
            {isModalOpen && selectedTransaction && (
                <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-10 animate-fade-in pointer-events-none">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.15)] border border-slate-100 pointer-events-auto max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="p-8 lg:p-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Receipt Details</h3>
                                    <p className="text-brand-600 font-bold text-xs uppercase tracking-widest mt-1">{selectedTransaction.transaction_number}</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
                                {/* Summary Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-2xl">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                                        <p className="font-bold text-slate-900 text-sm">{new Date(selectedTransaction.created_at + ' UTC').toLocaleString()}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Cashier</p>
                                        <p className="font-bold text-slate-900 text-sm">{selectedTransaction.cashier_name || 'System'}</p>
                                    </div>
                                    {selectedTransaction.customer_name && (
                                        <div className="bg-slate-50 p-4 rounded-2xl col-span-2">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer</p>
                                            <p className="font-bold text-slate-900 text-sm">{selectedTransaction.customer_name}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Items List */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Purchased Items</h4>
                                    <div className="space-y-3">
                                        {transactionItems.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-black text-slate-900 text-sm uppercase">{item.product_name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400">{item.weight_kg}kg × ₱{(item.subtotal / item.weight_kg).toFixed(2)}</p>
                                                </div>
                                                <span className="font-black text-slate-900">₱{item.subtotal.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Totals */}
                                <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-4">
                                    <div className="flex justify-between items-center text-slate-400">
                                        <span className="text-[10px] font-black uppercase tracking-widest">Subtotal</span>
                                        <span className="font-bold">₱{selectedTransaction.total_amount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-400">
                                        <span className="text-[10px] font-black uppercase tracking-widest">Received</span>
                                        <span className="font-bold">₱{selectedTransaction.payment_received.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-t border-white/10 pt-4">
                                        <span className="text-xs font-black uppercase tracking-widest">Total Change</span>
                                        <span className="text-2xl font-black text-brand-400">₱{selectedTransaction.change_amount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-4 border-t border-slate-50 flex gap-4">
                                <button 
                                    disabled={downloading}
                                    onClick={() => handleDownloadPDF(selectedTransaction)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    Download PDF
                                </button>
                                <button 
                                    onClick={() => handleReprint(selectedTransaction.id)}
                                    className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-brand-100 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                    Reprint Receipt
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transactions;