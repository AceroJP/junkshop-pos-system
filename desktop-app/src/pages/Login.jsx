import React, { useState } from 'react';
import logo from '../assets/logo.png';

const Login = ({ onLogin, shopSettings }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Recovery State (Logo clicks)
    const [clickCount, setClickCount] = useState(0);
    const [showRecovery, setShowRecovery] = useState(false);
    const [masterKey, setMasterKey] = useState('');
    
    // Forgot Password State (New mechanism)
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [secretCode, setSecretCode] = useState('');
    const [isSecretVerified, setIsSecretVerified] = useState(false);
    const [existingAdminUsername, setExistingAdminUsername] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [recoveryError, setRecoveryError] = useState('');
    const [recoverySuccess, setRecoverySuccess] = useState('');

    const handleLogoClick = () => {
        const newCount = clickCount + 1;
        setClickCount(newCount);
        if (newCount >= 5) {
            setShowRecovery(true);
            setClickCount(0);
        }
        // Reset count after 2 seconds of inactivity
        setTimeout(() => setClickCount(0), 2000);
    };

    const handleForgotPasswordClick = () => {
        setShowForgotPassword(true);
        setIsSecretVerified(false);
        setSecretCode('');
        setRecoveryError('');
        setRecoverySuccess('');
    };

    const handleVerifySecret = async () => {
        if (!secretCode) {
            setRecoveryError('Please enter the secret code');
            return;
        }

        setLoading(true);
        setRecoveryError('');

        try {
            const result = await window.electron.getAdminInfo(secretCode);
            if (result.success) {
                setExistingAdminUsername(result.username);
                setNewUsername(''); // Clear the field so they can create a new one
                setIsSecretVerified(true);
            } else {
                setRecoveryError(result.message);
            }
        } catch (err) {
            setRecoveryError('Failed to verify secret code');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAccount = async (e) => {
        e.preventDefault();
        if (!newUsername || !newPassword) {
            setRecoveryError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setRecoveryError('');

        try {
            const result = await window.electron.resetAdminAccount({ 
                secretCode, 
                newUsername, 
                newPassword 
            });

            if (result.success) {
                setRecoverySuccess(result.message);
                setTimeout(() => {
                    setShowForgotPassword(false);
                    setSecretCode('');
                    setIsSecretVerified(false);
                    setRecoverySuccess('');
                }, 3000);
            } else {
                setRecoveryError(result.message);
            }
        } catch (err) {
            setRecoveryError('An error occurred during update');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            setError('Please enter both username and password');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await window.electron.login({ username, password });
            if (result.success) {
                onLogin(result.user);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 overflow-hidden relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="bg-white w-full max-w-sm sm:max-w-md rounded-[2.5rem] sm:rounded-[3rem] shadow-[0_20px_100px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col border border-white/10 animate-fade-in relative z-10">
                {/* Header/Logo Area */}
                <div className="bg-brand-600 p-6 sm:p-8 lg:p-10 text-center text-white relative overflow-hidden shrink-0 cursor-pointer select-none" onClick={handleLogoClick}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-2xl"></div>
                    
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white p-1 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center mx-auto mb-4 shadow-2xl relative z-10">
                        <div className="w-full h-full bg-slate-50 rounded-[1.3rem] sm:rounded-[1.8rem] flex items-center justify-center overflow-hidden">
                            {shopSettings.shop_logo ? (
                                <img src={shopSettings.shop_logo} className="w-full h-full object-cover" alt="Shop Logo" />
                            ) : (
                                <img src={logo} className="w-full h-full object-contain p-1" alt="Logo" />
                            )}
                        </div>
                    </div>
                    
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-black uppercase tracking-tight leading-tight break-words line-clamp-2 px-4 relative z-10">{shopSettings.shop_name}</h2>
                    <p className="text-white/80 font-bold mt-1 text-[8px] sm:text-[9px] lg:text-[10px] uppercase tracking-[0.3em] relative z-10">Junkshop POS System</p>
                </div>

                {/* Form Area */}
                <div className="p-6 sm:p-8 lg:p-10 pt-4 sm:pt-6 lg:pt-8 overflow-y-auto custom-scrollbar flex-1">
                    <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Username</label>
                            <div className="relative group">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </span>
                                <input 
                                    type="text" 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-12 pr-5 py-3 sm:py-4 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:ring-8 focus:ring-brand-500/5 focus:border-brand-500 transition-all outline-none font-bold text-slate-900 placeholder:text-slate-300 text-sm"
                                    placeholder="Enter username"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Password</label>
                            <div className="relative group">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </span>
                                <input 
                                    type={showLoginPassword ? "text" : "password"} 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3 sm:py-4 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:ring-8 focus:ring-brand-500/5 focus:border-brand-500 transition-all outline-none font-bold text-slate-900 placeholder:text-slate-300 text-sm"
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-500 transition-colors focus:outline-none"
                                >
                                    {showLoginPassword ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.643-9.943-6.442a5.08 5.08 0 011.667-2.047m3.345-1.188a10.017 10.017 0 014.931-1.323c2.186 0 4.235.702 5.918 1.89m3.446 3.446A10.05 10.05 0 0121.943 12c-1.675 3.799-5.465 6.442-9.943 6.442a9.997 9.997 0 01-1.012-.051M12 9a3 3 0 00-3 3m3 3a3 3 0 003-3m-3-3l-3-3m3 3l3 3M3 3l18 18" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-rose-50 border-2 border-rose-100 text-rose-600 px-4 py-3 rounded-xl font-bold text-[10px] flex items-center gap-2 animate-shake">
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white font-black py-4 sm:py-5 rounded-xl shadow-xl transition-all hover:-translate-y-1 active:scale-95 text-sm sm:text-base uppercase tracking-widest flex items-center justify-center gap-3 group mt-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </>
                            )}
                        </button>
                        
                        <div className="text-center mt-4">
                            <button 
                                type="button"
                                onClick={handleForgotPasswordClick}
                                className="text-[10px] font-black text-slate-400 hover:text-brand-600 uppercase tracking-widest transition-colors outline-none"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-50 text-center shrink-0">
                        <p className="text-[8px] sm:text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
                            Authorized Access Only
                        </p>
                    </div>
                </div>
            </div>

            {/* Admin Recovery Modal */}
            {showRecovery && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !loading && setShowRecovery(false)}></div>
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-300">
                        <div className="bg-slate-900 p-8 text-white text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/20 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                            <h3 className="text-xl font-black uppercase tracking-tight relative z-10">Admin Recovery</h3>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1 relative z-10">System Password Reset</p>
                        </div>
                        
                        <div className="p-8">
                            {recoverySuccess ? (
                                <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in duration-500">
                                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="text-slate-900 font-black uppercase tracking-tight text-lg">{recoverySuccess}</p>
                                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">You can now sign in with your new password.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleRecovery} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Master Recovery Key</label>
                                        <input 
                                            type="text"
                                            value={masterKey}
                                            onChange={(e) => setMasterKey(e.target.value)}
                                            placeholder="XXXX-XXXX-XXXX"
                                            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:ring-8 focus:ring-brand-500/5 focus:border-brand-500 transition-all outline-none font-black text-slate-900 placeholder:text-slate-300 text-sm tracking-widest text-center"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">New Admin Password</label>
                                        <input 
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:ring-8 focus:ring-brand-500/5 focus:border-brand-500 transition-all outline-none font-bold text-slate-900 placeholder:text-slate-300 text-sm"
                                        />
                                    </div>

                                    {recoveryError && (
                                        <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest text-center animate-shake">{recoveryError}</p>
                                    )}

                                    <div className="flex gap-3">
                                        <button 
                                            type="button"
                                            onClick={() => setShowRecovery(false)}
                                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-4 rounded-xl transition-all uppercase tracking-widest text-xs"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 bg-slate-900 hover:bg-black text-white font-black py-4 rounded-xl transition-all uppercase tracking-widest text-xs shadow-lg"
                                        >
                                            {loading ? 'Processing...' : 'Reset Password'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => !loading && setShowForgotPassword(false)}></div>
                    <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-300">
                        <div className="bg-brand-600 p-10 text-white text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24 blur-2xl"></div>
                            <h3 className="text-3xl font-black uppercase tracking-tight relative z-10">Admin Account Recovery</h3>
                            <p className="text-white/80 text-xs font-bold uppercase tracking-[0.4em] mt-2 relative z-10">Restricted Service Access</p>
                        </div>
                        
                        <div className="p-10 lg:p-12">
                            {recoverySuccess ? (
                                <div className="py-12 text-center space-y-6">
                                    <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-100">
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="text-slate-900 font-black uppercase tracking-tight text-2xl">{recoverySuccess}</p>
                                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">The system is updating your credentials. Please wait...</p>
                                </div>
                            ) : !isSecretVerified ? (
                                <div className="space-y-10">
                                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
                                        {/* Left: Contact Info */}
                                        <div className="lg:col-span-2 space-y-8">
                                            <div className="bg-slate-50 p-8 rounded-[2rem] border-2 border-slate-100 shadow-sm relative overflow-hidden group hover:border-brand-500 transition-colors">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full -mr-12 -mt-12 blur-2xl transition-colors group-hover:bg-brand-500/10"></div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Service Provider</p>
                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="text-xl font-black text-slate-900 uppercase tracking-tight">Joenil Acero</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Lead Developer</p>
                                                    </div>
                                                    <div className="space-y-2 pt-2">
                                                        <div className="flex items-center gap-3 text-brand-600">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                            <p className="text-sm font-black tracking-widest">09756864187</p>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-slate-500">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                            <p className="text-[11px] font-bold break-all">joenilpanal@gmail.com</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Unlock Code</label>
                                                <div className="relative group">
                                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                    </span>
                                                    <input 
                                                        type="text"
                                                        value={secretCode}
                                                        onChange={(e) => setSecretCode(e.target.value)}
                                                        placeholder="Enter Master Secret"
                                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:ring-8 focus:ring-brand-500/5 focus:border-brand-500 transition-all outline-none font-black text-slate-900 placeholder:text-slate-300 text-base"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Step-by-Step Guide */}
                                        <div className="lg:col-span-3 bg-brand-50/50 p-8 lg:p-10 rounded-[2.5rem] border-2 border-brand-100/50 relative overflow-hidden">
                                            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-brand-500/5 rounded-full blur-3xl"></div>
                                            <p className="text-[11px] font-black text-brand-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                                                <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></span>
                                                Recovery Instructions
                                            </p>
                                            <div className="space-y-8 relative z-10">
                                                <div className="flex gap-6">
                                                    <div className="w-10 h-10 bg-brand-600 text-white rounded-2xl flex items-center justify-center text-sm font-black shadow-lg shadow-brand-200 shrink-0">1</div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Identity Verification</p>
                                                        <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest">Contact Joenil Acero using the phone or email provided on the left side of this card.</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-6">
                                                    <div className="w-10 h-10 bg-brand-600 text-white rounded-2xl flex items-center justify-center text-sm font-black shadow-lg shadow-brand-200 shrink-0">2</div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Obtain Master Code</p>
                                                        <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest">Request for the "Master Secret Code" required to override the current administrative credentials.</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-6">
                                                    <div className="w-10 h-10 bg-brand-600 text-white rounded-2xl flex items-center justify-center text-sm font-black shadow-lg shadow-brand-200 shrink-0">3</div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">System Unlock</p>
                                                        <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest">Input the master code into the field and click "Unlock Account" to view existing info or set new login details.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {recoveryError && (
                                        <div className="bg-rose-50 border-2 border-rose-100 text-rose-600 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 animate-shake">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            {recoveryError}
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <button 
                                            type="button"
                                            onClick={() => setShowForgotPassword(false)}
                                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-5 rounded-2xl transition-all uppercase tracking-[0.2em] text-xs"
                                        >
                                            Return to Login
                                        </button>
                                        <button 
                                            onClick={handleVerifySecret}
                                            disabled={loading}
                                            className="flex-[2] bg-brand-600 hover:bg-brand-700 text-white font-black py-5 rounded-2xl transition-all uppercase tracking-[0.2em] text-xs shadow-2xl shadow-brand-100 flex items-center justify-center gap-3"
                                        >
                                            {loading ? (
                                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    <span>Unlock System Account</span>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleUpdateAccount} className="space-y-10">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="bg-emerald-50 p-8 rounded-[2.5rem] border-2 border-emerald-100 space-y-6 relative overflow-hidden">
                                            <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>
                                            <div>
                                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2">Account Identified</p>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Username</p>
                                                        <p className="text-xl font-black text-slate-900 uppercase tracking-tight">{existingAdminUsername}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="p-5 bg-white/60 rounded-2xl border border-emerald-200">
                                                <p className="text-[10px] font-black text-emerald-800 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    Safety Recommendation
                                                </p>
                                                <p className="text-[11px] font-bold text-emerald-700 leading-relaxed italic uppercase tracking-wider">
                                                    Please record your new credentials in a physical notebook or secure password manager to ensure continuous system access.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">New System Username</label>
                                                <div className="relative group">
                                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                    </span>
                                                    <input 
                                                        type="text"
                                                        value={newUsername}
                                                        onChange={(e) => setNewUsername(e.target.value)}
                                                        placeholder="Create new username"
                                                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:ring-8 focus:ring-brand-500/5 focus:border-brand-500 transition-all outline-none font-black text-slate-900 text-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">New Secure Password</label>
                                                <div className="relative group">
                                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                    </span>
                                                    <input 
                                                        type={showNewPassword ? "text" : "password"}
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        placeholder="Enter new password"
                                                        className="w-full pl-14 pr-14 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:ring-8 focus:ring-brand-500/5 focus:border-brand-500 transition-all outline-none font-bold text-slate-900 text-sm"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-500 transition-colors focus:outline-none"
                                                    >
                                                        {showNewPassword ? (
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.643-9.943-6.442a5.08 5.08 0 011.667-2.047m3.345-1.188a10.017 10.017 0 014.931-1.323c2.186 0 4.235.702 5.918 1.89m3.446 3.446A10.05 10.05 0 0121.943 12c-1.675 3.799-5.465 6.442-9.943 6.442a9.997 9.997 0 01-1.012-.051M12 9a3 3 0 00-3 3m3 3a3 3 0 003-3m-3-3l-3-3m3 3l3 3M3 3l18 18" /></svg>
                                                        ) : (
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {recoveryError && (
                                        <div className="bg-rose-50 border-2 border-rose-100 text-rose-600 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 animate-shake">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            {recoveryError}
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <button 
                                            type="button"
                                            onClick={() => setIsSecretVerified(false)}
                                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-5 rounded-2xl transition-all uppercase tracking-[0.2em] text-xs"
                                        >
                                            Previous Step
                                        </button>
                                        <button 
                                            type="submit"
                                            disabled={loading}
                                            className="flex-[2] bg-brand-600 hover:bg-brand-700 text-white font-black py-5 rounded-2xl transition-all uppercase tracking-[0.2em] text-xs shadow-2xl shadow-brand-100 flex items-center justify-center gap-3"
                                        >
                                            {loading ? (
                                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    <span>Update System Credentials</span>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
