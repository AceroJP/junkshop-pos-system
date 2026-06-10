const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    // License
    getFingerprint: () => ipcRenderer.invoke('get-fingerprint'),
    activateLicense: (key) => ipcRenderer.invoke('activate-license', key),
    checkLicense: () => ipcRenderer.invoke('check-license'),
    checkUpdate: () => ipcRenderer.invoke('check-update'),
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),

    // Auth
    login: (credentials) => ipcRenderer.invoke('login', credentials),
    resetPasswordWithMasterKey: (data) => ipcRenderer.invoke('reset-password-with-master-key', data),
    verifyAdminPassword: (password) => ipcRenderer.invoke('verify-admin-password', password),
    getAdminInfo: (secretCode) => ipcRenderer.invoke('get-admin-info', secretCode),
    resetAdminAccount: (data) => ipcRenderer.invoke('reset-admin-account', data),
    logout: () => ipcRenderer.invoke('logout'),
    getCurrentUser: () => ipcRenderer.invoke('get-current-user'),
    updateAccount: (data) => ipcRenderer.invoke('update-account', data),

    // Products
    getProducts: () => ipcRenderer.invoke('get-products'),
    saveProduct: (data) => ipcRenderer.invoke('save-product', data),
    deleteProduct: (id) => ipcRenderer.invoke('delete-product', id),
    toggleProductStatus: (id) => ipcRenderer.invoke('toggle-product-status', id),

    // Transactions
    saveTransaction: (data) => ipcRenderer.invoke('save-transaction', data),
    getTransactions: () => ipcRenderer.invoke('get-transactions'),
    getTransactionItems: (id) => ipcRenderer.invoke('get-transaction-items', id),
    deleteTransaction: (id) => ipcRenderer.invoke('delete-transaction', id),
    reprintReceipt: (id) => ipcRenderer.invoke('reprint-receipt', id),
    savePDF: (data) => ipcRenderer.invoke('save-pdf', data),
    saveExcel: (data) => ipcRenderer.invoke('save-excel', data),
    getReportStats: (filters) => ipcRenderer.invoke('get-report-stats', filters),
    getTransactionDates: () => ipcRenderer.invoke('get-transaction-dates'),
    openExternal: (url) => ipcRenderer.invoke('open-external', url),

    // Sellers & Credit
    getSellers: (params) => ipcRenderer.invoke('get-sellers', params),
    getSellerDetails: (id) => ipcRenderer.invoke('get-seller-details', id),
    recordPayment: (data) => ipcRenderer.invoke('record-payment', data),
    getPayments: (sellerId) => ipcRenderer.invoke('get-payments', sellerId),
    updateSellerInfo: (data) => ipcRenderer.invoke('update-seller-info', data),
    deleteSeller: (id) => ipcRenderer.invoke('delete-seller', id),
    getSellerTransactions: (id) => ipcRenderer.invoke('get-seller-transactions', id),

    // Settings
    getSettings: () => ipcRenderer.invoke('get-settings'),
    saveSetting: (key, value) => ipcRenderer.invoke('save-setting', key, value),
    getPrinters: () => ipcRenderer.invoke('get-printers'),
    completeSetup: (data) => ipcRenderer.invoke('complete-setup', data),
});
