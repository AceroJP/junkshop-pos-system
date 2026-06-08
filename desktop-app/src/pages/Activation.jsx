import React, { useState, useEffect } from 'react';

const Activation = ({ onActivated }) => {
    const [licenseKey, setLicenseKey] = useState('');
    const [fingerprint, setFingerprint] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // API Server Configuration
    const [showApiSettings, setShowApiSettings] = useState(false);
    const [apiUrl, setApiUrl] = useState('http://192.168.55.103:8000/api');

    useEffect(() => {
        // Get device fingerprint on load if in Electron
        if (window.electron && window.electron.getFingerprint) {
            window.electron.getFingerprint().then(id => setFingerprint(id));
        } else {
            setFingerprint('BROWSER-MODE-NO-FINGERPRINT');
        }

        // Load existing API URL if set
        if (window.electron && window.electron.getSettings) {
            window.electron.getSettings().then(settings => {
                if (settings.api_url) {
                    setApiUrl(settings.api_url);
                }
            });
        }
    }, []);

    const handleSaveApiUrl = async () => {
        if (!apiUrl.trim()) return;
        try {
            await window.electron.saveSetting('api_url', apiUrl.trim());
            setShowApiSettings(false);
        } catch (err) {
            setError('Failed to save API URL');
        }
    };

    const handleActivate = async (e) => {
        e.preventDefault();
        if (!licenseKey.trim()) {
            setError('Please enter a license key');
            return;
        }

        if (!window.electron || !window.electron.activateLicense) {
            setError('Activation is only available in the Desktop App');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await window.electron.activateLicense(licenseKey);
            if (result.success) {
                onActivated();
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError(`Connection to server failed. Please check your Server Settings (gear icon) and ensure the URL is correct.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 relative overflow-hidden">
                {/* API Settings Toggle */}
                <button 
                    onClick={() => setShowApiSettings(!showApiSettings)}
                    className="absolute top-6 right-6 p-3 bg-slate-50 text-slate-500 hover:bg-brand-50 hover:text-brand-600 rounded-2xl transition-all shadow-sm border border-slate-100 group"
                    title="Server Settings"
                >
                    <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>

                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-brand-600 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-brand-200">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">System Activation</h2>
                    <p className="text-slate-500 font-bold mt-2">Enter your license key to continue</p>
                </div>

                {showApiSettings ? (
                    <div className="space-y-6 animate-fade-in">
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Server API URL</label>
                            <input 
                                type="text" 
                                value={apiUrl}
                                onChange={(e) => setApiUrl(e.target.value)}
                                placeholder="http://your-server-ip:8000/api"
                                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none font-bold text-sm"
                            />
                            <p className="text-[10px] text-slate-400 italic">Current: {apiUrl}</p>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={handleSaveApiUrl}
                                className="flex-1 bg-brand-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-brand-100 hover:bg-brand-700 transition-all"
                            >
                                Save Settings
                            </button>
                            <button 
                                onClick={() => setShowApiSettings(false)}
                                className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleActivate} className="space-y-8">
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">License Key</label>
                        <input 
                            type="text" 
                            value={licenseKey}
                            onChange={(e) => setLicenseKey(e.target.value)}
                            placeholder="JUNK-XXXX-XXXX-XXXX"
                            className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none font-bold text-lg tracking-widest text-center uppercase"
                            disabled={loading}
                        />
                    </div>

                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Device Fingerprint</p>
                        <code className="text-xs font-bold text-slate-600 break-all">{fingerprint || 'Generating...'}</code>
                    </div>

                    {error && (
                        <div className="space-y-4">
                            <div className="bg-rose-50 border-2 border-rose-100 text-rose-600 px-6 py-4 rounded-2xl font-bold text-sm flex items-center gap-3">
                                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </div>
                            
                            {error.includes('Connection') && (
                                <button 
                                    type="button"
                                    onClick={() => setShowApiSettings(true)}
                                    className="w-full py-3 bg-brand-50 text-brand-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-100 transition-all border border-brand-100 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    Fix Connection / Update Server IP
                                </button>
                            )}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-black py-6 rounded-2xl shadow-xl shadow-brand-100 transition-all hover:-translate-y-1 active:scale-95 text-lg uppercase tracking-widest flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Activating...
                            </>
                        ) : 'Activate System'}
                    </button>
                </form>
                )}

                <p className="mt-10 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
                    Need help? Contact support at<br/>
                    <span className="text-brand-600">support@junkshop-pos.com</span>
                </p>
            </div>
        </div>
    );
};

export default Activation;
