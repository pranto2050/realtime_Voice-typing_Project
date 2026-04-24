const { app, BrowserWindow, ipcMain, globalShortcut, systemPreferences, shell } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { spawn } = require('child_process');

const store = new Store({
    defaults: {
        alwaysOnTop: true,
        shortcut: 'CommandOrControl+Shift+Space',
        language: 'en-US'
    }
});

let mainWindow;
let pythonProcess = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 440,
        height: 720,
        frame: false,
        transparent: true,
        alwaysOnTop: store.get('alwaysOnTop'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.loadFile('renderer/index.html');
}

app.whenReady().then(() => {
    createWindow();

    // Global shortcut
    const shortcut = store.get('shortcut');
    globalShortcut.register(shortcut, () => {
        if (mainWindow) {
            mainWindow.webContents.send('toggle-voice');
        }
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    // Check mic permission on macOS
    if (process.platform === 'darwin') {
        const status = systemPreferences.getMediaAccessStatus('microphone');
        if (mainWindow) {
            mainWindow.webContents.on('did-finish-load', () => {
                mainWindow.webContents.send('permission-status', status);
            });
        }
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
    if (pythonProcess) {
        pythonProcess.kill();
    }
});

// IPC Handlers
ipcMain.handle('get-app-version', () => app.getVersion());

ipcMain.on('set-opacity', (e, val) => {
    if (mainWindow) mainWindow.setOpacity(parseFloat(val));
});

ipcMain.on('set-bg-color', (e, color) => {
    if (mainWindow) mainWindow.setBackgroundColor(color);
});

ipcMain.on('set-always-on-top', (e, bool) => {
    store.set('alwaysOnTop', bool);
    if (mainWindow) mainWindow.setAlwaysOnTop(bool);
});

ipcMain.on('minimize-window', () => {
    if (mainWindow) mainWindow.minimize();
});

ipcMain.on('close-window', () => {
    if (mainWindow) mainWindow.close();
});

ipcMain.on('start-voice', () => {
    if (pythonProcess) {
        pythonProcess.kill();
    }
    
    const pythonExecutable = process.platform === 'win32' ? 'python' : 'python3';
    
    pythonProcess = spawn(pythonExecutable, [path.join(__dirname, 'python', 'voice_engine.py')]);
    
    pythonProcess.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach(line => {
            if (line.trim()) {
                try {
                    const parsed = JSON.parse(line);
                    if (mainWindow) mainWindow.webContents.send('voice-data', parsed);
                } catch(err) {
                    // Ignore non-JSON output from Python
                }
            }
        });
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python Error: ${data}`);
    });

    // Send initial language from store
    const lang = store.get('language');
    pythonProcess.stdin.write(`LANG:${lang}\n`);
});

ipcMain.on('stop-voice', () => {
    if (pythonProcess) {
        pythonProcess.kill();
        pythonProcess = null;
    }
});

ipcMain.on('pause-voice', () => {
    if (pythonProcess) {
        pythonProcess.stdin.write('PAUSE\n');
    }
});

ipcMain.on('resume-voice', () => {
    if (pythonProcess) {
        pythonProcess.stdin.write('RESUME\n');
    }
});

ipcMain.on('set-language', (e, langCode) => {
    store.set('language', langCode);
    if (pythonProcess) {
        pythonProcess.stdin.write(`LANG:${langCode}\n`);
    }
});
