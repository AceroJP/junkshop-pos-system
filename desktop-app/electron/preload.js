const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    // License
    getFingerprint: () => ipcRenderer.invoke('get-fingerprint'),
    activateLicense: (key) => ipcRenderer.invoke('activate-license', key),
    checkLicense: () => ipcRenderer.invoke('check-license'),

    // Auth
    login: (credentials) => ipcRenderer.invoke('login', credentials),
    logout: () => ipcRenderer.invoke('logout'),

    // Products
    getProducts: () => ipcRenderer.invoke('get-products'),
    saveProduct: (data) => ipcRenderer.invoke('save-product', data),
    deleteProduct: (id) => ipcRenderer.invoke('delete-product', id),
    toggleProductStatus: (id) => ipcRenderer.invoke('toggle-product-status', id),

    // Transactions
    saveTransaction: (data) => ipcRenderer.invoke('save-transaction', data),
    getTransactions: () => ipcRenderer.invoke('get-transactions'),
    getTransactionItems: (id) => ipcRenderer.invoke('get-transaction-items', id),
    reprintReceipt: (id) => ipcRenderer.invoke('reprint-receipt', id),
    savePDF: (data) => ipcRenderer.invoke('save-pdf', data),

    // Settings
    getSettings: () => ipcRenderer.invoke('get-settings'),
    saveSetting: (key, value) => ipcRenderer.invoke('save-setting', key, value),
    getPrinters: () => ipcRenderer.invoke('get-printers'),
    completeSetup: (data) => ipcRenderer.invoke('complete-setup', data),
});
