const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { app } = require('electron');

// Use user data directory for production, or local folder for dev
const dbPath = app.isPackaged 
  ? path.join(app.getPath('userData'), 'local.sqlite')
  : path.join(__dirname, '../database/local.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Database opening error: ', err);
});

/**
 * Initialize database tables
 */
const initDb = () => {
  db.serialize(() => {
    // Products table
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price_per_kg REAL NOT NULL,
      image TEXT
    )`);

    // Transactions table
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total REAL NOT NULL,
      date TEXT DEFAULT CURRENT_TIMESTAMP,
      cashier_id INTEGER
    )`);

    // Transaction items table
    db.run(`CREATE TABLE IF NOT EXISTS transaction_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id INTEGER,
      product_id INTEGER,
      weight REAL NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY(transaction_id) REFERENCES transactions(id)
    )`);

    // Seed initial products if empty
    db.get("SELECT count(*) as count FROM products", (err, row) => {
      if (row.count === 0) {
        const stmt = db.prepare("INSERT INTO products (name, price_per_kg) VALUES (?, ?)");
        stmt.run("Copper Wire", 350);
        stmt.run("Aluminum", 65);
        stmt.run("Iron / Steel", 14);
        stmt.run("Plastic Bottles", 8);
        stmt.run("Cardboard", 5);
        stmt.finalize();
      }
    });
  });
};

module.exports = {
  db,
  initDb
};
