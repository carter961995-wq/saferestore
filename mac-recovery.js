const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

function getTrashPath() {
  const homeDir = os.homedir();
  
  if (process.platform === 'darwin') {
    return path.join(homeDir, '.Trash');
  } else if (process.platform === 'win32') {
    return null;
  }
  
  return null;
}

function getTimeMachineVolumes() {
  const volumes = [];
  
  if (process.platform !== 'darwin') {
    return volumes;
  }
  
  try {
    const volumesPath = '/Volumes';
    if (fs.existsSync(volumesPath)) {
      const items = fs.readdirSync(volumesPath);
      
      for (const item of items) {
        const volumePath = path.join(volumesPath, item);
        const backupsPath = path.join(volumePath, 'Backups.backupdb');
        
        if (fs.existsSync(backupsPath)) {
          try {
            const stats = fs.statSync(volumePath);
            const computerName = os.hostname();
            const computerBackupPath = path.join(backupsPath, computerName);
            
            let backups = [];
            if (fs.existsSync(computerBackupPath)) {
              const backupDirs = fs.readdirSync(computerBackupPath);
              backups = backupDirs
                .filter(d => d.match(/^\d{4}-\d{2}-\d{2}-\d{6}$/))
                .sort()
                .reverse()
                .slice(0, 10);
            }
            
            volumes.push({
              name: item,
              path: volumePath,
              backupsPath: backupsPath,
              computerBackupPath: computerBackupPath,
              hasBackups: backups.length > 0,
              recentBackups: backups,
              lastBackup: backups[0] || null,
            });
          } catch (e) {}
        }
      }
    }
  } catch (error) {
    console.error('Error scanning Time Machine volumes:', error);
  }
  
  return volumes;
}

async function scanTrash() {
  const trashPath = getTrashPath();
  const items = [];
  
  if (!trashPath || !fs.existsSync(trashPath)) {
    return { path: trashPath, items: [], totalSize: 0 };
  }
  
  try {
    const files = fs.readdirSync(trashPath);
    let totalSize = 0;
    
    for (const file of files) {
      if (file.startsWith('.')) continue;
      
      const filePath = path.join(trashPath, file);
      try {
        const stats = fs.statSync(filePath);
        const size = stats.isDirectory() ? getDirectorySize(filePath) : stats.size;
        totalSize += size;
        
        const ext = path.extname(file).toLowerCase();
        let type = 'file';
        if (stats.isDirectory()) type = 'folder';
        else if (['.jpg', '.jpeg', '.png', '.gif', '.heic', '.webp'].includes(ext)) type = 'image';
        else if (['.mp4', '.mov', '.avi', '.mkv'].includes(ext)) type = 'video';
        else if (['.mp3', '.wav', '.m4a', '.aac'].includes(ext)) type = 'audio';
        else if (['.doc', '.docx', '.pdf', '.txt', '.rtf'].includes(ext)) type = 'document';
        
        items.push({
          name: file,
          path: filePath,
          size: formatSize(size),
          sizeBytes: size,
          type: type,
          deletedDate: stats.mtime,
          isDirectory: stats.isDirectory(),
        });
      } catch (e) {}
    }
    
    items.sort((a, b) => new Date(b.deletedDate) - new Date(a.deletedDate));
    
    return {
      path: trashPath,
      items: items.slice(0, 100),
      totalItems: items.length,
      totalSize: formatSize(totalSize),
    };
  } catch (error) {
    console.error('Error scanning Trash:', error);
    return { path: trashPath, items: [], totalSize: 0, error: error.message };
  }
}

async function scanTimeMachine() {
  const volumes = getTimeMachineVolumes();
  
  return {
    volumes: volumes,
    hasTimeMachine: volumes.length > 0,
    primaryVolume: volumes[0] || null,
  };
}

async function restoreFromTrash(filePath, destinationPath) {
  return new Promise((resolve, reject) => {
    try {
      const fileName = path.basename(filePath);
      const destFile = path.join(destinationPath, fileName);
      
      fs.copyFileSync(filePath, destFile);
      
      resolve({
        success: true,
        restoredTo: destFile,
        fileName: fileName,
      });
    } catch (error) {
      reject({
        success: false,
        error: error.message,
      });
    }
  });
}

async function openTimeMachine() {
  return new Promise((resolve, reject) => {
    if (process.platform !== 'darwin') {
      reject({ error: 'Time Machine is only available on macOS' });
      return;
    }
    
    exec('open -a "Time Machine"', (error) => {
      if (error) {
        reject({ error: error.message });
      } else {
        resolve({ success: true });
      }
    });
  });
}

async function getRecycleBinItems() {
  if (process.platform !== 'win32') {
    return { items: [], error: 'Recycle Bin is only available on Windows' };
  }
  
  return {
    items: [],
    message: 'Windows Recycle Bin access requires elevated permissions. Please open Recycle Bin from the desktop.',
  };
}

async function scanPreviousVersions(folderPath) {
  if (process.platform !== 'win32') {
    return { items: [], error: 'Previous Versions is only available on Windows' };
  }
  
  return {
    items: [],
    message: 'To access Previous Versions, right-click a folder in File Explorer and select "Restore previous versions".',
  };
}

function getDirectorySize(dirPath) {
  let size = 0;
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        size += stats.size;
      } else if (stats.isDirectory()) {
        size += getDirectorySize(filePath);
      }
    }
  } catch (error) {}
  return size;
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

module.exports = {
  scanTrash,
  scanTimeMachine,
  restoreFromTrash,
  openTimeMachine,
  getRecycleBinItems,
  scanPreviousVersions,
  getTrashPath,
  getTimeMachineVolumes,
};
