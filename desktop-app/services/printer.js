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
        printer.setTextDoubleHeight();
        printer.setTextDoubleWidth();
        printer.println("JUNKSHOP POS");
        printer.setTextNormal();
        printer.println("================================");
        printer.alignLeft();
        printer.println(`Date: ${new Date(transaction.created_at + ' UTC').toLocaleString()}`);
        printer.println(`Trans #: ${transaction.transaction_number}`);
        
        if (transaction.customer_name) {
            printer.println("--------------------------------");
            let name = transaction.customer_name;
            if (name.length > 50) name = name.substring(0, 47) + "...";
            printer.println(`Customer: ${name}`);
        }
        
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
            printer.println(`Received: ₱${transaction.payment_received.toFixed(2)}`);
            printer.println(`Change: ₱${transaction.change_amount.toFixed(2)}`);
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

/**
 * Print a payment receipt when a seller is paid
 */
const printPaymentReceipt = async (paymentData) => {
    const { seller, amount, notes, newBalance } = paymentData;
    
    // 1. Get printer settings from database
    const settings = {};
    const rows = await db.all('SELECT * FROM settings WHERE key IN ("printer_name", "printer_type")');
    rows.forEach(row => settings[row.key] = row.value);

    const printerName = settings.printer_name;
    const printerType = settings.printer_type === 'STAR' ? PrinterTypes.STAR : PrinterTypes.EPSON;

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
        printer.setTextDoubleHeight();
        printer.setTextDoubleWidth();
        printer.println("JUNKSHOP POS");
        printer.setTextNormal();
        printer.println("================================");
        printer.println("        PAYMENT RECEIPT        ");
        printer.println("================================");
        
        printer.alignLeft();
        printer.println(`Date: ${new Date().toLocaleString()}`);
        printer.println(`Seller: ${seller.name}`);
        printer.println("--------------------------------");
        
        printer.alignRight();
        printer.setTextDoubleHeight();
        printer.println(`PAID: ₱${amount.toFixed(2)}`);
        printer.setTextNormal();
        printer.println(`Remaining: ₱${newBalance.toFixed(2)}`);
        
        if (notes) {
            printer.alignLeft();
            printer.println("--------------------------------");
            printer.println(`Notes: ${notes}`);
        }
        
        printer.alignCenter();
        printer.println("--------------------------------");
        printer.println("\n\n________________\nSeller Signature");
        printer.println("\nTHANK YOU!");
        printer.cut();

        await printer.execute();
        return { success: true };
    } catch (err) {
        console.error("Print payment receipt error", err);
        return { success: false, error: err.message };
    }
};

module.exports = {
    printReceipt,
    printPaymentReceipt
};
