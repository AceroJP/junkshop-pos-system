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
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-slate-100 animate-fade-in">
                {/* Header/Logo Area */}
                <div className="bg-brand-600 p-8 lg:p-12 text-center text-white relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <div className="w-20 h-20 lg:w-24 lg:h-24 bg-white/20 rounded-[2rem] lg:rounded-[2.5rem] flex items-center justify-center mx-auto mb-4 lg:mb-6 backdrop-blur-md overflow-hidden">
                        {shopSettings.shop_logo ? (
                            <img src={shopSettings.shop_logo} className="w-full h-full object-cover" />
                        ) : (
                            <svg className="w-8 h-8 lg:w-10 lg:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        )}
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-black uppercase tracking-tight truncate px-4">{shopSettings.shop_name}</h2>
                    <p className="text-white/70 font-bold mt-2 text-[10px] lg:text-sm uppercase tracking-widest">Junkshop POS System</p>
                </div>

                {/* Form Area */}
                <div className="p-8 lg:p-12 pt-6 lg:pt-10">
                    <form onSubmit={handleLogin} className="space-y-6 lg:space-y-8">
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Username</label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </span>
                                <input 
                                    type="text" 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none font-bold text-slate-900"
                                    placeholder="Enter username"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Password</label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </span>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none font-bold text-slate-900"
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-rose-50 border-2 border-rose-100 text-rose-600 px-6 py-4 rounded-2xl font-bold text-xs flex items-center gap-3 animate-shake">
                                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white font-black py-6 rounded-2xl shadow-xl transition-all hover:-translate-y-1 active:scale-95 text-lg uppercase tracking-widest flex items-center justify-center gap-3"
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                            Authorized Access Only
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
