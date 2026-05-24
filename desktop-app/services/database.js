const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

const isDev = !app.isPackaged;
const appDataPath = app.getPath('userData');
const dbDir = path.join(appDataPath, 'junkshop-pos');

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'database.db');
const schemaPath = path.join(__dirname, '../database/schema.sql');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
        // In development, you might want to force re-run seeders if login fails
        initializeDatabase();
    }
});

/**
 * Manually ensure the admin user exists with correct password
 */
async function ensureAdminUser() {
    // We only auto-seed if setup is not yet complete. 
    // Once the user sets up their own account, we stop overriding it.
    const isSetup = await get("SELECT value FROM settings WHERE key = 'is_setup_complete'");
    if (isSetup && isSetup.value === '1') {
        console.log('Setup already complete, skipping default admin seed');
        return;
    }

    const bcrypt = require('bcryptjs');
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    db.run(
        "INSERT OR IGNORE INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)",
        ['admin', hashedPassword, 'Administrator', 'admin'],
        (err) => {
            if (err) console.error('Error ensuring admin user', err);
            else console.log('Default admin user verified');
        }
    );
}

function initializeDatabase() {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema, (err) => {
        if (err) {
            console.error('Error initializing database schema', err);
        } else {
            console.log('Database schema initialized');
            
            // Migrations for Credit Management
            const migrations = [
                "ALTER TABLE transactions ADD COLUMN customer_name TEXT",
                "ALTER TABLE transactions ADD COLUMN cashier_name TEXT",
                "ALTER TABLE transactions ADD COLUMN seller_id INTEGER",
                "ALTER TABLE transactions ADD COLUMN paid_amount REAL DEFAULT 0",
                "ALTER TABLE transactions ADD COLUMN paid_at TIMESTAMP",
                `CREATE TABLE IF NOT EXISTS payments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    seller_id INTEGER,
                    amount REAL NOT NULL,
                    previous_balance REAL NOT NULL,
                    new_balance REAL NOT NULL,
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(seller_id) REFERENCES sellers(id)
                )`,
                "ALTER TABLE license ADD COLUMN is_master INTEGER DEFAULT 0"
            ];

            migrations.forEach(sql => {
                db.run(sql, (err) => {
                    if (err && !err.message.includes("duplicate column name")) {
                        console.error('Migration error:', err.message);
                    }
                });
            });

            ensureAdminUser();
        }
    });
}

/**
 * Generic run query for INSERT/UPDATE/DELETE
 */
const run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                console.error('Error running sql ' + sql);
                console.error(err);
                reject(err);
            } else {
                resolve({ id: this.lastID, changes: this.changes });
            }
        });
    });
};

/**
 * Generic get query for single row
 */
const get = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, result) => {
            if (err) {
                console.error('Error running sql: ' + sql);
                console.error(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

/**
 * Generic all query for multiple rows
 */
const all = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('Error running sql: ' + sql);
                console.error(err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

/**
 * Transaction wrapper
 */
const transaction = (queries) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            try {
                queries.forEach(({ sql, params }) => {
                    db.run(sql, params);
                });
                db.run('COMMIT', (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            } catch (err) {
                db.run('ROLLBACK');
                reject(err);
            }
        });
    });
};

module.exports = {
    db,
    run,
    get,
    all,
    transaction
};
