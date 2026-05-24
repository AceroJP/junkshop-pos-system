const bcrypt = require('bcryptjs');
const db = require('./database');

let currentUser = null;

/**
 * Authenticate user against local SQLite database
 */
const login = async (username, password) => {
    try {
        const user = await db.get('SELECT * FROM users WHERE username = ? AND is_active = 1', [username]);
        
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
    resetPasswordWithMasterKey
};
