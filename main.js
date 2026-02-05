const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const WEBSITE_URL = 'https://saferestorehelp.com';

let mainWindow;
let isLocalMode = false;

// Security: Check if request is from local content (not external website)
function isLocalOrigin(event) {
  if (!event || !event.senderFrame) return false;
  const url = event.senderFrame.url;
  // Allow file:// protocol (local HTML files) and empty URLs during initial load
  return url.startsWith('file://') || url === '' || url === 'about:blank';
}

// Security wrapper for filesystem IPC handlers
function secureHandler(handler) {
  return async (event, ...args) => {
    if (!isLocalOrigin(event)) {
      console.warn('Security: Blocked filesystem access from external origin:', event.senderFrame?.url);
      return { success: false, error: 'Access denied: filesystem operations not allowed from external content' };
    }
    return handler(event, ...args);
  };
}

// Get the correct base path for both development and packaged app
function getBasePath() {
  // __dirname works correctly in both development and packaged builds
  return __dirname;
}

function createWindow() {
  const basePath = getBasePath();
  console.log('SafeRestore starting, basePath:', basePath);
  
  // List all files in basePath for debugging
  try {
    const files = fs.readdirSync(basePath);
    console.log('Files in basePath:', files);
  } catch (e) {
    console.error('Cannot list basePath:', e.message);
  }
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#000000',
    titleBarStyle: 'hiddenInset',
    show: false, // Don't show until ready
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(basePath, 'preload.js'),
    }
  });

  // Show window when ready to render
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle render process crashes
  mainWindow.webContents.on('crashed', (event, killed) => {
    console.error('Render process crashed! Killed:', killed);
  });

  // Handle unresponsive renderer
  mainWindow.on('unresponsive', () => {
    console.error('Window became unresponsive');
  });

  // Log when page finishes loading
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page finished loading');
  });

  // Log any console messages from the renderer
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log('Renderer console:', message);
  });

  // Start with local recovery mode by default (the backup scanner)
  const htmlPath = path.join(basePath, 'recovery.html');
  console.log('Loading HTML from:', htmlPath);
  
  // Check if file exists before loading
  if (fs.existsSync(htmlPath)) {
    // Read first 200 chars to verify it's real HTML
    try {
      const content = fs.readFileSync(htmlPath, 'utf8').substring(0, 200);
      console.log('HTML file starts with:', content.substring(0, 100));
    } catch (e) {
      console.error('Cannot read HTML file:', e.message);
    }
    
    mainWindow.loadFile(htmlPath).then(() => {
      console.log('HTML loaded successfully');
    }).catch(err => {
      console.error('Failed to load recovery.html:', err);
      mainWindow.show();
      mainWindow.loadURL(`data:text/html,<html><body style="background:#000;color:#fff;font-family:system-ui;padding:40px;"><h1>SafeRestore</h1><p>Error loading app: ${err.message}</p><p>Path: ${htmlPath}</p></body></html>`);
    });
  } else {
    console.error('recovery.html not found at:', htmlPath);
    mainWindow.show();
    mainWindow.loadURL(`data:text/html,<html><body style="background:#000;color:#fff;font-family:system-ui;padding:40px;"><h1>SafeRestore</h1><p>Error: recovery.html not found</p><p>Expected path: ${htmlPath}</p><p>Base path: ${basePath}</p></body></html>`);
  }
  isLocalMode = true;
  

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function loadLocalRecovery() {
  if (mainWindow) {
    isLocalMode = true;
    mainWindow.loadFile(path.join(getBasePath(), 'recovery.html'));
  }
}

function loadWebsite() {
  if (mainWindow) {
    isLocalMode = false;
    mainWindow.loadURL(WEBSITE_URL);
  }
}

const template = [
  {
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  },
  {
    label: 'File',
    submenu: [
      {
        label: 'Local Data Recovery',
        accelerator: 'CmdOrCtrl+L',
        click: loadLocalRecovery
      },
      {
        label: 'AI Concierge (Online)',
        accelerator: 'CmdOrCtrl+O',
        click: loadWebsite
      },
      { type: 'separator' },
      { role: 'close' }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectAll' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' }
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'Visit Website',
        click: async () => {
          await shell.openExternal(WEBSITE_URL);
        }
      },
      {
        label: 'Contact Support',
        click: async () => {
          await shell.openExternal(WEBSITE_URL + '/support');
        }
      }
    ]
  }
];

// All filesystem handlers are wrapped with secureHandler to prevent access from external web content
ipcMain.handle('scan-backups', secureHandler(async () => {
  try {
    const basePath = getBasePath();
    const { scanForBackups } = require(path.join(basePath, 'backup-scanner'));
    return await scanForBackups();
  } catch (error) {
    console.error('Scan error:', error);
    throw error;
  }
}));

