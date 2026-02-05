const fs = require('fs');
const path = require('path');
const os = require('os');

function getAndroidBackupLocations() {
  const homeDir = os.homedir();
  const locations = [];
  
  if (process.platform === 'darwin') {
    locations.push({
      path: path.join(homeDir, 'Library', 'Application Support', 'Samsung', 'SmartSwitch', 'backup'),
      type: 'Samsung Smart Switch'
    });
    locations.push({
      path: path.join(homeDir, 'Documents', 'samsung_backup'),
      type: 'Samsung Backup'
    });
    locations.push({
      path: path.join(homeDir, '.android', 'backup'),
      type: 'ADB Backup'
    });
    locations.push({
      path: path.join(homeDir, 'Android Backups'),
      type: 'Android Backup'
    });
  } else if (process.platform === 'win32') {
    locations.push({
      path: path.join(homeDir, 'AppData', 'Roaming', 'Samsung', 'SmartSwitch', 'backup'),
      type: 'Samsung Smart Switch'
    });
    locations.push({
      path: path.join(homeDir, 'Documents', 'samsung_backup'),
      type: 'Samsung Backup'
    });
    locations.push({
      path: path.join(homeDir, '.android', 'backup'),
      type: 'ADB Backup'
    });
    const samsungKies = path.join('C:', 'Users', os.userInfo().username, 'Documents', 'Samsung', 'Kies3', 'Backup');
    if (fs.existsSync(samsungKies)) {
      locations.push({
        path: samsungKies,
        type: 'Samsung Kies'
      });
    }
  }
  
  return locations;
}

function parseAdbBackupInfo(backupPath) {
  try {
    const files = fs.readdirSync(backupPath);
    const abFiles = files.filter(f => f.endsWith('.ab'));
    
    if (abFiles.length === 0) return null;
    
    const backups = [];
    for (const abFile of abFiles) {
      const filePath = path.join(backupPath, abFile);
      const stats = fs.statSync(filePath);
      
      backups.push({
        fileName: abFile,
        path: filePath,
        size: stats.size,
        lastModified: stats.mtime,
        type: 'ADB Backup',
        isEncrypted: true
      });
    }
    
    return backups;
  } catch (error) {
    console.error('Error parsing ADB backup:', error);
    return null;
  }
}

function parseSamsungBackup(backupPath) {
  try {
    if (!fs.existsSync(backupPath)) return [];
    
    const items = fs.readdirSync(backupPath);
    const backups = [];
    
    for (const item of items) {
      const itemPath = path.join(backupPath, item);
      const stats = fs.statSync(itemPath);
      
      if (!stats.isDirectory()) continue;
      
      const infoFile = path.join(itemPath, 'backup_info.xml');
      const hasInfo = fs.existsSync(infoFile);
      
      let deviceName = item;
      let deviceModel = 'Samsung Device';
      let backupDate = stats.mtime;
      
      if (hasInfo) {
        try {
          const content = fs.readFileSync(infoFile, 'utf8');
          const nameMatch = content.match(/<device_name>([^<]+)<\/device_name>/);
          const modelMatch = content.match(/<model>([^<]+)<\/model>/);
          const dateMatch = content.match(/<backup_date>([^<]+)<\/backup_date>/);
          
          if (nameMatch) deviceName = nameMatch[1];
          if (modelMatch) deviceModel = modelMatch[1];
          if (dateMatch) backupDate = new Date(dateMatch[1]);
        } catch (e) {}
      }
      
      const size = getDirectorySize(itemPath);
      
      backups.push({
        path: itemPath,
        id: item,
        deviceName: deviceName,
        deviceType: deviceModel,
        deviceIcon: 'android',
        lastBackup: backupDate,
        size: formatSize(size),
        sizeBytes: size,
        isEncrypted: false,
        backupType: 'Samsung Smart Switch'
      });
    }
    
    return backups;
  } catch (error) {
    console.error('Error parsing Samsung backup:', error);
    return [];
  }
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

async function scanForAndroidBackups() {
  const backups = [];
  const locations = getAndroidBackupLocations();
  
  for (const location of locations) {
    if (!fs.existsSync(location.path)) {
      continue;
    }
    
    try {
      if (location.type === 'ADB Backup') {
        const adbBackups = parseAdbBackupInfo(location.path);
        if (adbBackups) {
          for (const backup of adbBackups) {
            backups.push({
              path: backup.path,
              id: backup.fileName,
              deviceName: backup.fileName.replace('.ab', ''),
              deviceType: 'Android Device (ADB)',
              deviceIcon: 'android',
              lastBackup: backup.lastModified,
              size: formatSize(backup.size),
              sizeBytes: backup.size,
              isEncrypted: backup.isEncrypted,
              backupType: 'ADB Backup'
            });
          }
        }
      } else if (location.type.includes('Samsung')) {
        const samsungBackups = parseSamsungBackup(location.path);
        backups.push(...samsungBackups);
      } else {
        const items = fs.readdirSync(location.path);
        for (const item of items) {
          const itemPath = path.join(location.path, item);
          const stats = fs.statSync(itemPath);
          
          if (stats.isDirectory() || item.endsWith('.ab')) {
            const size = stats.isDirectory() ? getDirectorySize(itemPath) : stats.size;
            backups.push({
              path: itemPath,
              id: item,
              deviceName: item.replace('.ab', ''),
              deviceType: 'Android Device',
              deviceIcon: 'android',
              lastBackup: stats.mtime,
              size: formatSize(size),
              sizeBytes: size,
              isEncrypted: item.endsWith('.ab'),
              backupType: location.type
            });
          }
        }
      }
    } catch (error) {
      console.error('Error scanning Android backup location:', error);
    }
  }
  
  backups.sort((a, b) => {
    if (!a.lastBackup) return 1;
    if (!b.lastBackup) return -1;
    return new Date(b.lastBackup) - new Date(a.lastBackup);
  });
  
  return backups;
}

module.exports = {
  scanForAndroidBackups,
  getAndroidBackupLocations,
};
