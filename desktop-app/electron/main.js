const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { initDb, db } = require('../services/dbService');
const isDev = !app.isPackaged;

// Initialize Database
initDb();

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextBridge: true
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:3000');
    // win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// IPC Handlers for Database
ipcMain.handle('get-products', async () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
});

ipcMain.handle('save-transaction', async (event, transactionData) => {
  const { total, items } = transactionData;
  
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      db.run("INSERT INTO transactions (total) VALUES (?)", [total], function(err) {
        if (err) {
          db.run("ROLLBACK");
          reject(err);
          return;
        }

        const transactionId = this.lastID;
        const stmt = db.prepare("INSERT INTO transaction_items (transaction_id, product_id, weight, subtotal) VALUES (?, ?, ?, ?)");
        
        items.forEach(item => {
          stmt.run(transactionId, item.id, item.weight, item.subtotal);
        });

        stmt.finalize((err) => {
          if (err) {
            db.run("ROLLBACK");
            reject(err);
          } else {
            db.run("COMMIT");
            resolve({ success: true, transactionId });
          }
        });
      });
    });
  });
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
