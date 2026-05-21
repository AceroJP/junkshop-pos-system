const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Add IPC methods here for DB, Printer, etc.
  activateLicense: (key) => ipcRenderer.invoke('activate-license', key),
  getProducts: () => ipcRenderer.invoke('get-products'),
  saveTransaction: (data) => ipcRenderer.invoke('save-transaction', data),
});
