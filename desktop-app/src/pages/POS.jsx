import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const POS = ({ user, openModal }) => {
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [weight, setWeight] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [loading, setLoading] = useState(false);

    // Cashier selection
    const [availableCashiers, setAvailableCashiers] = useState([]);
    const [selectedCashier, setSelectedCashier] = useState('');

    useEffect(() => {
        loadProducts();
        loadCashiers();
    }, []);

    const loadCashiers = async () => {
        try {
            const settings = await window.electron.getSettings();
            const cashierList = settings.cashiers ? JSON.parse(settings.cashiers) : [];
            setAvailableCashiers(cashierList);
            // Default is the owner name (from user prop)
            setSelectedCashier(user.full_name);
        } catch (err) {
            console.error('Failed to load cashiers', err);
            setSelectedCashier(user.full_name);
        }
    };

    const loadProducts = async () => {
        const data = await window.electron.getProducts();
        setProducts(data);
    };

    const addToCart = (product) => {
        setWeight('');
        setSelectedProduct(product);
        if (openModal) {
            openModal('weight', {
                product: product,
                weight: '',
                setWeight: (val) => {
                    setWeight(val);
                    // We need to keep the modal data in sync with the weight state
                    // We'll use a local variable to ensure we have the latest value
                    openModal('weight', {
                        product: product,
                        weight: val,
                        setWeight: (newVal) => {
                            setWeight(newVal);
                            // Recursively update to keep sync
                            // This is a bit hacky but ensures the modal stays open and synced
                            updateWeightInModal(product, newVal);
                        },
                        onConfirm: () => confirmAddToCart(product, val)
                    });
                },
                onConfirm: () => confirmAddToCart(product, '')
            });
        }
    };

    // Helper to keep weight synced without closing/reopening
    const updateWeightInModal = (product, currentWeight) => {
        if (openModal) {
            openModal('weight', {
                product: product,
                weight: currentWeight,
                setWeight: (val) => {
                    setWeight(val);
                    updateWeightInModal(product, val);
                },
                onConfirm: () => confirmAddToCart(product, currentWeight)
            });
        }
    };

    const confirmAddToCart = (product, currentWeight) => {
        const w = parseFloat(currentWeight);
        if (isNaN(w) || w <= 0) {
            Swal.fire({
                title: 'Invalid Weight',
                text: 'Please enter a valid weight greater than 0.',
                icon: 'warning',
                confirmButtonColor: '#0ea5e9',
                customClass: { popup: 'rounded-[2rem]' }
            });
            return;
        }

        const newItem = {
            id: product.id,
            name: product.name,
            price_per_kg: product.price_per_kg,
            weight: w,
            subtotal: product.price_per_kg * w
        };

        setCart(prevCart => [...prevCart, newItem]);
        setSelectedProduct(null);
        setWeight('');
        if (openModal) openModal(null);
    };

    const removeFromCart = (index) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);

    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openCheckoutModal = () => {
        if (openModal) {
            openModal('checkout', {
                totalAmount,
                loading: false,
                onCheckout: (status) => handleCheckout(status)
            });
        }
    };

    const handleCheckout = async (status) => {
        // Validation: Customer Name is REQUIRED for Pay Later (unpaid)
        if (status === 'unpaid' && !customerName.trim()) {
            Swal.fire({
                title: 'Seller Name Required',
                text: 'Please enter the seller name to record this as a credit transaction.',
                icon: 'warning',
                confirmButtonColor: '#0ea5e9',
                customClass: {
                    popup: 'rounded-[2rem]',
                    title: 'font-black uppercase tracking-tight'
                }
            });
            return;
        }

        setLoading(true);
        // Update modal state to show loading
        if (openModal) {
            openModal('checkout', {
                totalAmount,
                loading: true,
                onCheckout: (status) => handleCheckout(status)
            });
        }

        try {
            const result = await window.electron.saveTransaction({
                total_amount: totalAmount,
                payment_received: status === 'unpaid' ? 0 : totalAmount,
                change_amount: 0,
                items: cart,
                cashier_id: user.id,
                cashier_name: selectedCashier || user.full_name, // Store the selected cashier name
                customer_name: customerName.trim() || null,
                status: status // 'completed' or 'unpaid'
            });

            if (result.success) {
                const isUnpaid = status === 'unpaid';
                Swal.fire({
                    title: isUnpaid ? 'Credit Recorded!' : 'Payout Successful!',
                    html: `<div class="text-left space-y-2">
                        <p class="text-xl font-black text-center mb-4">${isUnpaid ? 'Owed' : 'Total Paid'}: <span class="text-brand-600">₱${totalAmount.toFixed(2)}</span></p>
                        ${customerName ? `<p class="text-sm text-slate-600 text-center font-bold">Seller: ${customerName}</p>` : ''}
                        <p class="text-xs text-slate-400 text-center uppercase tracking-widest">${isUnpaid ? 'Credit Receipt generated' : 'Receipt has been sent to printer'}</p>
                    </div>`,
                    icon: isUnpaid ? 'info' : 'success',
                    confirmButtonColor: '#0ea5e9',
                    confirmButtonText: 'DONE',
                    customClass: {
                        title: 'font-black uppercase tracking-tight',
                        popup: 'rounded-[2rem]'
                    }
                });
                setCart([]);
                setCustomerName('');
                if (openModal) openModal(null);
            } else {
                Swal.fire('Error', 'Error saving transaction: ' + result.error, 'error');
                if (openModal) {
                    openModal('checkout', {
                        totalAmount,
                        loading: false,
                        onCheckout: (status) => handleCheckout(status)
                    });
                }
            }
        } catch (err) {
            Swal.fire('Error', 'Checkout failed', 'error');
            if (openModal) {
                openModal('checkout', {
                    totalAmount,
                    loading: false,
                    onCheckout: (status) => handleCheckout(status)
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-row h-full gap-4 lg:gap-8 pb-4 lg:pb-0">
            {/* Product Grid */}
            <div className="flex-1 min-w-0 space-y-4 lg:space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 lg:gap-6">
                    <div className="space-y-1">
                        <h2 className="text-2xl lg:text-4xl font-black text-slate-900 uppercase tracking-tight leading-none">We Buy</h2>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[8px] lg:text-[10px]">Select items to add to order</p>
                    </div>
                    
                    <div className="bg-white border-2 border-slate-100 h-10 lg:h-14 w-full sm:w-64 lg:w-80 rounded-2xl flex items-center px-4 gap-3 focus-within:ring-4 focus-within:ring-brand-500/10 focus-within:border-brand-500 transition-all">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent outline-none text-xs font-bold w-full text-slate-900 placeholder:text-slate-400" 
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 lg:gap-4">
                    {filteredProducts.length === 0 ? (
                        <div className="col-span-full py-12 lg:py-20 text-center">
                            <div className="flex flex-col items-center gap-4 opacity-20">
                                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                <p className="font-black uppercase tracking-[0.3em] text-xs">No matching products</p>
                            </div>
                        </div>
                    ) : (
                        filteredProducts.map(product => (
                        <button 
                            key={product.id}
                            onClick={() => addToCart(product)}
                            className={`bg-white p-2 lg:p-4 rounded-xl lg:rounded-[1.5rem] border-2 transition-all text-left group ${product.is_active ? 'border-slate-100 hover:border-brand-500 hover:shadow-xl hover:shadow-brand-100' : 'opacity-50 grayscale border-slate-50 cursor-not-allowed'}`}
                            disabled={!product.is_active}
                        >
                            <div className="w-full aspect-square bg-slate-50 rounded-lg lg:rounded-2xl mb-1.5 lg:mb-3 flex items-center justify-center text-slate-200 group-hover:bg-brand-50 group-hover:text-brand-200 transition-colors">
                                {product.image_path ? (
                                    <img src={product.image_path} alt={product.name} className="w-full h-full object-cover rounded-lg lg:rounded-2xl" />
                                ) : (
                                    <svg className="w-6 h-6 lg:w-10 lg:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                )}
                            </div>
                            <h3 className="font-black text-slate-900 uppercase tracking-tight text-[9px] lg:text-xs mb-0.5 truncate">{product.name}</h3>
                            <p className="text-brand-600 font-black text-[10px] lg:text-sm">₱{product.price_per_kg.toFixed(2)}<span className="text-[7px] lg:text-[10px] text-slate-400 lowercase font-bold ml-0.5">/kg</span></p>
                        </button>
                    )))}
                </div>
            </div>

            {/* Cart Sidebar */}
            <div className="w-64 sm:w-72 lg:w-80 xl:w-96 bg-white rounded-[1.5rem] lg:rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden shrink-0">
                {/* Cashier Selection */}
                <div className="px-4 lg:px-8 py-3 lg:py-6 bg-slate-900 border-b border-white/5">
                    <div className="space-y-1 lg:space-y-3">
                        <label className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operating Cashier</label>
                        <div className="relative">
                            <select 
                                value={selectedCashier}
                                onChange={(e) => setSelectedCashier(e.target.value)}
                                className="w-full bg-white/10 border border-white/10 rounded-lg lg:rounded-xl px-3 lg:px-4 py-1.5 lg:py-2 text-[11px] lg:text-sm font-bold text-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value={user.full_name}>{user.full_name} (Owner)</option>
                                {availableCashiers.map((name, idx) => (
                                    <option key={idx} value={name} className="text-slate-900">{name}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 lg:right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seller Information (Optional) */}
                <div className="px-4 lg:px-8 py-3 lg:py-6 bg-slate-50 border-b border-slate-100">
                    <div className="space-y-1 lg:space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Seller Information</label>
                            <span className="text-[8px] font-bold text-slate-400 italic">Optional</span>
                        </div>
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Name" 
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && cart.length > 0) {
                                        e.preventDefault();
                                        openCheckoutModal();
                                    }
                                }}
                                className="w-full bg-white border border-slate-200 rounded-lg lg:rounded-xl px-3 lg:px-4 py-1.5 lg:py-2 text-[11px] lg:text-sm font-bold text-slate-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 outline-none transition-all placeholder:text-slate-300"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4 lg:p-8 border-b border-slate-50">
                    <h2 className="text-sm lg:text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 lg:gap-3">
                        <svg className="w-4 h-4 lg:w-6 lg:h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        Order
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-3 lg:space-y-4">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 opacity-50">
                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                            <p className="font-bold uppercase tracking-widest text-xs italic text-center">Your cart is empty<br/>Add items to begin</p>
                        </div>
                    ) : (
                        cart.map((item, index) => (
                            <div key={index} className="flex items-center justify-between group animate-fade-in">
                                <div className="space-y-1">
                                    <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight">{item.name}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.weight}kg × ₱{item.price_per_kg}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-black text-slate-900 text-sm">₱{item.subtotal.toFixed(2)}</span>
                                    <button 
                                        onClick={() => removeFromCart(index)}
                                        className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center transition-all hover:bg-rose-500 hover:text-white"
                                        title="Remove Item"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 lg:p-8 bg-slate-900 text-white space-y-4 lg:space-y-6">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px] lg:text-xs">Total Amount</span>
                        <span className="text-2xl lg:text-3xl font-black">₱{totalAmount.toFixed(2)}</span>
                    </div>
                    <button 
                        disabled={cart.length === 0}
                        onClick={openCheckoutModal}
                        className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-slate-700 text-white font-black py-4 lg:py-5 rounded-2xl shadow-xl shadow-brand-900/50 transition-all hover:-translate-y-1 active:scale-95 text-base lg:text-lg uppercase tracking-widest"
                    >
                        Checkout Order
                    </button>
                </div>
            </div>
        </div>
    );
};

export default POS;
