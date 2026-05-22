const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://127.0.0.1:8000/api/version';
const PACKAGE_JSON_PATH = path.join(__dirname, 'package.json');

async function syncVersion() {
    console.log('--- Syncing version from Admin Web ---');
    try {
        const response = await axios.get(API_URL);
        if (response.status === 200 && response.data.version) {
            const remoteVersion = response.data.version;
            
            // Read package.json
            const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
            const currentVersion = packageJson.version;

            if (currentVersion !== remoteVersion) {
                console.log(`Updating version: ${currentVersion} -> ${remoteVersion}`);
                packageJson.version = remoteVersion;
                fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2));
                console.log('Successfully updated package.json version.');
            } else {
                console.log(`Versions match (${currentVersion}). No update needed.`);
            }
        } else {
            console.error('Failed to fetch version: Invalid response format.');
        }
    } catch (err) {
        console.error('Error syncing version:', err.message);
        console.warn('Proceeding with current version in package.json...');
    }
    console.log('--------------------------------------');
}

syncVersion();
