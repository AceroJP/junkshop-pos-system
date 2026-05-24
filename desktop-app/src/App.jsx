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
import Sellers from './pages/Sellers';
import logo from './assets/logo.png';

function App() {
  const [isLicenseValid, setIsLicenseValid] = useState(null);
  const [isMaster, setIsMaster] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(null);
  const [shopSettings, setShopSettings] = useState({});
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('POS');
  const [appVersion, setAppVersion] = useState('');
  const [activeModal, setActiveModal] = useState(null); // 'product', 'receipt', 'weight', 'checkout'
  const [modalData, setModalData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleDeleteTransaction = async (transaction) => {
    const { value: password } = await Swal.fire({
      title: 'Admin Verification',
      text: 'Please enter your admin password to delete this transaction.',
      input: 'password',
      inputPlaceholder: 'Enter your password',
      showCancelButton: true,
      confirmButtonText: 'DELETE TRANSACTION',
      confirmButtonColor: '#ef4444',
      customClass: {
        popup: 'rounded-[2.5rem]',
        title: 'font-black uppercase tracking-tight',
        confirmButton: 'rounded-xl font-bold uppercase tracking-widest text-xs px-8 py-4',
        cancelButton: 'rounded-xl font-bold uppercase tracking-widest text-xs px-8 py-4',
        input: 'rounded-xl font-bold border-2 border-slate-100 focus:border-brand-500 outline-none transition-all'
      }
    });

    if (password) {
      const verify = await window.electron.verifyAdminPassword(password);
      if (verify.success) {
        const result = await Swal.fire({
          title: 'Final Confirmation',
          text: `Are you sure you want to PERMANENTLY delete transaction ${transaction.transaction_number}? This will also reverse any credit balance associated with it.`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'YES, DELETE PERMANENTLY',
          confirmButtonColor: '#ef4444',
          customClass: {
            popup: 'rounded-[2.5rem]',
            title: 'font-black uppercase tracking-tight',
            confirmButton: 'rounded-xl font-bold uppercase tracking-widest text-xs px-8 py-4',
            cancelButton: 'rounded-xl font-bold uppercase tracking-widest text-xs px-8 py-4'
          }
        });

        if (result.isConfirmed) {
          const deleteResult = await window.electron.deleteTransaction(transaction.id);
          if (deleteResult.success) {
            Swal.fire({
              title: 'Deleted!',
              text: 'Transaction has been removed successfully.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false,
              customClass: { popup: 'rounded-[2rem]' }
            });
            setActiveModal(null);
            // If the transaction page provides a refresh callback, call it
            if (modalData.onDelete) modalData.onDelete();
          } else {
            Swal.fire('Error', deleteResult.error || 'Failed to delete transaction', 'error');
          }
        }
      } else {
        Swal.fire('Unauthorized', 'Incorrect admin password.', 'error');
      }
    }
  };

  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [activeModal]);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    // 0. Get App Version
    if (window.electron && window.electron.getAppVersion) {
      const version = await window.electron.getAppVersion();
      setAppVersion(version);
    }

    // 1. Check license
    if (window.electron && window.electron.checkLicense) {
      const licenseResult = await window.electron.checkLicense();
      setIsLicenseValid(licenseResult.valid);
      setIsMaster(licenseResult.isMaster || false);
      
      if (licenseResult.valid) {
        // 2. Check setup status
        const settings = await window.electron.getSettings();
        setShopSettings(settings);
        setIsSetupComplete(settings.is_setup_complete === '1');

        // 3. Check for updates (only if online)
        try {
          const updateResult = await window.electron.checkUpdate();
          if (updateResult && updateResult.updateAvailable) {
            Swal.fire({
              title: 'Update Available!',
              html: `A new version <b>${updateResult.remoteVersion}</b> is available.<br><small>Current: ${updateResult.currentVersion}</small>`,
              icon: 'info',
              showCancelButton: true,
              confirmButtonText: 'Download Now',
              cancelButtonText: 'Later',
              confirmButtonColor: '#16a34a',
              cancelButtonColor: '#64748b',
              customClass: {
                popup: 'rounded-[2rem]',
                title: 'font-black uppercase tracking-tight',
                confirmButton: 'rounded-xl font-bold uppercase tracking-widest text-xs px-6 py-3',
                cancelButton: 'rounded-xl font-bold uppercase tracking-widest text-xs px-6 py-3'
              }
            }).then(async (result) => {
              if (result.isConfirmed) {
                // Show downloading effect
                let timerInterval;
                Swal.fire({
                  title: 'Preparing Download...',
                  html: 'We are connecting to the update server... <b>0</b>%',
                  timer: 2000,
                  timerProgressBar: true,
                  allowOutsideClick: false,
                  didOpen: () => {
                    Swal.showLoading();
                    const b = Swal.getHtmlContainer().querySelector('b');
                    timerInterval = setInterval(() => {
                      const timerLeft = Swal.getTimerLeft();
                      const progress = Math.min(100, Math.round(((2000 - timerLeft) / 2000) * 100));
                      if (b) b.textContent = progress;
                    }, 100);
                  },
                  willClose: () => {
                    clearInterval(timerInterval);
                  },
                  customClass: {
                    popup: 'rounded-[2rem]',
                    title: 'font-black uppercase tracking-tight',
                    htmlContainer: 'font-bold text-slate-500'
                  }
                 }).then(() => {
                   // Open the download URL in default browser using Electron's shell
                   if (window.electron && window.electron.openExternal) {
                     window.electron.openExternal(updateResult.downloadUrl);
                   } else {
                     window.open(updateResult.downloadUrl, '_blank');
                   }
                   
                   // Final notification
                  Swal.fire({
                    title: 'Download Started!',
                    text: 'The installer is being downloaded in your browser. Please run it once finished.',
                    icon: 'success',
                    timer: 5000,
                    showConfirmButton: false,
                    customClass: {
                      popup: 'rounded-[2rem]',
                      title: 'font-black uppercase tracking-tight'
                    }
                  });
                });
              }
            });
          }
        } catch (updateErr) {
          console.warn('Silent update check failed', updateErr);
        }
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
    <div className={`relative flex flex-col lg:flex-row h-screen bg-slate-50 overflow-hidden ${isMaster ? 'pt-6' : ''}`}>
      {/* Master License Banner */}
      {isMaster && (
        <div className="absolute top-0 left-0 right-0 bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.5em] py-1.5 text-center z-[200] shadow-lg pointer-events-none">
          Test Mode - Master License Active
        </div>
      )}

      {/* Mobile Header */}
      <div className="lg:hidden h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 z-[60]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center shadow-sm overflow-hidden">
            {shopSettings.shop_logo ? (
              <img src={shopSettings.shop_logo} className="w-full h-full object-cover" />
            ) : (
              <img src={logo} className="w-full h-full object-contain p-1" alt="Logo" />
            )}
          </div>
          <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight truncate max-w-[150px]">{shopSettings.shop_name}</h1>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar Backdrop (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70] lg:hidden animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-72 lg:w-64 xl:w-72 bg-white border-r border-slate-100 flex flex-col shrink-0 transition-transform duration-300 z-[80] lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${activeModal ? 'blur-sm grayscale-[0.2] pointer-events-none' : ''}`}>
        <div className="h-24 flex items-center px-8 gap-4 border-b border-slate-50 shrink-0">
          <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-100 overflow-hidden">
            {shopSettings.shop_logo ? (
              <img src={shopSettings.shop_logo} className="w-full h-full object-cover" />
            ) : (
              <img src={logo} className="w-full h-full object-contain p-1" alt="Logo" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none truncate">{shopSettings.shop_name}</h1>
            <span className="text-brand-600 font-black text-[10px] uppercase tracking-[0.3em]">POS System</span>
          </div>
          {/* Close button for mobile sidebar */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-rose-500 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-6 space-y-2 no-scrollbar">
          <button 
            onClick={() => { setCurrentPage('POS'); setIsSidebarOpen(false); }} 
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 font-bold w-full ${currentPage === 'POS' ? 'bg-brand-600 text-white shadow-xl shadow-brand-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <span className="whitespace-nowrap">POS Terminal</span>
          </button>

          <button 
            onClick={() => { setCurrentPage('Transactions'); setIsSidebarOpen(false); }} 
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 font-bold w-full ${currentPage === 'Transactions' ? 'bg-brand-600 text-white shadow-xl shadow-brand-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <span className="whitespace-nowrap">Transactions</span>
          </button>

          {user.role === 'admin' && (
            <>
              <button 
                onClick={() => { setCurrentPage('Inventory'); setIsSidebarOpen(false); }} 
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 font-bold w-full ${currentPage === 'Inventory' ? 'bg-brand-600 text-white shadow-xl shadow-brand-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                <span className="whitespace-nowrap">Inventory</span>
              </button>
              <button 
                onClick={() => { setCurrentPage('Sellers'); setIsSidebarOpen(false); }} 
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 font-bold w-full ${currentPage === 'Sellers' ? 'bg-brand-600 text-white shadow-xl shadow-brand-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                <span className="whitespace-nowrap">Credit Tracker</span>
              </button>
              <button 
                onClick={() => { setCurrentPage('Reports'); setIsSidebarOpen(false); }} 
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 font-bold w-full ${currentPage === 'Reports' ? 'bg-brand-600 text-white shadow-xl shadow-brand-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                <span className="whitespace-nowrap">Reports</span>
              </button>
              <button 
                onClick={() => { setCurrentPage('Settings'); setIsSidebarOpen(false); }} 
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 font-bold w-full ${currentPage === 'Settings' ? 'bg-brand-600 text-white shadow-xl shadow-brand-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="whitespace-nowrap">Settings</span>
              </button>
            </>
          )}
        </nav>

        {/* User Profile / Logout */}
        <div className="p-6 mt-auto border-t border-slate-50">
          <div className="bg-slate-50 rounded-[2rem] p-4 flex items-center gap-3 mb-4">
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
          
          {appVersion && (
            <div className="text-center">
              <span className="text-slate-300 text-[8px] font-black uppercase tracking-[0.3em]">
                Version {appVersion}
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 overflow-hidden relative transition-all duration-300 ${activeModal ? 'blur-sm grayscale-[0.2]' : ''}`}>
        <div className="absolute inset-0 overflow-y-auto p-4 sm:p-8 lg:p-12">
          {currentPage === 'POS' && <POS user={user} openModal={(type, data) => { setActiveModal(type); setModalData(data); }} />}
          {currentPage === 'Transactions' && <Transactions shopSettings={shopSettings} openModal={(type, data) => { setActiveModal(type); setModalData(data); }} />}
          {currentPage === 'Inventory' && <Products openModal={(type, data) => { setActiveModal(type); setModalData(data); }} />}
          {currentPage === 'Sellers' && <Sellers openModal={(type, data) => { setActiveModal(type); setModalData(data); }} />}
          {currentPage === 'Settings' && <Settings shopSettings={shopSettings} onSettingsUpdate={initApp} />}
          {currentPage === 'Reports' && <Reports shopSettings={shopSettings} />}
        </div>
      </main>

      {/* Global Modals Overlay (Covers Sidebar + Content) */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 animate-fade-in pointer-events-auto">
          {/* Global Backdrop */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setActiveModal(null)}></div>
          
          {/* Modal Content - Container for any modal */}
          <div className="relative z-10 w-full flex items-center justify-center pointer-events-none">
            {/* 1. Receipt Details Modal */}
            {activeModal === 'receipt' && modalData && (
              <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col max-h-[90vh] pointer-events-auto">
                <div className="p-8 lg:p-12 flex flex-col overflow-hidden h-full">
                  <div className="flex items-center justify-between mb-10 shrink-0">
                    <div>
                      <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-none">Receipt Details</h3>
                      <p className="text-brand-600 font-bold text-sm uppercase tracking-widest mt-2">{modalData.transaction.transaction_number}</p>
                    </div>
                    <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-rose-500 transition-colors p-3 hover:bg-rose-50 rounded-2xl">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                      {/* Left Side: Items List */}
                      <div className="lg:col-span-7 space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Purchased Items</h4>
                          <span className="text-[10px] font-black text-slate-400 uppercase">{modalData.items.length} Items</span>
                        </div>
                        <div className="space-y-4">
                          {modalData.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all">
                              <div className="space-y-1">
                                <p className="font-black text-slate-900 uppercase tracking-tight">{item.product_name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.weight_kg}kg × ₱{(item.subtotal / item.weight_kg).toFixed(2)}</p>
                              </div>
                              <span className="text-lg font-black text-slate-900 tracking-tight">₱{item.subtotal.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right Side: Info & Totals */}
                      <div className="lg:col-span-5 space-y-8">
                        {/* Summary Info */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Date</p>
                            <p className="font-black text-slate-900 text-sm leading-tight">{new Date(modalData.transaction.created_at + ' UTC').toLocaleString()}</p>
                          </div>
                          <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Cashier</p>
                            <p className="font-black text-slate-900 text-sm leading-tight truncate">{modalData.transaction.cashier_name || 'System'}</p>
                          </div>
                          {modalData.transaction.customer_name && (
                            <div className="bg-brand-50/50 p-5 rounded-[1.5rem] border border-brand-100 col-span-2 flex items-center gap-4">
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-600 font-black shadow-sm shrink-0 uppercase">
                                {modalData.transaction.customer_name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-[9px] font-black text-brand-400 uppercase tracking-widest mb-0.5">Customer Name</p>
                                <p className="font-black text-brand-900 text-base uppercase tracking-tight leading-none">{modalData.transaction.customer_name}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Totals Section */}
                        <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-brand-500/20"></div>
                          
                          <div className="space-y-5 relative z-10">
                            <div className="flex justify-between items-center text-slate-400">
                              <span className="text-[10px] font-black uppercase tracking-widest">Subtotal Amount</span>
                              <span className="font-bold text-lg">₱{modalData.transaction.total_amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-400">
                              <span className="text-[10px] font-black uppercase tracking-widest">Amount Received</span>
                              <span className="font-bold text-lg">₱{modalData.transaction.payment_received.toFixed(2)}</span>
                            </div>
                            
                            {modalData.transaction.status !== 'completed' && (
                              <div className="pt-5 border-t border-white/10">
                                <div className="flex justify-between items-center text-rose-400">
                                  <span className="text-[10px] font-black uppercase tracking-widest">Remaining Balance</span>
                                  <span className="text-xl font-black">₱{(modalData.transaction.total_amount - (modalData.transaction.paid_amount || 0)).toFixed(2)}</span>
                                </div>
                              </div>
                            )}

                            <div className="pt-5 border-t border-white/20 flex justify-between items-end">
                              <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Total Change</span>
                                <span className="text-4xl font-black text-emerald-400 tracking-tighter leading-none">₱{modalData.transaction.change_amount.toFixed(2)}</span>
                              </div>
                              <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                {modalData.transaction.status === 'completed' ? 'Fully Paid' : 'Credit'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Dangerous Actions */}
                        <div className="pt-4 border-t border-slate-50">
                          <button 
                            onClick={() => handleDeleteTransaction(modalData.transaction)}
                            className="w-full flex items-center justify-center gap-3 py-4 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl transition-all font-black uppercase tracking-widest text-xs group"
                          >
                            <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            Delete Transaction
                          </button>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center mt-3">
                            * Requires Admin Password Verification
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Add more modals here as needed (Product, Weight, Checkout) */}
            {activeModal === 'product' && modalData && (
              <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.15)] border border-slate-100 relative z-10 max-h-[90vh] flex flex-col overflow-hidden pointer-events-auto">
                <div className="p-8 lg:p-10 overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                      {modalData.editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h3>
                    <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-rose-500 transition-colors p-2 hover:bg-rose-50 rounded-xl">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  
                  <form onSubmit={modalData.onSave} className="space-y-6">
                    {/* Photo Upload Section */}
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Photo</label>
                      <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                          {modalData.formData.image_path ? (
                            <img src={modalData.formData.image_path} className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <input type="file" id="product-photo" onChange={modalData.onPhotoUpload} accept="image/*" className="hidden" />
                          <label htmlFor="product-photo" className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 text-xs font-black uppercase tracking-widest rounded-xl cursor-pointer hover:bg-brand-100 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
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
                        value={modalData.formData.name}
                        onChange={e => modalData.setFormData({...modalData.formData, name: e.target.value})}
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
                          value={modalData.formData.price_per_kg}
                          onChange={e => modalData.setFormData({...modalData.formData, price_per_kg: e.target.value})}
                          className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none font-bold text-slate-900"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button type="button" onClick={() => setActiveModal(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-5 rounded-2xl transition-all uppercase tracking-widest text-sm">Cancel</button>
                      <button type="submit" disabled={modalData.loading} className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-brand-100 transition-all uppercase tracking-widest text-sm">
                        {modalData.loading ? 'Saving...' : 'Save Product'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* 2. Weight Input Modal */}
            {activeModal === 'weight' && modalData && (
              <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.15)] border border-slate-100 relative z-10 max-h-[90vh] flex flex-col overflow-hidden pointer-events-auto">
                <div className="p-10 overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Enter Weight</h3>
                    <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-rose-500 transition-colors p-2 hover:bg-rose-50 rounded-xl">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  <p className="text-slate-500 font-bold text-sm mb-8 uppercase tracking-widest">Item: <span className="text-brand-600">{modalData.product.name}</span></p>
                  
                  <div className="space-y-6">
                    <div className="relative">
                      <input 
                        type="number" 
                        autoFocus
                        value={modalData.weight}
                        onChange={(e) => modalData.setWeight(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none font-black text-2xl text-center"
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-300 uppercase tracking-widest">kg</span>
                    </div>

                    <div className="flex gap-4">
                      <button onClick={() => setActiveModal(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-4 rounded-2xl transition-all uppercase tracking-widest">Cancel</button>
                      <button onClick={modalData.onConfirm} className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-brand-100 transition-all uppercase tracking-widest">Confirm</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Checkout Modal */}
            {activeModal === 'checkout' && modalData && (
              <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.15)] border border-slate-100 relative z-10 max-h-[90vh] flex flex-col overflow-hidden pointer-events-auto animate-modal-in">
                <div className="bg-slate-900 p-8 text-white shrink-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black uppercase tracking-tight">Confirm Payout</h3>
                    <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-6">
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Total Payout</span>
                    <span className="text-3xl font-black text-emerald-400">₱{modalData.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="p-10 space-y-8 text-center overflow-y-auto custom-scrollbar">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Payment Mode</h4>
                      <p className="text-slate-500 font-bold text-[10px] mt-1 uppercase tracking-[0.2em]">How would you like to pay the seller?</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <button 
                      disabled={modalData.loading}
                      onClick={() => modalData.onCheckout('completed')} 
                      className="group flex flex-col items-center justify-center p-6 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-[2rem] border-2 border-emerald-100 hover:border-emerald-500 transition-all active:scale-95 shadow-lg shadow-emerald-900/5"
                    >
                      <span className="text-lg font-black uppercase tracking-widest">Pay Now</span>
                      <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-1">Cash Payment</span>
                    </button>

                    <button 
                      disabled={modalData.loading}
                      onClick={() => modalData.onCheckout('unpaid')} 
                      className="group flex flex-col items-center justify-center p-6 bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white rounded-[2rem] border-2 border-amber-100 hover:border-amber-400 transition-all active:scale-95 shadow-lg shadow-amber-900/5"
                    >
                      <span className="text-lg font-black uppercase tracking-widest">Pay Later</span>
                      <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-1">Record as Credit</span>
                    </button>
                  </div>

                  <button 
                    disabled={modalData.loading}
                    onClick={() => setActiveModal(null)} 
                    className="w-full py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-600 transition-colors"
                  >
                    Cancel Transaction
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
