const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            // Pas strictement nécessaire pour un écran blanc, mais aide pour TFJS
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // VERIFICATION CRITIQUE :
    if (app.isPackaged) {
        // En production (après le build), on charge le fichier local
        mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
    } else {
        // En développement, on charge le serveur Vite
        mainWindow.loadURL('http://localhost:5173');
    }
}