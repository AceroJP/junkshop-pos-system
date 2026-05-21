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

    const printerName = settings.printer_name || 'Thermal Printer';
    const printerType = settings.printer_type === 'STAR' ? PrinterTypes.STAR : PrinterTypes.EPSON;

    let printer = new ThermalPrinter({
        type: printerType,
        interface: `printer:${printerName}`,
        characterSet: 'SLOVENIA',
        removeSpecialCharacters: false,
        lineCharacter: "=",
        width: 32
    });

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
        printer.println(`Received: ₱${transaction.payment_received.toFixed(2)}`);
        printer.println(`Change: ₱${transaction.change_amount.toFixed(2)}`);
        
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

module.exports = {
    printReceipt
};
