const { machineIdSync } = require('node-machine-id');
const axios = require('axios');
const db = require('./database');
const { app } = require('electron');
const path = require('path');

// API Configuration
const API_URL = 'http://127.0.0.1:8000/api'; // Pointing to your local Laravel server

/**
 * Generate a unique device fingerprint
 */
const getFingerprint = () => {
    try {
        const id = machineIdSync();
        const installPath = app.getAppPath();
        // Simple fingerprint: machineId + hash of install path
        return `${id}-${Buffer.from(installPath).toString('hex').substring(0, 8)}`;
    } catch (err) {
        console.error('Error generating fingerprint', err);
        return 'unknown-device';
    }
};

/**
 * Check if the app is currently activated in SQLite
 */
const checkLocalLicense = async () => {
    const license = await db.get('SELECT * FROM license WHERE id = 1');
    if (license && license.is_valid === 1) {
        return { valid: true, license };
    }
    return { valid: false };
};

/**
 * Activate the app using a license key
 */
const activateLicense = async (licenseKey) => {
    const deviceId = getFingerprint();

    try {
        const response = await axios.post(`${API_URL}/activate`, {
            license_key: licenseKey,
            device_id: deviceId
        });

        if (response.status === 200) {
            // Save to local DB
            await db.run(
                'UPDATE license SET license_key = ?, device_id = ?, activated_at = CURRENT_TIMESTAMP, is_valid = 1 WHERE id = 1',
                [licenseKey, deviceId]
            );
            return { success: true, message: 'License activated successfully' };
        }
    } catch (err) {
        const message = err.response?.data?.message || 'Connection to activation server failed';
        return { success: false, message };
    }

    return { success: false, message: 'Invalid license key' };
};

module.exports = {
    getFingerprint,
    checkLocalLicense,
    activateLicense
};
