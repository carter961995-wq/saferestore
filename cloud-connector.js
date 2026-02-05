const { shell } = require('electron');
const https = require('https');
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const os = require('os');

const OAUTH_REDIRECT_PORT = 8847;

const cloudServices = {
  google: {
    name: 'Google Account',
    icon: 'google',
    description: 'Access Google Drive backups, Photos, Contacts',
    features: ['Photos', 'Contacts', 'Drive Files', 'Android Backups'],
    authUrl: 'https://accounts.google.com/signin',
    helpUrl: 'https://myaccount.google.com/data-and-privacy',
    manualSteps: [
      'Go to accounts.google.com',
      'Sign in to your Google Account',
      'Go to "Data & privacy" → "Download your data"',
      'Select the data you want to export',
      'Google will prepare a download link (may take hours/days)'
    ]
  },
  samsung: {
    name: 'Samsung Cloud',
    icon: 'samsung',
    description: 'Access Samsung Cloud backups for Galaxy devices',
    features: ['Gallery', 'Contacts', 'Calendar', 'Samsung Notes', 'Device Backups'],
    authUrl: 'https://account.samsung.com',
    helpUrl: 'https://support.samsung.com/cloud',
    manualSteps: [
      'Go to account.samsung.com',
      'Sign in with your Samsung Account',
      'Navigate to "Samsung Cloud"',
      'Click "Download my data"',
      'Select categories and request export'
    ]
  },
  icloud: {
    name: 'iCloud',
    icon: 'apple',
    description: 'Check iCloud backup status and download data',
    features: ['Photos', 'Contacts', 'iCloud Drive', 'Device Backups', 'Messages'],
    authUrl: 'https://www.icloud.com',
    helpUrl: 'https://privacy.apple.com',
    manualSteps: [
      'Go to icloud.com or privacy.apple.com',
      'Sign in with your Apple ID',
      'For full export: Use privacy.apple.com → "Request a copy of your data"',
      'For photos: Use iCloud.com Photos to download',
      'For contacts: Export from iCloud Contacts as vCard'
    ]
  },
  onedrive: {
    name: 'Microsoft OneDrive',
    icon: 'microsoft',
    description: 'Access OneDrive backups and files',
    features: ['Files', 'Photos', 'Documents', 'Windows Backups'],
    authUrl: 'https://onedrive.live.com',
    helpUrl: 'https://account.microsoft.com/privacy',
    manualSteps: [
      'Go to onedrive.live.com',
      'Sign in with your Microsoft Account',
      'Select files/folders to download',
      'For bulk download: Select all → Download as ZIP'
    ]
  },
  dropbox: {
    name: 'Dropbox',
    icon: 'dropbox',
    description: 'Access Dropbox files and camera uploads',
    features: ['Files', 'Photos', 'Camera Uploads', 'Shared Folders'],
    authUrl: 'https://www.dropbox.com',
    helpUrl: 'https://help.dropbox.com/accounts-billing/account/export-data',
    manualSteps: [
      'Go to dropbox.com',
      'Sign in to your account',
      'Select files to download',
      'For full export: Settings → Account → Download your data'
    ]
  }
};

function getCloudServices() {
  return Object.entries(cloudServices).map(([id, service]) => ({
    id,
    ...service
  }));
}

function getCloudServiceInfo(serviceId) {
  const service = cloudServices[serviceId];
  if (!service) {
    return { success: false, error: 'Unknown service' };
  }
  return { success: true, service: { id: serviceId, ...service } };
}