ipcMain.handle('scan-android-backups', secureHandler(async () => {
  try {
    const basePath = getBasePath();
    const { scanForAndroidBackups } = require(path.join(basePath, 'android-scanner'));
    return await scanForAndroidBackups();
  } catch (error) {
    console.error('Android scan error:', error);
    throw error;
  }
}));

ipcMain.handle('get-android-backup-details', secureHandler(async (event, backupPath) => {
  try {
    const basePath = getBasePath();
    const { getAndroidBackupDetails } = require(path.join(basePath, 'android-extractor'));
    return await getAndroidBackupDetails(backupPath);
  } catch (error) {
    console.error('Android details error:', error);
    return { success: false, error: error.message };
  }
}));

ipcMain.handle('export-android-data', secureHandler(async (event, backupPath, exportPath, dataTypes) => {
  try {
    const basePath = getBasePath();
    const { exportAndroidData } = require(path.join(basePath, 'android-extractor'));
    return await exportAndroidData(backupPath, exportPath, dataTypes);
  } catch (error) {
    console.error('Android export error:', error);
    return { success: false, error: error.message };
  }
}));

ipcMain.handle('scan-trash', secureHandler(async () => {
  try {
    const basePath = getBasePath();
    const { scanTrash } = require(path.join(basePath, 'mac-recovery'));
    return await scanTrash();
  } catch (error) {
    console.error('Trash scan error:', error);
    throw error;
  }
}));

ipcMain.handle('scan-time-machine', secureHandler(async () => {
  try {
    const basePath = getBasePath();
    const { scanTimeMachine } = require(path.join(basePath, 'mac-recovery'));
    return await scanTimeMachine();
  } catch (error) {
    console.error('Time Machine scan error:', error);
    throw error;
  }
}));

ipcMain.handle('restore-from-trash', secureHandler(async (event, filePath, destinationPath) => {
  try {
    const basePath = getBasePath();
    const { restoreFromTrash } = require(path.join(basePath, 'mac-recovery'));
    return await restoreFromTrash(filePath, destinationPath);
  } catch (error) {
    console.error('Restore error:', error);
    return { success: false, error: error.message };
  }
}));

ipcMain.handle('open-time-machine', secureHandler(async () => {
  try {
    const basePath = getBasePath();
    const { openTimeMachine } = require(path.join(basePath, 'mac-recovery'));
    return await openTimeMachine();
  } catch (error) {
    console.error('Time Machine error:', error);
    return { success: false, error: error.message };
  }
}));

ipcMain.handle('get-backup-details', secureHandler(async (event, backupPath) => {
  try {
    const basePath = getBasePath();
    const { getBackupDetails } = require(path.join(basePath, 'backup-scanner'));
    return await getBackupDetails(backupPath);
  } catch (error) {
    console.error('Details error:', error);
    throw error;
  }
}));

ipcMain.handle('select-export-folder', secureHandler(async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Export Destination',
    properties: ['openDirectory', 'createDirectory'],
    buttonLabel: 'Export Here',
  });
  
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  
  return result.filePaths[0];
}));

ipcMain.handle('export-data', secureHandler(async (event, backupPath, exportPath, dataTypes) => {
  try {
    const basePath = getBasePath();
    const { exportBackupData } = require(path.join(basePath, 'data-exporter'));
    return await exportBackupData(backupPath, exportPath, dataTypes);
  } catch (error) {
    console.error('Export error:', error);
    return { success: false, error: error.message };
  }
}));

ipcMain.handle('open-folder', secureHandler(async (event, folderPath) => {
  shell.showItemInFolder(folderPath);
}));

// Open external URL in default browser (for payment flow)
ipcMain.handle('open-external-url', secureHandler(async (event, url) => {
  // Only allow https URLs to saferestore domains or Stripe
  const allowedDomains = ['saferestore.replit.app', 'checkout.stripe.com', 'stripe.com'];
  try {
    const urlObj = new URL(url);
    if (urlObj.protocol !== 'https:') {
      throw new Error('Only HTTPS URLs are allowed');
    }
    const isAllowed = allowedDomains.some(domain => urlObj.hostname.endsWith(domain));
    if (!isAllowed) {
      throw new Error('URL domain not allowed');
    }
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    console.error('Open external URL error:', error);
    return { success: false, error: error.message };
  }
}));

