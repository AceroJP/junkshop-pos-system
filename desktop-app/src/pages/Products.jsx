import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const Products = ({ openModal }) => {
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
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

    // Helper to keep modal in sync with form changes
    const syncModal = (currentEditingProduct, currentFormData, currentLoading) => {
        if (openModal) {
            openModal('product', {
                editingProduct: currentEditingProduct,
                formData: currentFormData,
                loading: currentLoading,
                setFormData: (updatedData) => {
                    const newData = typeof updatedData === 'function' ? updatedData(currentFormData) : updatedData;
                    setFormData(newData);
                    syncModal(currentEditingProduct, newData, currentLoading);
                },
                onSave: (e) => handleSave(e, currentEditingProduct, currentFormData),
                onPhotoUpload: (e) => handlePhotoUpload(e, currentEditingProduct, currentFormData)
            });
        }
    };

    const loadProducts = async () => {
        try {
            const data = await window.electron.getProducts();
            setProducts(data || []);
        } catch (err) {
            console.error('Failed to load products', err);
        }
    };

    const handleSave = async (e, currentEditingProduct, currentFormData) => {
        if (e) e.preventDefault();
        const activeFormData = currentFormData || formData;
        const activeEditingProduct = currentEditingProduct || editingProduct;

        if (!activeFormData.name || !activeFormData.price_per_kg) return;
        
        setLoading(true);
        syncModal(activeEditingProduct, activeFormData, true);

        try {
            const result = await window.electron.saveProduct({
                ...activeFormData,
                id: activeEditingProduct ? activeEditingProduct.id : null
            });
            if (result.success) {
                if (openModal) openModal(null);
                setEditingProduct(null);
                setFormData({ name: '', price_per_kg: '', image_path: '' });
                loadProducts();
                Swal.fire({
                    title: 'Success!',
                    text: activeEditingProduct ? 'Product updated successfully' : 'Product added successfully',
                    icon: 'success',
                    confirmButtonColor: '#0ea5e9'
                });
            }
        } catch (err) {
            Swal.fire('Error', 'Failed to save product', 'error');
            syncModal(activeEditingProduct, activeFormData, false);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        const data = {
            name: product.name,
            price_per_kg: product.price_per_kg,
            image_path: product.image_path
        };
        setEditingProduct(product);
        setFormData(data);
        syncModal(product, data, false);
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
        const emptyForm = { name: '', price_per_kg: '', image_path: '' };
        setFormData(emptyForm);
        syncModal(null, emptyForm, false);
    };

    const handlePhotoUpload = async (e, currentEditingProduct, currentFormData) => {
        const file = e.target.files[0];
        if (!file) return;

        const activeFormData = currentFormData || formData;
        const activeEditingProduct = currentEditingProduct || editingProduct;

        const reader = new FileReader();
        reader.onload = (event) => {
            const newData = { ...activeFormData, image_path: event.target.result };
            setFormData(newData);
            syncModal(activeEditingProduct, newData, loading);
        };
        reader.readAsDataURL(file);
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
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    <table className="w-full min-w-[800px] lg:min-w-full">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 lg:px-10 py-4 lg:py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Item Details</th>
                                <th className="px-6 lg:px-10 py-4 lg:py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Price / kg</th>
                                <th className="px-6 lg:px-10 py-4 lg:py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="sticky right-0 bg-slate-50 lg:bg-transparent px-6 lg:px-10 py-4 lg:py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] shadow-[-12px_0_15px_-3px_rgba(0,0,0,0.02)] lg:shadow-none">Management</th>
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
                                        <td className="sticky right-0 bg-white group-hover:bg-slate-50/50 px-6 lg:px-10 py-4 lg:py-6 text-right shadow-[-12px_0_15px_-3px_rgba(0,0,0,0.02)] lg:shadow-none transition-colors">
                                            <div className="flex items-center justify-end gap-2 lg:gap-3 transition-opacity">
                                                <button 
                                                    onClick={() => handleEdit(product)}
                                                    className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-brand-50 hover:text-brand-600 transition-all active:scale-95 whitespace-nowrap"
                                                    title="Edit Product"
                                                >
                                                    <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Edit</span>
                                                </button>
                                                <button 
                                                    onClick={() => toggleStatus(product.id)} 
                                                    title={product.is_active ? 'Deactivate' : 'Activate'} 
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all active:scale-95 whitespace-nowrap ${product.is_active ? 'bg-emerald-50 text-emerald-400 hover:bg-emerald-500 hover:text-white' : 'bg-amber-50 text-amber-400 hover:bg-amber-500 hover:text-white'}`}
                                                >
                                                    <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                                    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">{product.is_active ? 'Active' : 'Inactive'}</span>
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(product.id)}
                                                    className="flex items-center gap-2 px-3 py-2 bg-rose-50 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-95 whitespace-nowrap"
                                                    title="Delete Product"
                                                >
                                                    <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Delete</span>
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
    );
};

export default Products;