async function openCloudService(serviceId) {
  const service = cloudServices[serviceId];
  if (!service) {
    return { success: false, error: 'Unknown service' };
  }
  
  try {
    await shell.openExternal(service.authUrl);
    return { success: true, message: `Opened ${service.name} in your browser` };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function openDataExport(serviceId) {
  const service = cloudServices[serviceId];
  if (!service) {
    return { success: false, error: 'Unknown service' };
  }
  
  try {
    await shell.openExternal(service.helpUrl);
    return { 
      success: true, 
      message: `Opened ${service.name} data export page`,
      steps: service.manualSteps
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function checkLocalCloudSyncFolders() {
  const homeDir = os.homedir();
  const syncFolders = [];
  
  const checkPaths = [
    { 
      path: path.join(homeDir, 'Google Drive'),
      name: 'Google Drive',
      service: 'google'
    },
    {
      path: path.join(homeDir, 'Library', 'CloudStorage', 'GoogleDrive-*'),
      name: 'Google Drive (macOS)',
      service: 'google',
      isGlob: true
    },
    {
      path: path.join(homeDir, 'OneDrive'),
      name: 'OneDrive',
      service: 'onedrive'
    },
    {
      path: path.join(homeDir, 'Dropbox'),
      name: 'Dropbox',
      service: 'dropbox'
    },
    {
      path: path.join(homeDir, 'Library', 'Mobile Documents', 'com~apple~CloudDocs'),
      name: 'iCloud Drive',
      service: 'icloud'
    },
    {
      path: path.join(homeDir, 'iCloud Drive'),
      name: 'iCloud Drive (Windows)',
      service: 'icloud'
    }
  ];
  
  for (const check of checkPaths) {
    if (check.isGlob) {
      try {
        const parentDir = path.dirname(check.path);
        const pattern = path.basename(check.path);
        if (fs.existsSync(parentDir)) {
          const items = fs.readdirSync(parentDir);
          for (const item of items) {
            if (item.startsWith('GoogleDrive-')) {
              const fullPath = path.join(parentDir, item);
              const stats = fs.statSync(fullPath);
              if (stats.isDirectory()) {
                syncFolders.push({
                  path: fullPath,
                  name: 'Google Drive',
                  service: 'google',
                  exists: true,
                  size: getDirectorySize(fullPath),
                  lastModified: stats.mtime
                });
              }
            }
          }
        }
      } catch (e) {}
    } else {
      try {
        if (fs.existsSync(check.path)) {
          const stats = fs.statSync(check.path);
          syncFolders.push({
            path: check.path,
            name: check.name,
            service: check.service,
            exists: true,
            size: getDirectorySize(check.path),
            lastModified: stats.mtime
          });
        }
      } catch (e) {}
    }
  }
  
  return syncFolders;
}

function getDirectorySize(dirPath, maxDepth = 2, currentDepth = 0) {
  if (currentDepth >= maxDepth) return 0;
  
  let size = 0;
  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      try {
        if (item.isFile()) {
          const stats = fs.statSync(fullPath);
          size += stats.size;
        } else if (item.isDirectory() && !item.name.startsWith('.')) {
          size += getDirectorySize(fullPath, maxDepth, currentDepth + 1);
        }
      } catch (e) {}
    }
  } catch (e) {}
  return size;
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function scanCloudSyncFolder(folderPath, options = {}) {
  const results = {
    photos: [],
    videos: [],
    documents: [],
    other: [],
    totalSize: 0,
    fileCount: 0
  };
  
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.heic', '.webp', '.bmp', '.raw'];
  const videoExts = ['.mp4', '.mov', '.avi', '.mkv', '.3gp', '.webm'];
  const docExts = ['.pdf', '.doc', '.docx', '.txt', '.xlsx', '.pptx', '.csv'];
  
  function scanDir(dir, depth = 0) {
    if (depth > (options.maxDepth || 5)) return;
    
    try {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        if (item.name.startsWith('.')) continue;
        
        const fullPath = path.join(dir, item.name);
        
        if (item.isDirectory()) {
          scanDir(fullPath, depth + 1);
        } else if (item.isFile()) {
          try {
            const stats = fs.statSync(fullPath);
            const ext = path.extname(item.name).toLowerCase();
            
            const fileInfo = {
              path: fullPath,
              name: item.name,
              size: stats.size,
              sizeFormatted: formatSize(stats.size),
              modified: stats.mtime,
              extension: ext
            };
            
            results.totalSize += stats.size;
            results.fileCount++;
            
            if (imageExts.includes(ext)) {
              results.photos.push(fileInfo);
            } else if (videoExts.includes(ext)) {
              results.videos.push(fileInfo);
            } else if (docExts.includes(ext)) {
              results.documents.push(fileInfo);
            } else {
              results.other.push(fileInfo);
            }
          } catch (e) {}
        }
      }
    } catch (e) {}
  }
  
  scanDir(folderPath);
  
  return {
    success: true,
    path: folderPath,
    summary: {
      photos: results.photos.length,
      videos: results.videos.length,
      documents: results.documents.length,
      other: results.other.length,
      totalFiles: results.fileCount,
      totalSize: formatSize(results.totalSize)
    },
    files: options.includeFiles ? results : undefined
  };
}

async function getCloudStatus() {
  const syncFolders = checkLocalCloudSyncFolders();
  const services = getCloudServices();
  
  const status = services.map(service => {
    const localFolder = syncFolders.find(f => f.service === service.id);
    return {
      ...service,
      hasLocalSync: !!localFolder,
      localFolder: localFolder ? {
        path: localFolder.path,
        size: formatSize(localFolder.size),
        lastModified: localFolder.lastModified
      } : null
    };
  });
  
  return {
    success: true,
    services: status,
    localFolders: syncFolders.map(f => ({
      ...f,
      sizeFormatted: formatSize(f.size)
    }))
  };
}

module.exports = {
  getCloudServices,
  getCloudServiceInfo,
  openCloudService,
  openDataExport,
  checkLocalCloudSyncFolders,
  scanCloudSyncFolder,
  getCloudStatus
};
