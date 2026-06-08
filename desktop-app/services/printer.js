const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;
const db = require("./database");
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

/**
 * Helper to format numbers with commas and 2 decimal places
 */
const formatAmount = (num) => {
    return Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Robust execution of printer commands
 * Falls back to raw command line printing if driver is missing
 */
const executePrinter = async (printer, printerName) => {
    // Determine if we are in fallback mode safely
    const isFallbackMode = printer.isFallback || false;
    
    try {
        // Execute writes to the interface (either the printer or the temp file)
        await printer.execute();
        
        // If we are NOT in fallback mode, we are done
        if (!isFallbackMode) {
            return { success: true };
        }
        
        // If we ARE in fallback mode, we now need to send that file to the actual printer
        console.log("Fallback mode active: Sending buffer to printer via CMD...");
    } catch (err) {
        console.warn("Standard printer execution failed, trying fallback:", err.message);
    }

    // --- FALLBACK LOGIC ---
    if (os.platform() === 'win32') {
        try {
            // Get the buffer from the printer
            const buffer = printer.getBuffer();
            const tempFile = path.join(os.tmpdir(), `receipt_${Date.now()}.bin`);
            fs.writeFileSync(tempFile, buffer);
            
            const printerShare = `\\\\localhost\\${printerName}`;
            
            return new Promise((resolve) => {
                console.log(`Trying fallback 1 (copy /b) to ${printerShare}...`);
                exec(`copy /b "${tempFile}" "${printerShare}"`, (error, stdout, stderr) => {
                    if (!error) {
                        console.log("Fallback print via 'copy /b' successful");
                        resolve({ success: true });
                    } else {
                        console.warn("Fallback 1 (copy /b) failed:", stderr || error.message);
                        console.log(`Trying fallback 2 (print /D) to ${printerName}...`);
                        exec(`print /D:"${printerName}" "${tempFile}"`, (error2, stdout2, stderr2) => {
                            if (!error2) {
                                console.log("Fallback print via 'print' successful");
                                resolve({ success: true });
                            } else {
                                console.warn("Fallback 2 (print /D) failed:", stderr2 || error2.message);
                                
                                console.log(`Trying fallback 3 (PowerShell) to ${printerName}...`);
                                const psCommand = `powershell -Command "$bytes = [System.IO.File]::ReadAllBytes('${tempFile}'); [System.IO.File]::WriteAllBytes('\\\\.\\${printerName}', $bytes)"`;
                                exec(psCommand, (error3, stdout3, stderr3) => {
                                    if (!error3) {
                                        console.log("Fallback print via PowerShell successful");
                                        resolve({ success: true });
                                    } else {
                                        console.error("All fallback printing methods failed.");
                                        resolve({ 
                                            success: false, 
                                            error: "Printer found but all raw commands failed. Please ensure the printer is SHARED as '" + printerName + "' in Windows settings." 
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            });
        } catch (fallbackErr) {
            console.error("Fallback error:", fallbackErr);
            return { success: false, error: "Printing failed: " + fallbackErr.message };
        }
    }
    
    return { success: false, error: "Printing failed. Windows OS required for raw fallback." };
};

/**
 * Safe initialization of printer object
 */
const initPrinter = (type, name) => {
    try {
        // Attempt to initialize with the printer driver
        const p = new ThermalPrinter({
            type: type,
            interface: `printer:${name}`,
            characterSet: 'PC437_USA',
            removeSpecialCharacters: false,
            lineCharacter: "=",
            width: 42
        });
        
        // Some versions of the library throw error during constructor, 
        // others might throw during getBuffer() or execute().
        // We do a small test here to see if it's actually working.
        try {
            p.getBuffer();
            p.isFallback = false;
            return p;
        } catch (e) {
            console.warn("Printer driver initialized but failed buffer test. Falling back.");
            throw e;
        }
    } catch (err) {
        console.log("CRITICAL DRIVER MISSING: Using buffer-only fallback mode. Printing will use raw CMD commands.");
        // Fallback: initialize with a dummy interface just to get the buffer/formatting
        // We use a file path as interface to bypass the "No driver set" error
        const tempDummyFile = path.join(os.tmpdir(), `dummy_printer_${Date.now()}.bin`);
        const p = new ThermalPrinter({
            type: type,
            interface: tempDummyFile, 
            characterSet: 'PC437_USA',
            removeSpecialCharacters: false,
            lineCharacter: "=",
            width: 42
        });
        p.isFallback = true;
        return p;
    }
};

/**
 * Print a receipt for a given transaction
 */
const printReceipt = async (transaction, items) => {
    // 1. Get printer settings from database
    const settings = {};
    const rows = await db.all('SELECT * FROM settings WHERE key IN ("printer_name", "printer_type", "shop_name")');
    rows.forEach(row => settings[row.key] = row.value);

    const printerName = settings.printer_name;
    const rawType = settings.printer_type || 'EPSON';
    const printerType = rawType === 'STAR' ? PrinterTypes.STAR : PrinterTypes.EPSON;
    const shopName = settings.shop_name || 'JUNKSHOP POS';

    if (!printerName || printerName.trim() === "") {
        console.warn("Printer name is empty in settings");
        return { success: false, error: "Printer name is not set. Please go to Settings." };
    }

    console.log(`Initializing printer: "${printerName}" with type: ${rawType}`);

    const printer = initPrinter(printerType, printerName);
    
    if (!printer) {
        return { success: false, error: "Could not initialize printer object" };
    }

    try {
        // If transaction is null, it's a test print
        const isTest = !transaction;

        if (isTest) {
            printer.alignCenter();
            printer.println("--------------------------------");
            printer.println("TEST PRINT SUCCESSFUL");
            printer.println("JUNKSHOP POS SYSTEM");
            printer.println("--------------------------------");
            printer.println("Printer: " + printerName);
            printer.println("Type: " + (settings.printer_type || 'EPSON'));
            printer.println("Width: 80mm (42 chars)");
            printer.println("--------------------------------");
            printer.cut();
            
            console.log("Executing test print to:", printerName);
            return await executePrinter(printer, printerName);
        }
        
        // For real receipts, we check connection if possible
        // But for many USB printers on Windows, isPrinterConnected always returns false or true regardless of reality
        // So we'll skip the hard block and just try to execute
        /*
        const isConnected = await printer.isPrinterConnected();
        if (!isConnected) {
            console.warn("Printer not connected, skipping print");
            return { success: false, error: "Printer not connected" };
        }
        */

        printer.alignCenter();
        printer.println(shopName.toUpperCase());
        printer.println("SALES RECEIPT");
        printer.println("------------------------------------------");
        printer.alignLeft();
        printer.println(`No: ${transaction.transaction_number}`);
        printer.println(`Date: ${new Date(transaction.created_at + ' UTC').toLocaleString()}`);
        printer.println(`Customer: ${transaction.customer_name || 'Walk-in'}`);
        
        // Add Status
        const statusText = (transaction.status || 'completed').toUpperCase();
        printer.bold(true);
        printer.println(`STATUS: ${statusText}`);
        printer.bold(false);
        printer.println("------------------------------------------");
        
        printer.tableCustom([
            { text: "Item", align: "LEFT", width: 0.30 },
            { text: "Weight", align: "LEFT", width: 0.35 },
            { text: "Amount", align: "RIGHT", width: 0.33 }
        ]);
        printer.println("------------------------------------------");

        items.forEach(item => {
            const price = item.price_per_kg || (item.weight > 0 ? (item.subtotal / item.weight) : 0);
            printer.tableCustom([
                { text: item.name, align: "LEFT", width: 0.30 },
                { text: `${item.weight}kg x ${formatAmount(price)}`, align: "LEFT", width: 0.35 },
                { text: `P${formatAmount(item.subtotal)}`, align: "RIGHT", width: 0.33 }
            ]);
        });

        printer.println("------------------------------------------");
        printer.alignRight();
        printer.setTextDoubleHeight();
        printer.println(`TOTAL: P${formatAmount(transaction.total_amount)}`);
        printer.setTextNormal();

        if (transaction.status === 'unpaid' || transaction.status === 'partial') {
            printer.alignCenter();
            printer.println("******************************************");
            printer.println("        CREDIT RECEIPT         ");
            printer.println("       (AMOUNT TO BE PAID)     ");
            printer.println("******************************************");
            printer.alignLeft();
            printer.println(`Status: ${transaction.status.toUpperCase()}`);
            printer.println(`Paid: P${formatAmount(transaction.paid_amount || 0)}`);
            printer.println(`Balance: P${formatAmount(transaction.total_amount - (transaction.paid_amount || 0))}`);
        } else {
            // No need to show Payment/Change for completed buy transactions
        }
        
        printer.alignCenter();
        printer.println("------------------------------------------");
        printer.println("THANK YOU! SEE YOU NEXT TIME");
        printer.cut();

        return await executePrinter(printer, printerName);
    } catch (err) {
        console.error("Print error", err);
        return { success: false, error: "Printing failed: " + err.message };
    }
};

async function printPaymentReceipt(data) {
    const { seller, amount, notes, previousBalance, newBalance, originalDate, transactionNumber } = data;

    // 1. Get printer settings from database
    const settings = {};
    const rows = await db.all('SELECT * FROM settings WHERE key IN ("printer_name", "printer_type", "shop_name")');
    rows.forEach(row => settings[row.key] = row.value);

    const printerName = settings.printer_name;
    const printerType = settings.printer_type === 'STAR' ? PrinterTypes.STAR : PrinterTypes.EPSON;
    const shopName = settings.shop_name || 'Junkshop POS';

    if (!printerName) {
        console.warn("Printer name not set in settings, skipping payment receipt print");
        return { success: false, error: "Printer not configured" };
    }

    try {
        const printer = initPrinter(printerType, printerName);

        if (!printer) {
            return { success: false, error: "Could not initialize printer object" };
        }

        // Skip isConnected check for consistency
        
        printer.alignCenter();
        printer.println(shopName.toUpperCase());
        printer.println("PAYMENT RECEIPT");
        printer.println("------------------------------------------");

        printer.alignLeft();
        if (transactionNumber) {
            printer.println(`No: ${transactionNumber}`);
        }
        printer.println(`Customer: ${seller.name}`);
        printer.println(`Original Date: ${new Date(originalDate).toLocaleDateString()}`);
        printer.println(`Payment Date: ${new Date().toLocaleString()}`);
        
        // Add Status
        const paymentStatus = newBalance <= 0 ? 'COMPLETED' : 'PARTIAL';
        printer.bold(true);
        printer.println(`STATUS: ${paymentStatus}`);
        printer.bold(false);
        printer.println("------------------------------------------");

        printer.alignRight();
        printer.println(`Previous Balance: P${formatAmount(previousBalance)}`);
        printer.bold(true);
        printer.println(`AMOUNT PAID: P${formatAmount(amount)}`);
        printer.bold(false);
        printer.println("------------------------------------------");
        printer.println(`REMAINING: P${formatAmount(newBalance)}`);

        if (notes) {
            printer.alignLeft();
            printer.println(`Notes: ${notes}`);
        }

        printer.newLine();
        printer.alignCenter();
        printer.println("------------------------------------------");
        printer.println("THANK YOU! SEE YOU NEXT TIME");
        printer.cut();
        return await executePrinter(printer, printerName);
    } catch (err) {
        console.error("Payment print error", err);
        return { success: false, error: err.message };
    }
}

async function printStatement(sellerId) {
    // 1. Get printer settings
    const settings = {};
    const rows = await db.all('SELECT * FROM settings WHERE key IN ("printer_name", "printer_type", "shop_name")');
    rows.forEach(row => settings[row.key] = row.value);

    const printerName = settings.printer_name;
    const printerType = settings.printer_type === 'STAR' ? PrinterTypes.STAR : PrinterTypes.EPSON;
    const shopName = settings.shop_name || 'Junkshop POS';

    if (!printerName) return { success: false, error: "Printer not configured" };

    const seller = await db.get('SELECT * FROM sellers WHERE id = ?', [sellerId]);
    const transactions = await db.all('SELECT * FROM transactions WHERE seller_id = ? ORDER BY created_at ASC', [sellerId]);
    const payments = await db.all('SELECT * FROM payments WHERE seller_id = ? ORDER BY created_at ASC', [sellerId]);

    try {
        const printer = initPrinter(printerType, printerName);

        if (!printer) {
            return { success: false, error: "Could not initialize printer object" };
        }

        // Skip isConnected check for consistency
        /*
        const isConnected = await printer.isPrinterConnected();
        if (!isConnected) {
            return { success: false, error: `Printer "${printerName}" is offline.` };
        }
        */

        printer.alignCenter();
        printer.println(shopName.toUpperCase());
        printer.println("ACCOUNT STATEMENT");
        printer.bold(true);
        printer.println(seller.name.toUpperCase());
        printer.bold(false);
        printer.println(`Customer: ${seller.name}`);
        printer.println(`Date: ${new Date().toLocaleDateString()}`);
        printer.drawLine();

        printer.alignLeft();
        printer.println("DATE       TYPE    AMOUNT");
        printer.drawLine();

        // Combine and sort by date
        const history = [
            ...transactions.map(t => ({ date: t.created_at, type: 'SALE', amount: t.total_amount })),
            ...payments.map(p => ({ date: p.created_at, type: 'PAY', amount: -p.amount }))
        ].sort((a, b) => new Date(a.date) - new Date(b.date));

        let runningBalance = 0;
        history.forEach(item => {
            runningBalance += item.amount;
            const dateStr = new Date(item.date).toLocaleDateString('en-US', {month:'short', day:'numeric'}).padEnd(10);
            const typeStr = item.type.padEnd(6);
            const amtStr = (item.amount > 0 ? '+' : '') + formatAmount(item.amount).split('.')[0];
            printer.println(`${dateStr} ${typeStr} ${amtStr.padStart(10)}`);
        });

        printer.drawLine();
        printer.alignRight();
        printer.bold(true);
        printer.println(`TOTAL DUE: P${formatAmount(seller.total_balance_owed)}`);
        printer.bold(false);

        printer.newLine();
        printer.alignCenter();
        printer.println("THANK YOU! SEE YOU NEXT TIME");
        printer.cut();
        return await executePrinter(printer, printerName);
    } catch (err) {
        return { success: false, error: err.message };
    }
}

module.exports = {
    printReceipt,
    printPaymentReceipt,
    printStatement
};
