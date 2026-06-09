const bcrypt = require('bcryptjs');
const db = require('./database');
const crypto = require('crypto');
const { machineIdSync } = require('node-machine-id');

let currentUser = null;

// The single hardcoded secret code for the service provider
const MASTER_SECRET_CODE = 'B#7kLp@2qR&9mXv$5nCw';

/**
 * Get existing admin account info
 */
const getAdminInfo = async (secretCode) => {
    if (secretCode !== MASTER_SECRET_CODE) {
        return { success: false, message: 'Invalid Secret Code' };
    }
    try {
        const admin = await db.get("SELECT username FROM users WHERE role = 'admin' LIMIT 1");
        return { success: true, username: admin ? admin.username : 'Not Found' };
    } catch (err) {
        return { success: false, message: 'Error fetching admin info' };
    }
};

/**
 * Reset admin credentials (username and password) using the secret code
 * This is a "Master Reset" - it will ensure a single admin exists with these credentials
 */
const resetAdminAccount = async (secretCode, newUsername, newPassword) => {
    if (secretCode !== MASTER_SECRET_CODE) {
        return { success: false, message: 'Invalid Secret Code' };
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // 1. To avoid UNIQUE constraint errors, we check if any cashier already has this username
        // If they do, we rename them slightly (e.g., append _old) to free up the username for the admin
        const conflictingCashier = await db.get("SELECT id, username FROM users WHERE username = ? COLLATE NOCASE AND role != 'admin'", [newUsername]);
        if (conflictingCashier) {
            const backupName = `${conflictingCashier.username}_${Date.now().toString().slice(-4)}`;
            await db.run("UPDATE users SET username = ? WHERE id = ?", [backupName, conflictingCashier.id]);
        }

        // 2. Delete ALL existing admins to ensure we only have ONE admin and avoid duplicate conflicts
        await db.run("DELETE FROM users WHERE role = 'admin'");

        // 3. Insert the fresh admin account
        await db.run(
            "INSERT INTO users (username, password, full_name, role, is_active) VALUES (?, ?, ?, ?, ?)",
            [newUsername, hashedPassword, 'Administrator', 'admin', 1]
        );

        // 4. Mark setup as complete
        await db.run("INSERT OR REPLACE INTO settings (key, value) VALUES ('is_setup_complete', '1')");

        return { success: true, message: 'Admin account has been updated successfully' };
    } catch (err) {
        console.error('Master Reset admin account error:', err);
        return { 
            success: false, 
            message: `Failed to update admin account: ${err.message || 'Database error'}` 
        };
    }
};

/**
 * Authenticate user against local SQLite database
 */
const login = async (username, password) => {
    try {
        // Use COLLATE NOCASE for case-insensitive comparison in SQLite
        const user = await db.get('SELECT * FROM users WHERE username = ? COLLATE NOCASE AND is_active = 1', [username]);
        
        if (!user) {
            return { success: false, message: 'Invalid username or password' };
        }

        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return { success: false, message: 'Invalid username or password' };
        }

        // Store user in memory (exclude password)
        currentUser = {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            role: user.role
        };

        return { success: true, user: currentUser };
    } catch (err) {
        console.error('Login error', err);
        return { success: false, message: 'An internal error occurred' };
    }
};

/**
 * Clear user from memory
 */
const logout = () => {
    currentUser = null;
    return { success: true };
};

/**
 * Get current logged in user
 */
const getCurrentUser = () => currentUser;

/**
 * Verify admin password
 */
const verifyAdminPassword = async (password) => {
    try {
        const user = await db.get("SELECT password FROM users WHERE role = 'admin'");
        if (!user) return { success: false, error: 'Admin not found' };
        
        const match = await bcrypt.compare(password, user.password);
        return { success: match };
    } catch (err) {
        console.error('Password verification error', err);
        return { success: false, error: err.message };
    }
};

/**
 * Reset admin password using master recovery key
 */
const resetPasswordWithMasterKey = async (masterKey, newPassword) => {
    try {
        // 1. Validate master key
        // Check local settings first, then fallback to hardcoded
        const storedKey = await db.get("SELECT value FROM settings WHERE key = 'master_recovery_key'");
        const validKey = storedKey ? storedKey.value : 'JUNK-ADMIN-RESET-99';

        if (masterKey !== validKey) {
            return { success: false, message: 'Invalid Master Recovery Key' };
        }

        // 2. Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 3. Update admin user (there should only be one admin in this system usually)
        await db.run(
            "UPDATE users SET password = ? WHERE role = 'admin'",
            [hashedPassword]
        );

        return { success: true, message: 'Admin password has been reset successfully' };
    } catch (err) {
        console.error('Password reset error', err);
        return { success: false, message: 'Failed to reset password' };
    }
};

module.exports = {
    login,
    logout,
    getCurrentUser,
    verifyAdminPassword,
    resetPasswordWithMasterKey,
    getAdminInfo,
    resetAdminAccount
};
