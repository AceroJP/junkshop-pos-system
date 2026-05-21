import React, { useState } from 'react';

const Setup = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        shopName: '',
        shopLogo: '',
        fullName: '',
        username: '',
        password: '',
        confirmPassword: ''
    });

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (readerEvent) => {
                setFormData({ ...formData, shopLogo: readerEvent.target.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNext = () => {
        if (step === 1) {
            if (!formData.shopName) {
                setError('Please enter your junkshop name');
                return;
            }
            setError('');
            setStep(2);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (!formData.username || !formData.password || !formData.fullName) {
            setError('Please fill in all administrator fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await window.electron.completeSetup(formData);
            if (result.success) {
                onComplete();
            } else {
                setError(result.error || 'Failed to complete setup');
            }
        } catch (err) {
            setError('An error occurred during setup');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 animate-fade-in">
                {/* Progress Bar */}
                <div className="h-2 bg-slate-100 flex">
                    <div className={`h-full bg-brand-600 transition-all duration-500 ${step === 1 ? 'w-1/2' : 'w-full'}`}></div>
                </div>

                <div className="p-8 lg:p-12">
                    <div className="mb-8 lg:mb-10">
                        <h2 className="text-2xl lg:text-3xl font-black text-slate-900 uppercase tracking-tight">System Setup</h2>
                        <p className="text-slate-500 font-bold mt-2 text-sm lg:text-base">
                            {step === 1 ? 'Configure your junkshop details' : 'Create your administrator account'}
                        </p>
                    </div>

                    {step === 1 ? (
                        <div className="space-y-6 lg:space-y-8">
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Junkshop Logo (Optional)</label>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                                    <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                        {formData.shopLogo ? (
                                            <img src={formData.shopLogo} className="w-full h-full object-cover" />
                                        ) : (
                                            <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        )}
                                    </div>
                                    <input type="file" onChange={handleLogoUpload} accept="image/*" className="text-[10px] lg:text-xs font-bold text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] lg:file:text-xs file:font-black file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Junkshop Name</label>
                                <input 
                                    type="text" 
                                    value={formData.shopName}
                                    onChange={e => setFormData({...formData, shopName: e.target.value})}
                                    className="w-full px-6 py-4 lg:py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none font-bold text-slate-900"
                                    placeholder="Enter your business name"
                                />
                            </div>

                            <button onClick={handleNext} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-black py-5 lg:py-6 rounded-2xl shadow-xl shadow-brand-100 transition-all hover:-translate-y-1 active:scale-95 text-base lg:text-lg uppercase tracking-widest flex items-center justify-center gap-3">
                                Continue Setup
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Administrator Full Name</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.fullName}
                                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none font-bold text-slate-900"
                                    placeholder="e.g. Juan Dela Cruz"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Username</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.username}
                                        onChange={e => setFormData({...formData, username: e.target.value})}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none font-bold text-slate-900"
                                        placeholder="admin"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Password</label>
                                    <input 
                                        type="password" 
                                        required
                                        value={formData.password}
                                        onChange={e => setFormData({...formData, password: e.target.value})}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none font-bold text-slate-900"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Confirm Password</label>
                                <input 
                                    type="password" 
                                    required
                                    value={formData.confirmPassword}
                                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none font-bold text-slate-900"
                                    placeholder="••••••••"
                                />
                            </div>

                            {error && (
                                <div className="bg-rose-50 border-2 border-rose-100 text-rose-600 px-6 py-4 rounded-2xl font-bold text-xs">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setStep(1)} className="px-8 py-5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-2xl transition-all uppercase tracking-widest text-sm">Back</button>
                                <button type="submit" disabled={loading} className="flex-1 bg-slate-900 hover:bg-black text-white font-black py-5 rounded-2xl shadow-xl transition-all hover:-translate-y-1 active:scale-95 uppercase tracking-widest">
                                    {loading ? 'Finalizing...' : 'Complete & Start App'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Setup;
