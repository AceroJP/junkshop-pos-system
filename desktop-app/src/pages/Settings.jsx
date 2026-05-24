import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const Settings = ({ shopSettings, onSettingsUpdate }) => {
    const [printers, setPrinters] = useState([]);
    const [loadingPrinters, setLoadingPrinters] = useState(false);
    const [selectedPrinter, setSelectedPrinter] = useState(shopSettings.printer_name || '');
    const [printerType, setPrinterType] = useState(shopSettings.printer_type || 'EPSON');
    const [saving, setSaving] = useState(false);

    // Shop Details State
    const [shopName, setShopName] = useState(shopSettings.shop_name || '');
    const [shopLogo, setShopLogo] = useState(shopSettings.shop_logo || '');

    // Cashier Management State
    const [cashiers, setCashiers] = useState([]);
    const [newCashier, setNewCashier] = useState('');

    useEffect(() => {
        loadPrinters();
        loadCashiers();
    }, []);

    const loadCashiers = async () => {
        try {
            const settings = await window.electron.getSettings();
            const cashierList = settings.cashiers ? JSON.parse(settings.cashiers) : [];
            setCashiers(cashierList);
        } catch (err) {
            console.error('Failed to load cashiers', err);
        }
    };

    const handleAddCashier = async () => {
        if (!newCashier.trim()) return;
        const updatedList = [...cashiers, newCashier.trim()];
        try {
            await window.electron.saveSetting('cashiers', JSON.stringify(updatedList));
            setCashiers(updatedList);
            setNewCashier('');
            if (onSettingsUpdate) onSettingsUpdate();
        } catch (err) {
            Swal.fire('Error', 'Failed to add cashier', 'error');
        }
    };

    const handleRemoveCashier = async (index) => {
        const updatedList = cashiers.filter((_, i) => i !== index);
        try {
            await window.electron.saveSetting('cashiers', JSON.stringify(updatedList));
            setCashiers(updatedList);
            if (onSettingsUpdate) onSettingsUpdate();
        } catch (err) {
            Swal.fire('Error', 'Failed to remove cashier', 'error');
        }
    };

    const loadPrinters = async () => {
        setLoadingPrinters(true);
        try {
            const systemPrinters = await window.electron.getPrinters();
            setPrinters(systemPrinters);
        } catch (err) {
            console.error('Failed to load printers', err);
        } finally {
            setLoadingPrinters(false);
        }
    };

    const handleSavePrinter = async () => {
        setSaving(true);
        try {
            await window.electron.saveSetting('printer_name', selectedPrinter);
            await window.electron.saveSetting('printer_type', printerType);
            
            await Swal.fire({
                title: 'Printer Settings Saved',
                text: 'Printer configuration has been updated.',
                icon: 'success',
                confirmButtonColor: '#0ea5e9',
                customClass: { popup: 'rounded-[2rem]' }
            });
            
            if (onSettingsUpdate) onSettingsUpdate();
        } catch (err) {
            Swal.fire('Error', 'Failed to save printer settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveShopDetails = async () => {
        setSaving(true);
        try {
            await window.electron.saveSetting('shop_name', shopName);
            await window.electron.saveSetting('shop_logo', shopLogo);
            
            await Swal.fire({
                title: 'Shop Details Saved',
                text: 'Your shop information has been updated.',
                icon: 'success',
                confirmButtonColor: '#0ea5e9',
                customClass: { popup: 'rounded-[2rem]' }
            });
            
            if (onSettingsUpdate) onSettingsUpdate();
        } catch (err) {
            Swal.fire('Error', 'Failed to save shop details', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setShopLogo(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const testPrint = async () => {
        if (!selectedPrinter) {
            Swal.fire('Wait!', 'Please select a printer first', 'info');
            return;
        }

        try {
            const result = await window.electron.reprintReceipt(null); // Passing null to trigger a test print if supported
            if (result.success) {
                Swal.fire('Success', 'Test print sent!', 'success');
            } else {
                Swal.fire('Error', result.error || 'Print failed', 'error');
            }
        } catch (err) {
            Swal.fire('Error', 'An unexpected error occurred', 'error');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-20">
            <div className="space-y-1">
                <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight leading-none">Settings</h2>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Configure system & hardware</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Shop Information Configuration */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-8 lg:p-10 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Shop Profile</h3>
                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Identity & Branding</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 lg:p-10 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                            {/* Logo Column */}
                            <div className="space-y-4 flex flex-col items-center">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-full text-center md:text-left">Shop Logo</label>
                                <div className="relative group cursor-pointer w-32 h-32 lg:w-40 lg:h-40">
                                    <div className="w-full h-full bg-slate-50 border-4 border-slate-100 rounded-[2.5rem] flex items-center justify-center overflow-hidden transition-all group-hover:border-brand-500">
                                        {shopLogo ? (
                                            <img src={shopLogo} className="w-full h-full object-cover" alt="Preview" />
                                        ) : (
                                            <svg className="w-12 h-12 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        )}
                                    </div>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="absolute inset-0 bg-brand-600/60 flex items-center justify-center rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                                    </div>
                                </div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">Click to upload JPG/PNG</p>
                            </div>

                            {/* Details Column */}
                            <div className="md:col-span-2 space-y-6">
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Junkshop Name</label>
                                    <input 
                                        type="text" 
                                        value={shopName}
                                        onChange={(e) => setShopName(e.target.value)}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none font-bold text-slate-900"
                                        placeholder="Enter shop name"
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button 
                                        onClick={handleSaveShopDetails}
                                        disabled={saving}
                                        className="flex-1 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-100 transition-all uppercase tracking-widest text-xs"
                                    >
                                        {saving ? 'Saving...' : 'Update Branding'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cashier Management Configuration */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-8 lg:p-10 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Cashier Management</h3>
                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Add or remove staff names</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 lg:p-10 space-y-6">
                        <div className="flex gap-4">
                            <input 
                                type="text" 
                                value={newCashier}
                                onChange={(e) => setNewCashier(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddCashier()}
                                className="flex-1 px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none font-bold text-slate-900"
                                placeholder="Enter cashier name..."
                            />
                            <button 
                                onClick={handleAddCashier}
                                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all uppercase tracking-widest text-xs"
                            >
                                Add Cashier
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {cashiers.map((name, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                                    <span className="font-bold text-slate-900">{name}</span>
                                    <button 
                                        onClick={() => handleRemoveCashier(index)}
                                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {cashiers.length === 0 && (
                            <div className="py-8 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest italic">No cashiers added yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Printer Configuration */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-8 lg:p-10 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-100">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Printer Setup</h3>
                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Select your thermal receipt printer</p>
                            </div>
                        </div>
                        <button 
                            onClick={loadPrinters}
                            className="p-3 text-slate-400 hover:text-brand-600 transition-colors"
                            title="Refresh Printer List"
                        >
                            <svg className={`w-5 h-5 ${loadingPrinters ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </button>
                    </div>

                    <div className="p-8 lg:p-10 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Select Printer</label>
                                <select 
                                    value={selectedPrinter}
                                    onChange={(e) => setSelectedPrinter(e.target.value)}
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none font-bold text-slate-900 appearance-none"
                                >
                                    <option value="">-- Choose a Printer --</option>
                                    {printers.map((p, idx) => (
                                        <option key={idx} value={p.name}>{p.name} {p.isDefault ? '(Default)' : ''}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Printer Type / Protocol</label>
                                <select 
                                    value={printerType}
                                    onChange={(e) => setPrinterType(e.target.value)}
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none font-bold text-slate-900 appearance-none"
                                >
                                    <option value="EPSON">EPSON (ESC/POS)</option>
                                    <option value="STAR">STAR</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-50">
                            <button 
                                onClick={testPrint}
                                className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-2xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                Print Test Page
                            </button>
                            <button 
                                onClick={handleSavePrinter}
                                disabled={saving}
                                className="flex-1 px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white font-black rounded-2xl shadow-xl shadow-brand-100 transition-all uppercase tracking-widest text-xs"
                            >
                                {saving ? 'Saving...' : 'Save Printer Configuration'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-brand-50 border-2 border-brand-100 p-8 rounded-[2rem] flex items-start gap-6">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-600 shrink-0 shadow-sm">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                        <h4 className="text-brand-900 font-black uppercase tracking-tight text-sm">Printer Compatibility</h4>
                        <p className="text-brand-700/70 font-bold text-xs mt-1 leading-relaxed">
                            This system supports most USB and Network thermal printers using the ESC/POS protocol (Epson standard). 
                            If your printer is not listed, make sure it is installed in your Windows Settings under "Printers & Scanners".
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;