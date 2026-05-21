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

module.exports = {
    login,
    logout,
    getCurrentUser
};
