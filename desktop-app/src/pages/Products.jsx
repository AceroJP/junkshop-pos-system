import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        price_per_kg: '',
        image_path: ''
    });

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await window.electron.getProducts();
            setProducts(data || []);
        } catch (err) {
            console.error('Failed to load products', err);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.price_per_kg) return;
        
        setLoading(true);

        try {
            const result = await window.electron.saveProduct({
                ...formData,
                id: editingProduct ? editingProduct.id : null
            });
            if (result.success) {
                setIsModalOpen(false);
                setEditingProduct(null);
                setFormData({ name: '', price_per_kg: '', image_path: '' });
                loadProducts();
                Swal.fire({
                    title: 'Success!',
                    text: editingProduct ? 'Product updated successfully' : 'Product added successfully',
                    icon: 'success',
                    confirmButtonColor: '#0ea5e9'
                });
            }
        } catch (err) {
            Swal.fire('Error', 'Failed to save product', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price_per_kg: product.price_per_kg,
            image_path: product.image_path
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You want to delete this product?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            background: '#ffffff',
            customClass: {
                title: 'font-black uppercase tracking-tight',
                popup: 'rounded-[2rem]'
            }
        });

        if (result.isConfirmed) {
            try {
                const response = await window.electron.deleteProduct(id);
                if (response.success) {
                    loadProducts();
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'Product has been removed.',
                        icon: 'success',
                        confirmButtonColor: '#0ea5e9'
                    });
                }
            } catch (err) {
                Swal.fire('Error', 'Failed to delete product', 'error');
            }
        }
    };

    const toggleStatus = async (id) => {
        try {
            await window.electron.toggleProductStatus(id);
            loadProducts();
        } catch (err) {
            console.error('Failed to toggle status', err);
        }
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setFormData({ name: '', price_per_kg: '', image_path: '' });
        setIsModalOpen(true);
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (readerEvent) => {
                setFormData({ ...formData, image_path: readerEvent.target.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight leading-none">Inventory</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Manage items & pricing</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <div className="bg-white border-2 border-slate-100 h-14 w-full sm:w-64 rounded-2xl flex items-center px-4 gap-3 focus-within:ring-4 focus-within:ring-brand-500/10 focus-within:border-brand-500 transition-all">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input 
                            type="text" 
                            placeholder="Search inventory..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent outline-none text-sm font-bold w-full text-slate-900 placeholder:text-slate-400" 
                        />
                    </div>
                    <button 
                        onClick={openAddModal}
                        className="bg-brand-600 hover:bg-brand-700 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-brand-100 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-sm h-14"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                        Add Product
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <div className="bg-white p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2rem] border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Items</p>
                    <p className="text-2xl lg:text-3xl font-black text-slate-900">{products.length}</p>
                </div>
                <div className="bg-white p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2rem] border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Items</p>
                    <p className="text-2xl lg:text-3xl font-black text-emerald-600">{products.filter(p => p.is_active).length}</p>
                </div>
                <div className="bg-white p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2rem] border border-slate-100 shadow-sm sm:col-span-2 lg:col-span-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Inactive Items</p>
                    <p className="text-2xl lg:text-3xl font-black text-rose-500">{products.filter(p => !p.is_active).length}</p>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-[2rem] lg:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] lg:min-w-full">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 lg:px-10 py-4 lg:py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Item Details</th>
                                <th className="px-6 lg:px-10 py-4 lg:py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Price / kg</th>
                                <th className="px-6 lg:px-10 py-4 lg:py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-6 lg:px-10 py-4 lg:py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Management</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 lg:px-10 py-12 lg:py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-20">
                                            <svg className="w-12 h-12 lg:w-16 lg:h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                            <p className="font-black uppercase tracking-[0.3em] text-[10px] lg:text-xs">No matching items found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map(product => (
                                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 lg:px-10 py-4 lg:py-6">
                                            <div className="flex items-center gap-4 lg:gap-6">
                                                <div className="w-10 h-10 lg:w-14 lg:h-14 bg-slate-100 rounded-xl lg:rounded-2xl flex items-center justify-center text-slate-300 overflow-hidden shrink-0">
                                                    {product.image_path ? <img src={product.image_path} alt="" className="w-full h-full object-cover" /> : <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                                                </div>
                                                <span className="font-black text-slate-900 uppercase tracking-tight text-sm lg:text-lg truncate max-w-[150px] lg:max-w-none">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 lg:px-10 py-4 lg:py-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-brand-600 text-sm lg:text-lg">₱{product.price_per_kg.toFixed(2)}</span>
                                                <span className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest">per kg</span>
                                            </div>
                                        </td>
                                        <td className="px-6 lg:px-10 py-4 lg:py-6">
                                            <span className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg lg:rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 ${product.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                                                <span className={`w-1 lg:w-1.5 h-1 lg:h-1.5 rounded-full ${product.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                                {product.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 lg:px-10 py-4 lg:py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 lg:gap-3 transition-opacity">
                                                <button 
                                                    onClick={() => handleEdit(product)}
                                                    className="p-2 lg:p-3 bg-slate-100 text-slate-400 rounded-xl lg:rounded-2xl hover:bg-brand-50 hover:text-brand-600 transition-all active:scale-90"
                                                >
                                                    <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </button>
                                                <button 
                                                    onClick={() => toggleStatus(product.id)} 
                                                    title={product.is_active ? 'Deactivate' : 'Activate'} 
                                                    className={`p-2 lg:p-3 rounded-xl lg:rounded-2xl transition-all active:scale-90 ${product.is_active ? 'bg-emerald-50 text-emerald-400 hover:bg-emerald-500 hover:text-white' : 'bg-amber-50 text-amber-400 hover:bg-amber-500 hover:text-white'}`}
                                                >
                                                    <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 lg:p-3 bg-rose-50 text-rose-400 rounded-xl lg:rounded-2xl hover:bg-rose-500 hover:text-white transition-all active:scale-90"
                                                >
                                                    <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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

            {/* Add Product Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-10 animate-fade-in pointer-events-none">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.15)] border border-slate-100 pointer-events-auto max-h-[90vh] flex flex-col">
                        <div className="p-8 lg:p-10 overflow-y-auto">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            
                            <form onSubmit={handleSave} className="space-y-6">
                                {/* Photo Upload Section */}
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Photo</label>
                                    <div className="flex items-center gap-6">
                                        <div className="w-24 h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                            {formData.image_path ? (
                                                <img src={formData.image_path} className="w-full h-full object-cover" />
                                            ) : (
                                                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <input type="file" id="product-photo" onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                                            <label htmlFor="product-photo" className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 text-xs font-black uppercase tracking-widest rounded-xl cursor-pointer hover:bg-brand-100 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                Upload Photo
                                            </label>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase mt-2">JPG, PNG up to 1MB</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        autoFocus
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none font-bold text-slate-900"
                                        placeholder="e.g. Copper Wire"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Price per kg</label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300">₱</span>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            required
                                            value={formData.price_per_kg}
                                            onChange={e => setFormData({...formData, price_per_kg: e.target.value})}
                                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none font-bold text-slate-900"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-5 rounded-2xl transition-all uppercase tracking-widest text-sm">Cancel</button>
                                    <button type="submit" disabled={loading} className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-brand-100 transition-all uppercase tracking-widest text-sm">
                                        {loading ? 'Saving...' : 'Save Product'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
