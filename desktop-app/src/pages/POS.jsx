import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const POS = ({ user }) => {
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [weight, setWeight] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        const data = await window.electron.getProducts();
        setProducts(data);
    };

    const addToCart = (product) => {
        setSelectedProduct(product);
        setWeight('');
    };

    const confirmAddToCart = () => {
        const w = parseFloat(weight);
        if (isNaN(w) || w <= 0) return;

        const newItem = {
            id: selectedProduct.id,
            name: selectedProduct.name,
            price_per_kg: selectedProduct.price_per_kg,
            weight: w,
            subtotal: selectedProduct.price_per_kg * w
        };

        setCart([...cart, newItem]);
        setSelectedProduct(null);
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

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const result = await window.electron.saveTransaction({
                total_amount: totalAmount,
                payment_received: totalAmount, // For a junkshop, we pay exactly the total
                change_amount: 0,
                items: cart,
                cashier_id: user.id,
                customer_name: customerName.trim() || null
            });

            if (result.success) {
                Swal.fire({
                    title: 'Payout Successful!',
                    html: `<div class="text-left space-y-2">
                        <p class="text-xl font-black text-center mb-4">Total Paid: <span class="text-brand-600">₱${totalAmount.toFixed(2)}</span></p>
                        ${customerName ? `<p class="text-sm text-slate-600 text-center font-bold">Seller: ${customerName}</p>` : ''}
                        <p class="text-xs text-slate-400 text-center uppercase tracking-widest">Receipt has been sent to printer</p>
                    </div>`,
                    icon: 'success',
                    confirmButtonColor: '#0ea5e9',
                    confirmButtonText: 'DONE',
                    customClass: {
                        title: 'font-black uppercase tracking-tight',
                        popup: 'rounded-[2rem]'
                    }
                });
                setCart([]);
                setCustomerName('');
                setIsCheckoutModalOpen(false);
            } else {
                Swal.fire('Error', 'Error saving transaction: ' + result.error, 'error');
            }
        } catch (err) {
            Swal.fire('Error', 'Checkout failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col xl:flex-row h-full gap-8 pb-12 xl:pb-0">
            {/* Product Grid */}
            <div className="flex-1 space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Available Items</h2>
                    <div className="bg-slate-200 h-10 w-full sm:w-64 rounded-xl flex items-center px-4 gap-3 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input 
                            type="text" 
                            placeholder="Search products..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent outline-none text-sm font-bold w-full text-slate-900 placeholder:text-slate-400" 
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 2xl:grid-cols-4 gap-4 lg:gap-6">
                    {filteredProducts.length === 0 ? (
                        <div className="col-span-full py-20 text-center">
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
                            className={`bg-white p-4 lg:p-6 rounded-[1.5rem] lg:rounded-[2rem] border-2 transition-all text-left group ${product.is_active ? 'border-slate-100 hover:border-brand-500 hover:shadow-xl hover:shadow-brand-100' : 'opacity-50 grayscale border-slate-50 cursor-not-allowed'}`}
                            disabled={!product.is_active}
                        >
                            <div className="w-full aspect-square bg-slate-50 rounded-xl lg:rounded-2xl mb-3 lg:mb-4 flex items-center justify-center text-slate-200 group-hover:bg-brand-50 group-hover:text-brand-200 transition-colors">
                                {product.image_path ? (
                                    <img src={product.image_path} alt={product.name} className="w-full h-full object-cover rounded-xl lg:rounded-2xl" />
                                ) : (
                                    <svg className="w-10 h-10 lg:w-12 lg:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                )}
                            </div>
                            <h3 className="font-black text-slate-900 uppercase tracking-tight text-xs lg:text-sm mb-1 truncate">{product.name}</h3>
                            <p className="text-brand-600 font-black text-sm lg:text-base">₱{product.price_per_kg.toFixed(2)}<span className="text-[10px] text-slate-400 lowercase font-bold ml-1">/kg</span></p>
                        </button>
                    )))}
                </div>
            </div>

            {/* Cart Sidebar */}
            <div className="w-full xl:w-96 bg-white rounded-[2rem] lg:rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden shrink-0 h-[600px] xl:h-auto">
                {/* Seller Information (Optional) */}
                <div className="px-6 lg:px-8 py-6 bg-slate-50 border-b border-slate-100">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Seller Information</label>
                            <span className="text-[9px] font-bold text-slate-400 italic">Optional</span>
                        </div>
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Customer Name" 
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 outline-none transition-all"
                            />
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Leave blank for walk-in customers</p>
                    </div>
                </div>

                <div className="p-6 lg:p-8 border-b border-slate-50">
                    <h2 className="text-lg lg:text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                        <svg className="w-5 h-5 lg:w-6 lg:h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        Current Order
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-4">
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
                                        className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 hover:text-white"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-8 bg-slate-900 text-white space-y-6">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Total Amount</span>
                        <span className="text-3xl font-black">₱{totalAmount.toFixed(2)}</span>
                    </div>
                    <button 
                        disabled={cart.length === 0}
                        onClick={() => setIsCheckoutModalOpen(true)}
                        className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-slate-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-brand-900/50 transition-all hover:-translate-y-1 active:scale-95 text-lg uppercase tracking-widest"
                    >
                        Checkout Order
                    </button>
                </div>
            </div>

            {/* Weight Input Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-20 animate-fade-in pointer-events-none">
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.15)] border border-slate-100 pointer-events-auto max-h-[90vh] flex flex-col">
                        <div className="p-10 overflow-y-auto">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Enter Weight</h3>
                                <button onClick={() => setSelectedProduct(null)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <p className="text-slate-500 font-bold text-sm mb-8 uppercase tracking-widest">Item: <span className="text-brand-600">{selectedProduct.name}</span></p>
                            
                            <div className="space-y-6">
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        autoFocus
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none font-black text-2xl text-center"
                                    />
                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-300 uppercase tracking-widest">kg</span>
                                </div>

                                <div className="flex gap-4">
                                    <button onClick={() => setSelectedProduct(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-4 rounded-2xl transition-all uppercase tracking-widest">Cancel</button>
                                    <button onClick={confirmAddToCart} className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-brand-100 transition-all uppercase tracking-widest">Confirm</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Checkout Modal */}
            {isCheckoutModalOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-20 animate-fade-in pointer-events-none">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.15)] border border-slate-100 pointer-events-auto max-h-[90vh] flex flex-col">
                        <div className="bg-slate-900 p-8 text-white shrink-0">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black uppercase tracking-tight">Confirm Payout</h3>
                                <button onClick={() => setIsCheckoutModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <div className="flex items-center justify-between mt-6">
                                <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Total Payout</span>
                                <span className="text-3xl font-black text-emerald-400">₱{totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                        
                        <div className="p-10 space-y-8 text-center">
                            <div className="space-y-4">
                                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Ready to Pay</h4>
                                    <p className="text-slate-500 font-bold text-sm mt-1 uppercase tracking-widest">Verify weights before confirming</p>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    disabled={loading}
                                    onClick={() => setIsCheckoutModalOpen(false)} 
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-4 rounded-2xl transition-all uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button 
                                    disabled={loading || totalAmount <= 0}
                                    onClick={handleCheckout} 
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-100 transition-all uppercase tracking-widest"
                                >
                                    {loading ? 'Processing...' : 'Confirm Payout'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default POS;
