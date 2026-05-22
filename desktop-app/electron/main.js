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

ipcMain.handle('check-update', async () => {
    return await license.checkUpdate();
});

ipcMain.handle('get-app-version', async () => {
    return app.getVersion();
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
    const { total_amount, payment_received, change_amount, items, cashier_id, customer_name, status, seller_id } = transactionData;
    const transaction_number = `TXN-${Date.now()}`;
    const paymentStatus = status || 'completed';

    try {
        let finalSellerId = seller_id;

        // If Pay Later or customer name provided, ensure seller exists
        if (customer_name) {
            const existingSeller = await db.get('SELECT id FROM sellers WHERE name = ?', [customer_name]);
            if (existingSeller) {
                finalSellerId = existingSeller.id;
            } else {
                const newSeller = await db.run('INSERT INTO sellers (name) VALUES (?)', [customer_name]);
                finalSellerId = newSeller.id;
            }
        }

        const txn = await db.run(
            'INSERT INTO transactions (transaction_number, cashier_id, customer_name, seller_id, total_amount, payment_received, change_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [transaction_number, cashier_id, customer_name || null, finalSellerId || null, total_amount, payment_received, change_amount, paymentStatus]
        );

        const transactionId = txn.id;

        for (const item of items) {
            await db.run(
                'INSERT INTO transaction_items (transaction_id, product_id, weight_kg, subtotal) VALUES (?, ?, ?, ?)',
                [transactionId, item.id, item.weight, item.subtotal]
            );
        }

        // If unpaid, update seller balance
        if (paymentStatus === 'unpaid' && finalSellerId) {
            await db.run(
                'UPDATE sellers SET total_balance_owed = total_balance_owed + ?, last_transaction_date = CURRENT_TIMESTAMP WHERE id = ?',
                [total_amount, finalSellerId]
            );
        } else if (finalSellerId) {
            await db.run(
                'UPDATE sellers SET last_transaction_date = CURRENT_TIMESTAMP WHERE id = ?',
                [finalSellerId]
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

// Sellers Handlers
ipcMain.handle('get-sellers', async (event, { search = '', filter = 'all' }) => {
    try {
        let sql = 'SELECT * FROM sellers WHERE total_balance_owed > 0';
        const params = [];

        if (search) {
            sql += ' AND name LIKE ?';
            params.push(`%${search}%`);
        }

        sql += ' ORDER BY total_balance_owed DESC, name ASC';
        return await db.all(sql, params);
    } catch (err) {
        console.error('Fetch sellers failed', err);
        return [];
    }
});

ipcMain.handle('get-seller-details', async (event, id) => {
    try {
        return await db.get('SELECT * FROM sellers WHERE id = ?', [id]);
    } catch (err) {
        console.error('Fetch seller details failed', err);
        return null;
    }
});

ipcMain.handle('get-seller-transactions', async (event, id) => {
    try {
        return await db.all('SELECT * FROM transactions WHERE seller_id = ? ORDER BY created_at DESC', [id]);
    } catch (err) {
        console.error('Fetch seller transactions failed', err);
        return [];
    }
});

ipcMain.handle('record-payment', async (event, { seller_id, amount, notes }) => {
    try {
        // 1. Get seller balance
        const seller = await db.get('SELECT total_balance_owed FROM sellers WHERE id = ?', [seller_id]);
        if (!seller || seller.total_balance_owed < amount) {
            return { success: false, error: 'Invalid amount or seller' };
        }

        // 2. Find unpaid transactions for this seller to mark as paid
        const unpaidTransactions = await db.all('SELECT * FROM transactions WHERE seller_id = ? AND status = "unpaid" ORDER BY created_at ASC', [seller_id]);
        
        let remainingToPay = amount;
        for (const txn of unpaidTransactions) {
            if (remainingToPay <= 0) break;

            const txnOwed = txn.total_amount - (txn.paid_amount || 0);
            if (remainingToPay >= txnOwed) {
                // Fully pay this txn
                await db.run(
                    'UPDATE transactions SET status = "completed", paid_amount = total_amount, paid_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [txn.id]
                );
                remainingToPay -= txnOwed;
            } else {
                // Partially pay this txn
                await db.run(
                    'UPDATE transactions SET status = "partial", paid_amount = paid_amount + ?, paid_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [remainingToPay, txn.id]
                );
                remainingToPay = 0;
            }
        }

        // 3. Update seller balance
        await db.run(
            'UPDATE sellers SET total_balance_owed = total_balance_owed - ? WHERE id = ?',
            [amount, seller_id]
        );

        // 4. Print payment receipt
        try {
            const updatedSeller = await db.get('SELECT * FROM sellers WHERE id = ?', [seller_id]);
            const printResult = await printer.printPaymentReceipt({ 
                seller: updatedSeller, 
                amount: amount, 
                notes: notes,
                newBalance: updatedSeller.total_balance_owed
            });
            return { success: true, printSuccess: printResult.success, error: printResult.error };
        } catch (printErr) {
            console.error('Payment receipt printing failed', printErr);
            return { success: true, printSuccess: false, error: printErr.message };
        }
    } catch (err) {
        console.error('Record payment failed', err);
        return { success: false, error: err.message };
    }
});

ipcMain.handle('update-seller-info', async (event, { id, contact_number, address }) => {
    try {
        await db.run(
            'UPDATE sellers SET contact_number = ?, address = ? WHERE id = ?',
            [contact_number, address, id]
        );
        return { success: true };
    } catch (err) {
        console.error('Update seller failed', err);
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

ipcMain.handle('save-excel', async (event, { filename, base64Data }) => {
    const { dialog } = require('electron');
    const fs = require('fs');
    
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
        title: 'Export Report to Excel',
        defaultPath: filename,
        filters: [{ name: 'Excel Files', extensions: ['xlsx'] }]
    });

    if (filePath) {
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(filePath, buffer);
        return { success: true, filePath };
    }
    return { success: false };
});

ipcMain.handle('get-report-stats', async (event, { period }) => {
    try {
        let dateFilter = "";
        if (period === 'today') {
            dateFilter = "date(created_at) = date('now')";
        } else if (period === 'week') {
            dateFilter = "date(created_at) >= date('now', '-7 days')";
        } else if (period === 'month') {
            dateFilter = "date(created_at) >= date('now', 'start of month')";
        } else if (period === 'year') {
            dateFilter = "date(created_at) >= date('now', 'start of year')";
        } else {
            dateFilter = "1=1"; // Overall
        }

        // 1. Total Purchases
        const purchases = await db.get(`SELECT SUM(total_amount) as total FROM transactions WHERE ${dateFilter}`);
        
        // 2. Sales by Product (Chart Data)
        const salesByProduct = await db.all(`
            SELECT p.name, SUM(ti.weight_kg) as total_weight, SUM(ti.subtotal) as total_amount 
            FROM transaction_items ti 
            JOIN products p ON ti.product_id = p.id 
            JOIN transactions t ON ti.transaction_id = t.id
            WHERE ${dateFilter.replace(/created_at/g, 't.created_at')}
            GROUP BY p.id 
            ORDER BY total_amount DESC
        `);

        // 3. Transactions for the period
        const transactions = await db.all(`
            SELECT t.*, u.full_name as cashier_name 
            FROM transactions t 
            LEFT JOIN users u ON t.cashier_id = u.id 
            WHERE ${dateFilter.replace(/created_at/g, 't.created_at')}
            ORDER BY t.created_at DESC
        `);

        return {
            success: true,
            totalPurchases: purchases.total || 0,
            salesByProduct,
            transactions
        };
    } catch (err) {
        console.error('Report stats failed', err);
        return { success: false, error: err.message };
    }
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
    const { Menu } = require('electron');
    Menu.setApplicationMenu(null);
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
