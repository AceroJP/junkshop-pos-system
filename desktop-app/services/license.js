const { machineIdSync } = require('node-machine-id');
const axios = require('axios');
const db = require('./database');
const { app } = require('electron');
const path = require('path');

// Default API URL (Server IP)
const DEFAULT_API_URL = 'http://192.168.55.103:8000/api';

/**
 * Get the current API URL from settings
 */
const getApiUrl = async () => {
    try {
        const setting = await db.get("SELECT value FROM settings WHERE key = 'api_url'");
        return (setting && setting.value) ? setting.value : DEFAULT_API_URL;
    } catch (err) {
        return DEFAULT_API_URL;
    }
};

/**
 * Generate a unique device fingerprint
 */
const getFingerprint = () => {
    try {
        // Return only machine ID for more stable licensing across updates
        return machineIdSync();
    } catch (err) {
        console.error('Error generating fingerprint', err);
        return 'unknown-device';
    }
};

/**
 * Check if the app is currently activated in SQLite
 * MODIFIED: Always return valid to bypass activation screen
 */
const checkLocalLicense = async () => {
    // We always return valid: true to skip the activation screen
    return { 
        valid: true, 
        license: { license_key: 'COMMUNITY-VERSION', status: 'active' }, 
        isMaster: false 
    };
    /* Original logic preserved for reference:
    const license = await db.get('SELECT * FROM license WHERE id = 1');
    if (license && license.is_valid === 1) {
        return { valid: true, license, isMaster: license.is_master === 1 };
    }
    return { valid: false };
    */
};

/**
 * Check for updates from the web admin
 */
const checkUpdate = async () => {
    try {
        const currentVersion = app.getVersion();
        const apiUrl = await getApiUrl();
        const response = await axios.get(`${apiUrl}/version`, { timeout: 3000 });
        
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
    const apiUrl = await getApiUrl();

    try {
        // 1. First check if it's a master key
        try {
            console.log(`Attempting master key validation at: ${apiUrl}/validate-master-key`);
            const masterResponse = await axios.post(`${apiUrl}/validate-master-key`, {
                license_key: licenseKey,
                device_id: deviceId
            });

            if (masterResponse.status === 200 && masterResponse.data.success && masterResponse.data.is_master) {
                // Save to local DB as master license
                await db.run(
                    'UPDATE license SET license_key = ?, device_id = ?, activated_at = CURRENT_TIMESTAMP, is_valid = 1, is_master = 1 WHERE id = 1',
                    [licenseKey, deviceId]
                );
                return { success: true, message: 'Master license activated successfully (TEST MODE)', isMaster: true };
            }
        } catch (err) {
            console.error('Master key validation error details:', {
                message: err.message,
                code: err.code,
                url: err.config?.url,
                response: err.response?.data
            });
            // 2. If not master key, try normal activation
            try {
                console.log(`Attempting normal activation at: ${apiUrl}/activate`);
                const response = await axios.post(`${apiUrl}/activate`, {
                    license_key: licenseKey,
                    device_id: deviceId
                });

                if (response.status === 200) {
                    // Save to local DB as normal license
                    await db.run(
                        'UPDATE license SET license_key = ?, device_id = ?, activated_at = CURRENT_TIMESTAMP, is_valid = 1, is_master = 0 WHERE id = 1',
                        [licenseKey, deviceId]
                    );
                    return { success: true, message: 'License activated successfully', isMaster: false };
                }
            } catch (innerErr) {
                console.error('Activation error details:', {
                    message: innerErr.message,
                    code: innerErr.code,
                    url: innerErr.config?.url,
                    response: innerErr.response?.data
                });
                throw innerErr;
            }
        }
    } catch (err) {
        console.error('Final activation failure:', err);
        let message = `Connection to server (${apiUrl}) failed`;
        if (err.code === 'ECONNREFUSED') message = 'Connection Refused: Server is not running or port is blocked.';
        if (err.code === 'ETIMEDOUT') message = 'Connection Timed Out: Server is too slow or IP is unreachable.';
        if (err.response && err.response.data && err.response.data.message) {
            message = err.response.data.message;
        }
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
