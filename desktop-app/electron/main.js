const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

// Import Services
const db = require('../services/database');
const license = require('../services/license');
const auth = require('../services/auth');
const printer = require('../services/printer');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 1000,
        minHeight: 700,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:3001'); // Updated to 3001
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Optional: Open DevTools in dev mode
    if (isDev) {
        // mainWindow.webContents.openDevTools();
    }
}

// --- IPC HANDLERS ---

// License Handlers
ipcMain.handle('get-fingerprint', async () => {
    return license.getFingerprint();
});

ipcMain.handle('activate-license', async (event, key) => {
    return await license.activateLicense(key);
});

ipcMain.handle('check-license', async () => {
    return await license.checkLocalLicense();
});

// Product Handlers
ipcMain.handle('get-products', async () => {
    return await db.all('SELECT * FROM products ORDER BY is_active DESC, name ASC');
});

ipcMain.handle('save-product', async (event, data) => {
    try {
        const { id, name, price_per_kg, image_path } = data;
        if (id) {
            // Update
            await db.run(
                'UPDATE products SET name = ?, price_per_kg = ?, image_path = ? WHERE id = ?',
                [name, price_per_kg, image_path, id]
            );
        } else {
            // Insert
            await db.run(
                'INSERT INTO products (name, price_per_kg, image_path) VALUES (?, ?, ?)',
                [name, price_per_kg, image_path]
            );
        }
        return { success: true };
    } catch (err) {
        console.error('Save product failed', err);
        return { success: false, error: err.message };
    }
});

ipcMain.handle('delete-product', async (event, id) => {
    try {
        await db.run('DELETE FROM products WHERE id = ?', [id]);
        return { success: true };
    } catch (err) {
        console.error('Delete product failed', err);
        return { success: false, error: err.message };
    }
});

ipcMain.handle('toggle-product-status', async (event, id) => {
    try {
        await db.run(
            'UPDATE products SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ?',
            [id]
        );
        return { success: true };
    } catch (err) {
        console.error('Toggle status failed', err);
        return { success: false };
    }
});

// Transaction Handlers
ipcMain.handle('get-transactions', async () => {
    try {
        return await db.all('SELECT t.*, u.full_name as cashier_name FROM transactions t LEFT JOIN users u ON t.cashier_id = u.id ORDER BY t.created_at DESC');
    } catch (err) {
        console.error('Fetch transactions failed', err);
        return [];
    }
});

ipcMain.handle('get-transaction-items', async (event, transactionId) => {
    try {
        return await db.all('SELECT ti.*, p.name as product_name FROM transaction_items ti JOIN products p ON ti.product_id = p.id WHERE ti.transaction_id = ?', [transactionId]);
    } catch (err) {
        console.error('Fetch transaction items failed', err);
        return [];
    }
});

ipcMain.handle('reprint-receipt', async (event, transactionId) => {
    try {
        const transaction = await db.get('SELECT * FROM transactions WHERE id = ?', [transactionId]);
        const items = await db.all('SELECT ti.*, p.name FROM transaction_items ti JOIN products p ON ti.product_id = p.id WHERE ti.transaction_id = ?', [transactionId]);
        
        // Map items to the format expected by printer service
        const formattedItems = items.map(item => ({
            name: item.name,
            weight: item.weight_kg,
            subtotal: item.subtotal
        }));

        await printer.printReceipt(transaction, formattedItems);
        return { success: true };
    } catch (err) {
        console.error('Reprint failed', err);
        return { success: false, error: err.message };
    }
});

ipcMain.handle('save-transaction', async (event, transactionData) => {
    const { total_amount, payment_received, change_amount, items, cashier_id, customer_name } = transactionData;
    const transaction_number = `TXN-${Date.now()}`;

    try {
        // For now, let's use a serial approach
        const txn = await db.run(
            'INSERT INTO transactions (transaction_number, cashier_id, customer_name, total_amount, payment_received, change_amount) VALUES (?, ?, ?, ?, ?, ?)',
            [transaction_number, cashier_id, customer_name || null, total_amount, payment_received, change_amount]
        );

        const transactionId = txn.id;

        for (const item of items) {
            await db.run(
                'INSERT INTO transaction_items (transaction_id, product_id, weight_kg, subtotal) VALUES (?, ?, ?, ?)',
                [transactionId, item.id, item.weight, item.subtotal]
            );
        }

        // Add to print queue
        await db.run('INSERT INTO print_queue (transaction_id) VALUES (?)', [transactionId]);

        // Attempt immediate printing
        try {
            const fullTransaction = await db.get('SELECT * FROM transactions WHERE id = ?', [transactionId]);
            await printer.printReceipt(fullTransaction, items);
        } catch (printErr) {
            console.error('Immediate printing failed, item stays in queue', printErr);
        }

        return { success: true, transactionId, transaction_number };
    } catch (err) {
        console.error('Transaction failed', err);
        return { success: false, error: err.message };
    }
});

ipcMain.handle('get-printers', async () => {
    return await mainWindow.webContents.getPrintersAsync();
});

ipcMain.handle('save-pdf', async (event, { filename, base64Data }) => {
    const { dialog } = require('electron');
    const fs = require('fs');
    
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
        title: 'Save Receipt PDF',
        defaultPath: filename,
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
    });

    if (filePath) {
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(filePath, buffer);
        return { success: true, filePath };
    }
    return { success: false };
});

// Settings Handlers
ipcMain.handle('get-settings', async () => {
    const rows = await db.all('SELECT * FROM settings');
    const settings = {};
    rows.forEach(row => {
        settings[row.key] = row.value;
    });
    return settings;
});

ipcMain.handle('save-setting', async (event, key, value) => {
    return await db.run('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)', [key, value]);
});

ipcMain.handle('complete-setup', async (event, setupData) => {
    const { shopName, shopLogo, username, password, fullName } = setupData;
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        // 1. Save shop settings
        await db.run('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)', ['shop_name', shopName]);
        await db.run('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)', ['shop_logo', shopLogo]);
        
        // 2. Clear existing users and create the main account
        await db.run('DELETE FROM users');
        await db.run('INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)', [username, hashedPassword, fullName, 'admin']);
        
        // 3. Mark setup as complete
        await db.run('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)', ['is_setup_complete', '1']);
        
        return { success: true };
    } catch (err) {
        console.error('Setup failed', err);
        return { success: false, error: err.message };
    }
});

// Auth Handlers
ipcMain.handle('login', async (event, { username, password }) => {
    return await auth.login(username, password);
});

ipcMain.handle('logout', async () => {
    return auth.logout();
});

// App lifecycle
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
