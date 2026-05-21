import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import POS from './pages/POS';
import Login from './pages/Login';
import Activation from './pages/Activation';
import Products from './pages/Products';
import Setup from './pages/Setup';
import Transactions from './pages/Transactions';
import Settings from './pages/Settings';
import Reports from './pages/Reports';

function App() {
  const [isLicenseValid, setIsLicenseValid] = useState(null);
  const [isSetupComplete, setIsSetupComplete] = useState(null);
  const [shopSettings, setShopSettings] = useState({});
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('POS');

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    // 1. Check license
    if (window.electron && window.electron.checkLicense) {
      const licenseResult = await window.electron.checkLicense();
      setIsLicenseValid(licenseResult.valid);
      
      if (licenseResult.valid) {
        // 2. Check setup status
        const settings = await window.electron.getSettings();
        setShopSettings(settings);
        setIsSetupComplete(settings.is_setup_complete === '1');
      }
    } else {
      setIsLicenseValid(false);
    }
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out of the system.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0ea5e9',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'No, stay',
      customClass: {
        popup: 'rounded-[2rem]',
        title: 'font-black uppercase tracking-tight',
        confirmButton: 'rounded-xl font-bold uppercase tracking-widest text-xs px-6 py-3',
        cancelButton: 'rounded-xl font-bold uppercase tracking-widest text-xs px-6 py-3'
      }
    });

    if (result.isConfirmed) {
      await window.electron.logout();
      setUser(null);
    }
  };

  // 1. Loading state
  if (isLicenseValid === null || (isLicenseValid && isSetupComplete === null)) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // 2. Activation flow
  if (!isLicenseValid) {
    return <Activation onActivated={initApp} />;
  }

  // 3. Setup flow
  if (!isSetupComplete) {
    return <Setup onComplete={initApp} />;
  }

  // 4. Login flow
  if (!user) {
    return <Login shopSettings={shopSettings} onLogin={(userData) => setUser(userData)} />;
  }

  // 5. Main App
  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full lg:w-72 bg-white border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col shrink-0">
        <div className="h-20 lg:h-24 flex items-center px-6 lg:px-8 gap-4 border-b border-slate-50">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-brand-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-200 overflow-hidden">
            {shopSettings.shop_logo ? (
              <img src={shopSettings.shop_logo} className="w-full h-full object-cover" />
            ) : (
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg lg:text-xl font-black text-slate-900 uppercase tracking-tight leading-none truncate">{shopSettings.shop_name}</h1>
            <span className="text-brand-600 font-black text-[9px] lg:text-[10px] uppercase tracking-[0.3em]">POS System</span>
          </div>
        </div>

        <nav className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible p-4 lg:p-6 gap-2 lg:space-y-2 no-scrollbar">
          <button 
            onClick={() => setCurrentPage('POS')} 
            className={`flex items-center gap-3 px-4 py-2.5 lg:py-3.5 rounded-2xl transition-all duration-200 font-bold shrink-0 lg:w-full ${currentPage === 'POS' ? 'bg-brand-600 text-white shadow-xl shadow-brand-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <span className="whitespace-nowrap">POS Terminal</span>
          </button>

          <button 
            onClick={() => setCurrentPage('Transactions')} 
            className={`flex items-center gap-3 px-4 py-2.5 lg:py-3.5 rounded-2xl transition-all duration-200 font-bold shrink-0 lg:w-full ${currentPage === 'Transactions' ? 'bg-brand-600 text-white shadow-xl shadow-brand-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <span className="whitespace-nowrap">Transactions</span>
          </button>

          {user.role === 'admin' && (
            <>
              <button 
                onClick={() => setCurrentPage('Inventory')} 
                className={`flex items-center gap-3 px-4 py-2.5 lg:py-3.5 rounded-2xl transition-all duration-200 font-bold shrink-0 lg:w-full ${currentPage === 'Inventory' ? 'bg-brand-600 text-white shadow-xl shadow-brand-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                <span className="whitespace-nowrap">Inventory</span>
              </button>
              <button 
                onClick={() => setCurrentPage('Reports')} 
                className={`flex items-center gap-3 px-4 py-2.5 lg:py-3.5 rounded-2xl transition-all duration-200 font-bold shrink-0 lg:w-full ${currentPage === 'Reports' ? 'bg-brand-600 text-white shadow-xl shadow-brand-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                <span className="whitespace-nowrap">Reports</span>
              </button>
              <button 
                onClick={() => setCurrentPage('Settings')} 
                className={`flex items-center gap-3 px-4 py-2.5 lg:py-3.5 rounded-2xl transition-all duration-200 font-bold shrink-0 lg:w-full ${currentPage === 'Settings' ? 'bg-brand-600 text-white shadow-xl shadow-brand-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="whitespace-nowrap">Settings</span>
              </button>
            </>
          )}
        </nav>

        {/* User Profile / Logout */}
        <div className="p-4 lg:p-6 mt-auto border-t border-slate-50 hidden lg:block">
          <div className="bg-slate-50 rounded-[2rem] p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center text-brand-700 font-black shrink-0">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-slate-900 truncate">{user.full_name}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{user.role}</p>
            </div>
            <button onClick={handleLogout} title="Logout" className="text-slate-400 hover:text-rose-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3 3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 overflow-y-auto p-4 sm:p-8 lg:p-12">
          {currentPage === 'POS' && <POS user={user} />}
          {currentPage === 'Transactions' && <Transactions shopSettings={shopSettings} />}
          {currentPage === 'Inventory' && <Products />}
          {currentPage === 'Settings' && <Settings shopSettings={shopSettings} onSettingsUpdate={initApp} />}
          {currentPage === 'Reports' && <Reports />}
        </div>
      </main>
    </div>
  );
}

export default App;
