-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'cashier')) NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price_per_kg REAL NOT NULL,
    image_path TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_number TEXT UNIQUE NOT NULL,
    cashier_id INTEGER,
    customer_name TEXT,
    total_amount REAL NOT NULL,
    payment_received REAL NOT NULL,
    change_amount REAL NOT NULL,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(cashier_id) REFERENCES users(id)
);

-- Transaction items table
CREATE TABLE IF NOT EXISTS transaction_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER,
    product_id INTEGER,
    weight_kg REAL NOT NULL,
    subtotal REAL NOT NULL,
    FOREIGN KEY(transaction_id) REFERENCES transactions(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
);

-- License table
CREATE TABLE IF NOT EXISTS license (
    id INTEGER PRIMARY KEY CHECK(id = 1),
    license_key TEXT,
    device_id TEXT,
    activated_at TIMESTAMP,
    is_valid INTEGER DEFAULT 0
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial settings for setup status
INSERT OR IGNORE INTO settings (key, value) VALUES ('is_setup_complete', '0');
INSERT OR IGNORE INTO settings (key, value) VALUES ('shop_name', 'My Junkshop');
INSERT OR IGNORE INTO settings (key, value) VALUES ('shop_logo', '');

-- Print queue table
CREATE TABLE IF NOT EXISTS print_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER,
    status TEXT DEFAULT 'pending',
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(transaction_id) REFERENCES transactions(id)
);

-- Default admin user (password: admin123)
-- Hash generated using bcrypt: $2a$10$7R6v7u.8aK/x6H/t1aH/uO8v8aK/x6H/t1aH/uO8v8aK/x6H/t1aH
INSERT OR IGNORE INTO users (username, password, full_name, role) 
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgNoUq96.Y2NJ96.x1vTj.3I4.u.', 'Administrator', 'admin');

-- Default license record
INSERT OR IGNORE INTO license (id, is_valid) VALUES (1, 0);
