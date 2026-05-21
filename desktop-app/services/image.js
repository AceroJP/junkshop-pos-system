const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const appDataPath = app.getPath('userData');
const imagesDir = path.join(appDataPath, 'junkshop-pos', 'images');

// Ensure images directory exists
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

/**
 * Save an image to the local app data folder
 */
const saveImage = async (tempFilePath) => {
    const fileName = `product_${Date.now()}${path.extname(tempFilePath)}`;
    const destPath = path.join(imagesDir, fileName);

    return new Promise((resolve, reject) => {
        fs.copyFile(tempFilePath, destPath, (err) => {
            if (err) {
                console.error('Error saving image', err);
                reject(err);
            } else {
                // Return the local path (or a file:// URL if needed for renderer)
                resolve(destPath);
            }
        });
    });
};

/**
 * Delete an image
 */
const deleteImage = (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

module.exports = {
    saveImage,
    deleteImage,
    imagesDir
};
