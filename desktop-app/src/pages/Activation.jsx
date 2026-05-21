import React, { useState, useEffect } from 'react';

const Activation = ({ onActivated }) => {
    const [licenseKey, setLicenseKey] = useState('');
    const [fingerprint, setFingerprint] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Get device fingerprint on load if in Electron
        if (window.electron && window.electron.getFingerprint) {
            window.electron.getFingerprint().then(id => setFingerprint(id));
        } else {
            setFingerprint('BROWSER-MODE-NO-FINGERPRINT');
        }
    }, []);

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
            setError('An error occurred during activation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 border border-slate-100">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-brand-600 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-brand-200">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">System Activation</h2>
                    <p className="text-slate-500 font-bold mt-2">Enter your license key to continue</p>
                </div>

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
                        <div className="bg-rose-50 border-2 border-rose-100 text-rose-600 px-6 py-4 rounded-2xl font-bold text-sm flex items-center gap-3">
                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
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

                <p className="mt-10 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
                    Need help? Contact support at<br/>
                    <span className="text-brand-600">support@junkshop-pos.com</span>
                </p>
            </div>
        </div>
    );
};

export default Activation;
