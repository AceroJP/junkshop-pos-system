import React, { useState } from 'react';

const Login = ({ onLogin, shopSettings }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
                <div className="bg-brand-600 p-6 sm:p-8 lg:p-10 text-center text-white relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-2xl"></div>
                    
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white p-1 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center mx-auto mb-4 shadow-2xl relative z-10">
                        <div className="w-full h-full bg-slate-50 rounded-[1.3rem] sm:rounded-[1.8rem] flex items-center justify-center overflow-hidden">
                            {shopSettings.shop_logo ? (
                                <img src={shopSettings.shop_logo} className="w-full h-full object-cover" alt="Shop Logo" />
                            ) : (
                                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            )}
                        </div>
                    </div>
                    
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-black uppercase tracking-tight truncate px-4 relative z-10">{shopSettings.shop_name}</h2>
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
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-5 py-3 sm:py-4 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:ring-8 focus:ring-brand-500/5 focus:border-brand-500 transition-all outline-none font-bold text-slate-900 placeholder:text-slate-300 text-sm"
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
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
                    </form>

                    <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-50 text-center shrink-0">
                        <p className="text-[8px] sm:text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
                            Authorized Access Only
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
