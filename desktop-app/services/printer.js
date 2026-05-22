const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;
const db = require("./database");

/**
 * Print a receipt for a given transaction
 */
const printReceipt = async (transaction, items) => {
    // 1. Get printer settings from database
    const settings = {};
    const rows = await db.all('SELECT * FROM settings WHERE key IN ("printer_name", "printer_type")');
    rows.forEach(row => settings[row.key] = row.value);

    const printerName = settings.printer_name;
    const printerType = settings.printer_type === 'STAR' ? PrinterTypes.STAR : PrinterTypes.EPSON;

    if (!printerName) {
        console.warn("Printer name not set in settings, skipping print");
        return { success: false, error: "Printer not configured" };
    }

    let printer;
    try {
        printer = new ThermalPrinter({
            type: printerType,
            interface: `printer:${printerName}`,
            characterSet: 'SLOVENIA',
            removeSpecialCharacters: false,
            lineCharacter: "=",
            width: 32
        });
    } catch (err) {
        console.error("Failed to initialize printer driver:", err.message);
        return { success: false, error: "Printer driver error: " + err.message };
    }

    try {
        // If transaction is null, it's a test print
        const isTest = !transaction;

        if (isTest) {
            printer.alignCenter();
            printer.println("TEST PRINT SUCCESSFUL");
            printer.println("Printer: " + printerName);
            printer.println("Type: " + (settings.printer_type || 'EPSON'));
            printer.println("================================");
            printer.cut();
            await printer.execute();
            return { success: true };
        }

        const isConnected = await printer.isPrinterConnected();
        if (!isConnected) {
            console.warn("Printer not connected, skipping print");
            return { success: false, error: "Printer not connected" };
        }

        printer.alignCenter();
        printer.println("JUNKSHOP POS");
        printer.println("SALES RECEIPT");
        printer.println("================================");
        printer.alignLeft();
        printer.println(`No: ${transaction.transaction_number}`);
        printer.println(`Date: ${new Date(transaction.created_at + ' UTC').toLocaleString()}`);
        printer.println(`Customer: ${transaction.customer_name || 'Walk-in'}`);
        
        // Add Status
        const statusText = (transaction.status || 'completed').toUpperCase();
        printer.bold(true);
        printer.println(`STATUS: ${statusText}`);
        printer.bold(false);
        printer.println("--------------------------------");
        
        printer.tableCustom([
            { text: "Item", align: "LEFT", width: 0.5 },
            { text: "Weight", align: "CENTER", width: 0.2 },
            { text: "Amount", align: "RIGHT", width: 0.3 }
        ]);

        items.forEach(item => {
            printer.tableCustom([
                { text: item.name, align: "LEFT", width: 0.5 },
                { text: `${item.weight}kg`, align: "CENTER", width: 0.2 },
                { text: `₱${item.subtotal.toFixed(2)}`, align: "RIGHT", width: 0.3 }
            ]);
        });

        printer.println("--------------------------------");
        printer.alignRight();
        printer.setTextDoubleHeight();
        printer.println(`TOTAL: ₱${transaction.total_amount.toFixed(2)}`);
        printer.setTextNormal();

        if (transaction.status === 'unpaid' || transaction.status === 'partial') {
            printer.alignCenter();
            printer.println("********************************");
            printer.println("        CREDIT RECEIPT         ");
            printer.println("       (AMOUNT TO BE PAID)     ");
            printer.println("********************************");
            printer.alignLeft();
            printer.println(`Status: ${transaction.status.toUpperCase()}`);
            printer.println(`Paid: ₱${(transaction.paid_amount || 0).toFixed(2)}`);
            printer.println(`Balance: ₱${(transaction.total_amount - (transaction.paid_amount || 0)).toFixed(2)}`);
        } else {
            // Only show Payment and Change if it was a cash sale (completed)
            if (transaction.status === 'completed') {
                printer.println(`Payment: ₱${transaction.payment_received.toFixed(2)}`);
                printer.println(`Change: ₱${transaction.change_amount.toFixed(2)}`);
            }
        }
        
        printer.alignCenter();
        printer.println("================================");
        printer.println("THANK YOU FOR YOUR BUSINESS!");
        printer.cut();

        await printer.execute();
        return { success: true };
    } catch (err) {
        console.error("Print error", err);
        return { success: false, error: err.message };
    }
};

async function printPaymentReceipt(data) {
    const { seller, amount, notes, previousBalance, newBalance, originalDate } = data;

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

    let printer;
    try {
        printer = new ThermalPrinter({
            type: printerType,
            interface: `printer:${printerName}`,
            characterSet: 'SLOVENIA',
            removeSpecialCharacters: false,
            lineCharacter: "=",
            width: 32
        });
    } catch (err) {
        console.error("Failed to initialize printer driver for payment receipt:", err.message);
        return { success: false, error: "Printer driver error: " + err.message };
    }

    try {
        printer.alignCenter();
        printer.println(shopName.toUpperCase());
        printer.println("PAYMENT RECEIPT");
        printer.drawLine();

        printer.alignLeft();
        printer.println(`Seller: ${seller.name}`);
        printer.println(`Original Date: ${new Date(originalDate).toLocaleDateString()}`);
        printer.println(`Payment Date: ${new Date().toLocaleString()}`);
        
        // Add Status
        const paymentStatus = newBalance <= 0 ? 'COMPLETED' : 'PARTIAL';
        printer.bold(true);
        printer.println(`STATUS: ${paymentStatus}`);
        printer.bold(false);
        printer.drawLine();

        printer.alignRight();
        printer.println(`Previous Balance: P${previousBalance.toFixed(2)}`);
        printer.bold(true);
        printer.println(`AMOUNT PAID: P${amount.toFixed(2)}`);
        printer.bold(false);
        printer.drawLine();
        printer.println(`REMAINING: P${newBalance.toFixed(2)}`);

        if (notes) {
            printer.alignLeft();
            printer.println(`Notes: ${notes}`);
        }

        printer.newLine();
        printer.alignCenter();
        printer.println("Thank you for your business!");
        printer.cut();

        await printer.execute();
        return { success: true };
    } catch (err) {
        console.error("Payment Receipt Print Error:", err);
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

    let printer;
    try {
        printer = new ThermalPrinter({
            type: printerType,
            interface: `printer:${printerName}`,
            width: 32
        });
    } catch (err) { return { success: false, error: err.message }; }

    try {
        printer.alignCenter();
        printer.println(shopName.toUpperCase());
        printer.println("ACCOUNT STATEMENT");
        printer.bold(true);
        printer.println(seller.name.toUpperCase());
        printer.bold(false);
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
            const amtStr = (item.amount > 0 ? '+' : '') + item.amount.toFixed(0);
            printer.println(`${dateStr} ${typeStr} ${amtStr.padStart(10)}`);
        });

        printer.drawLine();
        printer.alignRight();
        printer.bold(true);
        printer.println(`TOTAL DUE: P${seller.total_balance_owed.toFixed(2)}`);
        printer.bold(false);

        printer.newLine();
        printer.cut();
        await printer.execute();
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

module.exports = {
    printReceipt,
    printPaymentReceipt,
    printStatement
};