// File browser - open dialog to select files (secured)
ipcMain.handle('browse-files', secureHandler(async (event, options = {}) => {
  const dialogOptions = {
    title: options.title || 'Select Files',
    properties: ['openFile', 'multiSelections'],
    filters: options.filters || [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'heic', 'webp'] },
      { name: 'Documents', extensions: ['pdf', 'doc', 'docx', 'txt', 'rtf'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  };
  
  if (options.defaultPath) {
    dialogOptions.defaultPath = options.defaultPath;
  }
  
  const result = await dialog.showOpenDialog(mainWindow, dialogOptions);
  
  if (result.canceled || result.filePaths.length === 0) {
    return { success: false, files: [] };
  }
  
  // Get file info for each selected file
  const files = await Promise.all(result.filePaths.map(async (filePath) => {
    try {
      const stats = await fs.promises.stat(filePath);
      return {
        path: filePath,
        name: path.basename(filePath),
        size: stats.size,
        modified: stats.mtime,
        isDirectory: stats.isDirectory()
      };
    } catch (error) {
      return { path: filePath, name: path.basename(filePath), error: error.message };
    }
  }));
  
  return { success: true, files };
}));

// Browse folder contents (secured)
ipcMain.handle('browse-folder', secureHandler(async (event, folderPath) => {
  try {
    // If no path provided, let user select a folder
    if (!folderPath) {
      const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Select Folder to Browse',
        properties: ['openDirectory']
      });
      
      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, items: [] };
      }
      folderPath = result.filePaths[0];
    }
    
    const items = await fs.promises.readdir(folderPath, { withFileTypes: true });
    const contents = await Promise.all(items.map(async (item) => {
      const fullPath = path.join(folderPath, item.name);
      try {
        const stats = await fs.promises.stat(fullPath);
        return {
          name: item.name,
          path: fullPath,
          isDirectory: item.isDirectory(),
          size: stats.size,
          modified: stats.mtime
        };
      } catch (error) {
        return {
          name: item.name,
          path: fullPath,
          isDirectory: item.isDirectory(),
          error: error.message
        };
      }
    }));
    
    return { success: true, path: folderPath, items: contents };
  } catch (error) {
    console.error('Browse folder error:', error);
    return { success: false, error: error.message };
  }
}));

// Get detailed file info (secured)
ipcMain.handle('get-file-info', secureHandler(async (event, filePath) => {
  try {
    const stats = await fs.promises.stat(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    return {
      success: true,
      info: {
        path: filePath,
        name: path.basename(filePath),
        extension: ext,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        accessed: stats.atime,
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile()
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}));

// Copy files to destination (secured)
ipcMain.handle('copy-files', secureHandler(async (event, filePaths, destination) => {
  try {
    const results = [];
    for (const filePath of filePaths) {
      const fileName = path.basename(filePath);
      const destPath = path.join(destination, fileName);
      await fs.promises.copyFile(filePath, destPath);
      results.push({ source: filePath, destination: destPath, success: true });
    }
    return { success: true, results };
  } catch (error) {
    console.error('Copy files error:', error);
    return { success: false, error: error.message };
  }
}));

// Cloud services
ipcMain.handle('get-cloud-status', secureHandler(async () => {
  try {
    const basePath = getBasePath();
    const { getCloudStatus } = require(path.join(basePath, 'cloud-connector'));
    return await getCloudStatus();
  } catch (error) {
    console.error('Cloud status error:', error);
    return { success: false, error: error.message };
  }
}));

ipcMain.handle('get-cloud-services', secureHandler(async () => {
  try {
    const basePath = getBasePath();
    const { getCloudServices } = require(path.join(basePath, 'cloud-connector'));
    return getCloudServices();
  } catch (error) {
    console.error('Cloud services error:', error);
    return [];
  }
}));

ipcMain.handle('open-cloud-service', secureHandler(async (event, serviceId) => {
  try {
    const basePath = getBasePath();
    const { openCloudService } = require(path.join(basePath, 'cloud-connector'));
    return await openCloudService(serviceId);
  } catch (error) {
    console.error('Open cloud service error:', error);
    return { success: false, error: error.message };
  }
}));

ipcMain.handle('open-data-export', secureHandler(async (event, serviceId) => {
  try {
    const basePath = getBasePath();
    const { openDataExport } = require(path.join(basePath, 'cloud-connector'));
    return await openDataExport(serviceId);
  } catch (error) {
    console.error('Open data export error:', error);
    return { success: false, error: error.message };
  }
}));

ipcMain.handle('scan-cloud-folder', secureHandler(async (event, folderPath, options) => {
  try {
    const basePath = getBasePath();
    const { scanCloudSyncFolder } = require(path.join(basePath, 'cloud-connector'));
    return await scanCloudSyncFolder(folderPath, options);
  } catch (error) {
    console.error('Scan cloud folder error:', error);
    return { success: false, error: error.message };
  }
}));

app.whenReady().then(() => {
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
