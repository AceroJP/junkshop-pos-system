const { machineIdSync } = require('node-machine-id');
const axios = require('axios');
const db = require('./database');
const { app } = require('electron');
const path = require('path');

// API Configuration
const API_URL = 'http://192.168.55.106:8000/api'; // Pointing to your server's network IP

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
        return { valid: true, license, isMaster: license.is_master === 1 };
    }
    return { valid: false };
};

/**
 * Check for updates from the web admin
 */
const checkUpdate = async () => {
    try {
        const currentVersion = app.getVersion();
        const response = await axios.get(`${API_URL}/version`);
        
        if (response.status === 200) {
            const remoteVersion = response.data.version;
            const downloadUrl = response.data.download_url;

            // Simple comparison (can be improved with semver)
            if (remoteVersion !== currentVersion) {
                return { 
                    updateAvailable: true, 
                    currentVersion, 
                    remoteVersion,
                    downloadUrl
                };
            }
        }
        return { updateAvailable: false };
    } catch (err) {
        // Fail silently or with a simple warning if server is offline
        if (err.code === 'ECONNREFUSED') {
            console.warn('Update server is offline (ECONNREFUSED)');
        } else {
            console.error('Update check failed:', err.message);
        }
        return { updateAvailable: false };
    }
};

/**
 * Activate the app using a license key
 */
const activateLicense = async (licenseKey) => {
    const deviceId = getFingerprint();

    try {
        // 1. First check if it's a master key
        try {
            const masterResponse = await axios.post(`${API_URL}/validate-master-key`, {
                license_key: licenseKey,
                device_id: deviceId
            });

            if (masterResponse.status === 200 && masterResponse.data.success && masterResponse.data.is_master) {
                // Save to local DB as master license
                await db.run(
                    'UPDATE license SET license_key = ?, device_id = ?, activated_at = CURRENT_TIMESTAMP, is_valid = 1, is_master = 1 WHERE id = 1',
                    [licenseKey, deviceId]
                );
                return { success: true, message: 'Master license activated successfully (TEST MODE)' };
            }
        } catch (masterErr) {
            // If it fails, it might just not be a master key, so proceed to normal check
            console.log('Not a master key or master API offline, trying normal activation...');
        }

        // 2. Proceed with normal license activation flow
        const response = await axios.post(`${API_URL}/activate`, {
            license_key: licenseKey,
            device_id: deviceId
        });

        if (response.status === 200) {
            // Save to local DB as normal license
            await db.run(
                'UPDATE license SET license_key = ?, device_id = ?, activated_at = CURRENT_TIMESTAMP, is_valid = 1, is_master = 0 WHERE id = 1',
                [licenseKey, deviceId]
            );
            return { success: true, message: 'License activated successfully' };
        }
    } catch (err) {
        const message = err.response?.data?.message || `Connection to server (${API_URL}) failed`;
        return { success: false, message };
    }

    return { success: false, message: 'Invalid license key' };
};

module.exports = {
    getFingerprint,
    checkLocalLicense,
    activateLicense,
    checkUpdate
};
