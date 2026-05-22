import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const Sellers = ({ openModal }) => {
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all'); // 'all', 'balance'
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [sellerTransactions, setSellerTransactions] = useState([]);

    // Stats
    const totalSellers = sellers.length;
    const totalOutstanding = sellers.reduce((sum, s) => sum + s.total_balance_owed, 0);
    const sellersWithBalance = sellers.filter(s => s.total_balance_owed > 0).length;

    useEffect(() => {
        loadSellers();
    }, [searchQuery, filter]);

    const [payments, setPayments] = useState([]);

    const loadSellers = async () => {
        setLoading(true);
        try {
            const data = await window.electron.getSellers({ search: searchQuery, filter });
            setSellers(data);
        } catch (err) {
            console.error('Failed to load sellers', err);
        } finally {
            setLoading(false);
        }
    };

    const viewSellerDetails = async (seller) => {
        try {
            const txns = await window.electron.getSellerTransactions(seller.id);
            const pmts = await window.electron.getPayments(seller.id);
            setSelectedSeller(seller);
            setSellerTransactions(txns);
            setPayments(pmts);
        } catch (err) {
            Swal.fire('Error', 'Failed to load seller history', 'error');
        }
    };

    const handlePrintStatement = async () => {
        if (!selectedSeller) return;
        try {
            const result = await window.electron.printStatement(selectedSeller.id);
            if (result.success) {
                Swal.fire({
                    title: 'Printing Statement...',
                    text: 'The statement has been sent to your printer.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: { popup: 'rounded-[2rem]' }
                });
            } else {
                Swal.fire('Printer Error', result.error, 'error');
            }
        } catch (err) {
            Swal.fire('Error', 'Failed to print statement', 'error');
        }
    };

    const handleRecordPayment = (seller) => {
        let paymentAmount = seller.total_balance_owed;
        let notes = '';

        Swal.fire({
            title: 'Record Payment',
            html: `
                <div class="text-left space-y-4 p-2">
                    <div>
                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Seller Name</label>
                        <p class="font-black text-slate-900">${seller.name}</p>
                    </div>
                    <div>
                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Balance Owed</label>
                        <p class="text-2xl font-black text-rose-600">₱${seller.total_balance_owed.toFixed(2)}</p>
                    </div>
                    <div class="space-y-2">
                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount to Pay</label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-300">₱</span>
                            <input type="number" id="swal-payment-amount" class="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none font-bold text-slate-900 focus:border-brand-500" value="${paymentAmount}" step="0.01">
                        </div>
                    </div>
                    <div class="space-y-2">
                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes (Optional)</label>
                        <textarea id="swal-payment-notes" class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none font-bold text-slate-900 focus:border-brand-500 min-h-[80px]" placeholder="e.g. Paid in full via cash"></textarea>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'CONFIRM PAYMENT',
            confirmButtonColor: '#16a34a',
            cancelButtonColor: '#64748b',
            customClass: {
                popup: 'rounded-[2.5rem]',
                title: 'font-black uppercase tracking-tight',
                confirmButton: 'rounded-xl font-bold uppercase tracking-widest text-xs px-8 py-4',
                cancelButton: 'rounded-xl font-bold uppercase tracking-widest text-xs px-8 py-4'
            },
            preConfirm: () => {
                const amount = parseFloat(document.getElementById('swal-payment-amount').value);
                const notes = document.getElementById('swal-payment-notes').value;
                if (isNaN(amount) || amount <= 0 || amount > seller.total_balance_owed) {
                    Swal.showValidationMessage('Please enter a valid amount up to ' + seller.total_balance_owed.toFixed(2));
                    return false;
                }
                return { amount, notes };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await window.electron.recordPayment({
                        seller_id: seller.id,
                        amount: result.value.amount,
                        notes: result.value.notes
                    });

                    if (response.success) {
                        Swal.fire({
                            title: 'Payment Recorded!',
                            text: `Successfully paid ₱${result.value.amount.toFixed(2)} to ${seller.name}`,
                            icon: 'success',
                            confirmButtonColor: '#0ea5e9',
                            customClass: { popup: 'rounded-[2rem]' }
                        });
                        loadSellers();
                        if (selectedSeller && selectedSeller.id === seller.id) {
                            viewSellerDetails({ ...seller, total_balance_owed: seller.total_balance_owed - result.value.amount });
                        }
                    } else {
                        let errorMessage = response.error || 'Something went wrong while recording payment.';
                        if (response.error && response.error.includes('Printer driver error')) {
                            errorMessage = 'Payment recorded, but receipt printing failed. Please check your printer connection.';
                        }
                        
                        Swal.fire({
                            title: 'Warning',
                            text: errorMessage,
                            icon: response.error && response.error.includes('Printer driver error') ? 'warning' : 'error',
                            confirmButtonColor: '#0ea5e9',
                            customClass: { popup: 'rounded-[2rem]' }
                        });
                        
                        // Still reload if payment was successful but printer failed
                        if (response.error && response.error.includes('Printer driver error')) {
                            loadSellers();
                        }
                    }
                } catch (err) {
                    Swal.fire('Error', 'Failed to record payment', 'error');
                }
            }
        });
    };

    const handleUpdateInfo = (seller) => {
        Swal.fire({
            title: 'Update Seller Info',
            html: `
                <div class="text-left space-y-4 p-2">
                    <div class="space-y-2">
                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Number</label>
                        <input type="text" id="swal-seller-phone" class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none font-bold text-slate-900 focus:border-brand-500" value="${seller.contact_number || ''}" placeholder="e.g. 09123456789">
                    </div>
                    <div class="space-y-2">
                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</label>
                        <textarea id="swal-seller-address" class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none font-bold text-slate-900 focus:border-brand-500 min-h-[80px]" placeholder="e.g. Brgy. 1, City Name">${seller.address || ''}</textarea>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'SAVE CHANGES',
            confirmButtonColor: '#0ea5e9',
            cancelButtonColor: '#64748b',
            customClass: {
                popup: 'rounded-[2.5rem]',
                title: 'font-black uppercase tracking-tight',
                confirmButton: 'rounded-xl font-bold uppercase tracking-widest text-xs px-8 py-4',
                cancelButton: 'rounded-xl font-bold uppercase tracking-widest text-xs px-8 py-4'
            },
            preConfirm: () => {
                return {
                    contact_number: document.getElementById('swal-seller-phone').value,
                    address: document.getElementById('swal-seller-address').value
                };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await window.electron.updateSellerInfo({
                        id: seller.id,
                        ...result.value
                    });
                    loadSellers();
                    if (selectedSeller && selectedSeller.id === seller.id) {
                        setSelectedSeller({ ...selectedSeller, ...result.value });
                    }
                } catch (err) {
                    Swal.fire('Error', 'Failed to update seller info', 'error');
                }
            }
        });
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20">
            {/* Header & Stats */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight leading-none">Credit Tracker</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Manage seller balances and payments</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Sellers</p>
                        <p className="text-2xl font-black text-slate-900">{totalSellers}</p>
                    </div>
                    <div className="bg-rose-50 p-6 rounded-[2rem] shadow-sm border border-rose-100 space-y-2">
                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Total Owed</p>
                        <p className="text-2xl font-black text-rose-600">₱{totalOutstanding.toFixed(2)}</p>
                    </div>
                    <div className="bg-amber-50 p-6 rounded-[2rem] shadow-sm border border-amber-100 space-y-2 hidden sm:block">
                        <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Unpaid Sellers</p>
                        <p className="text-2xl font-black text-amber-600">{sellersWithBalance}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Side: Sellers List */}
                <div className={`${selectedSeller ? 'lg:col-span-5' : 'lg:col-span-12'} space-y-6 transition-all duration-500`}>
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="bg-white border-2 border-slate-100 h-14 flex-1 rounded-2xl flex items-center px-4 gap-3 focus-within:ring-4 focus-within:ring-brand-500/10 focus-within:border-brand-500 transition-all w-full">
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input 
                                type="text" 
                                placeholder="Find seller..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent outline-none text-sm font-bold w-full text-slate-900 placeholder:text-slate-400" 
                            />
                        </div>
                        <div className="flex bg-white p-1 rounded-2xl border-2 border-slate-100 shrink-0">
                            <button onClick={() => setFilter('all')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>With Balance</button>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                            <table className="w-full text-left min-w-[500px] lg:min-w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Seller Name</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance Owed</th>
                                        <th className="sticky right-0 bg-slate-50 lg:bg-transparent px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right shadow-[-12px_0_15px_-3px_rgba(0,0,0,0.02)] lg:shadow-none">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        <tr><td colSpan="3" className="px-8 py-20 text-center text-slate-400 font-bold animate-pulse uppercase tracking-[0.3em]">Loading Sellers...</td></tr>
                                    ) : sellers.length === 0 ? (
                                        <tr><td colSpan="3" className="px-8 py-20 text-center text-slate-300 font-bold italic uppercase tracking-widest">No sellers found</td></tr>
                                    ) : (
                                        sellers.map((seller) => (
                                            <tr 
                                                key={seller.id} 
                                                onClick={() => viewSellerDetails(seller)}
                                                className={`group cursor-pointer transition-colors ${selectedSeller?.id === seller.id ? 'bg-brand-50/50' : 'hover:bg-slate-50'}`}
                                            >
                                                <td className="px-8 py-5">
                                                    <p className="font-black text-slate-900 uppercase">{seller.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Last: {seller.last_transaction_date ? new Date(seller.last_transaction_date).toLocaleDateString() : 'Never'}</p>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={`text-sm font-black ${seller.total_balance_owed > 0 ? 'text-rose-600' : 'text-slate-300'}`}>
                                                        ₱{seller.total_balance_owed.toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className="sticky right-0 bg-white group-hover:bg-slate-50/50 group-[.bg-brand-50\/50]:bg-brand-50/50 px-8 py-5 text-right shadow-[-12px_0_15px_-3px_rgba(0,0,0,0.02)] lg:shadow-none transition-colors">
                                                    <div className="flex items-center justify-end gap-2 transition-opacity">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleRecordPayment(seller); }}
                                                            className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all group/btn"
                                                            title="Record Payment"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                                            <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap hidden sm:inline">Pay</span>
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleUpdateInfo(seller); }}
                                                            className="flex items-center gap-2 px-3 py-2 bg-brand-50 text-brand-600 rounded-xl hover:bg-brand-600 hover:text-white transition-all group/btn"
                                                            title="Edit Info"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                            <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap hidden sm:inline">Edit</span>
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
                </div>

                {/* Right Side: Detail View */}
                {selectedSeller && (
                    <div className="lg:col-span-7 space-y-6 animate-slide-up">
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col min-h-[600px]">
                            {/* Seller Profile Header */}
                            <div className="p-8 lg:p-10 bg-slate-900 text-white relative">
                                <button onClick={() => setSelectedSeller(null)} className="absolute right-8 top-8 text-slate-400 hover:text-white transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                                
                                <div className="flex items-start gap-8">
                                    <div className="w-24 h-24 bg-brand-600 rounded-3xl flex items-center justify-center text-4xl font-black shrink-0 shadow-2xl shadow-brand-900/50">
                                        {selectedSeller.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="space-y-4 pt-2">
                                        <div>
                                            <h3 className="text-3xl font-black uppercase tracking-tight">{selectedSeller.name}</h3>
                                            <div className="flex items-center gap-4 mt-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                                <span className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>{selectedSeller.contact_number || 'No Phone'}</span>
                                                <span className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>{selectedSeller.address || 'No Address'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => handleRecordPayment(selectedSeller)} 
                                                disabled={selectedSeller.total_balance_owed <= 0}
                                                className={`px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all active:scale-95 ${
                                                    selectedSeller.total_balance_owed <= 0 
                                                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/50'
                                                }`}
                                            >
                                                {selectedSeller.total_balance_owed <= 0 ? 'Fully Paid' : 'Record Payment'}
                                            </button>
                                            <button onClick={handlePrintStatement} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-900/50 transition-all">Print Statement</button>
                                            <button onClick={() => handleUpdateInfo(selectedSeller)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all">Edit Info</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Balance Owed</p>
                                        <p className="text-2xl font-black text-rose-500">₱{selectedSeller.total_balance_owed.toFixed(2)}</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Transactions</p>
                                        <p className="text-2xl font-black text-slate-300">{sellerTransactions.length}</p>
                                    </div>
                                </div>
                            </div>

                            {/* History Table */}
                            <div className="flex-1 p-8 lg:p-10 space-y-6 overflow-y-auto custom-scrollbar">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Transaction History</h4>
                                <div className="space-y-4">
                                    {sellerTransactions.length === 0 ? (
                                        <div className="py-20 text-center text-slate-300 font-bold italic uppercase tracking-widest">No history found</div>
                                    ) : (
                                        sellerTransactions.map((txn) => (
                                            <div key={txn.id} className="group bg-slate-50 rounded-2xl p-5 flex items-center justify-between hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(txn.created_at).toLocaleString()}</p>
                                                    <p className="font-black text-slate-900 uppercase tracking-tight">{txn.transaction_number}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                                                            txn.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 
                                                            txn.status === 'unpaid' ? 'bg-rose-100 text-rose-600' : 
                                                            'bg-amber-100 text-amber-600'
                                                        }`}>
                                                            {txn.status === 'completed' ? 'Paid' : 
                                                             txn.status === 'unpaid' ? 'Unpaid' : 
                                                             'Partial'}
                                                        </span>
                                                        {txn.paid_at && <span className="text-[8px] font-bold text-slate-400 uppercase italic">Last Payment: {new Date(txn.paid_at).toLocaleDateString()}</span>}
                                                    </div>
                                                </div>
                                                <div className="text-right space-y-1">
                                                    <p className="text-lg font-black text-slate-900 tracking-tight">₱{txn.total_amount.toFixed(2)}</p>
                                                    {txn.status !== 'completed' && (
                                                        <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">
                                                            Remaining: ₱{(txn.total_amount - (txn.paid_amount || 0)).toFixed(2)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sellers;
