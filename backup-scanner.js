const fs = require('fs');
const path = require('path');
const os = require('os');
const plist = require('plist');

function getBackupLocations() {
  const homeDir = os.homedir();
  const locations = [];
  
  if (process.platform === 'darwin') {
    locations.push(path.join(homeDir, 'Library', 'Application Support', 'MobileSync', 'Backup'));
  } else if (process.platform === 'win32') {
    locations.push(path.join(homeDir, 'AppData', 'Roaming', 'Apple Computer', 'MobileSync', 'Backup'));
    locations.push(path.join(homeDir, 'Apple', 'MobileSync', 'Backup'));
  }
  
  return locations;
}

function parseInfoPlist(backupPath) {
  const infoPlistPath = path.join(backupPath, 'Info.plist');
  
  if (!fs.existsSync(infoPlistPath)) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(infoPlistPath, 'utf8');
    const info = plist.parse(content);
    
    return {
      deviceName: info['Device Name'] || 'Unknown Device',
      productType: info['Product Type'] || 'Unknown',
      productVersion: info['Product Version'] || 'Unknown',
      lastBackupDate: info['Last Backup Date'] || null,
      serialNumber: info['Serial Number'] || 'Unknown',
      uniqueIdentifier: info['Unique Identifier'] || 'Unknown',
      displayName: info['Display Name'] || info['Device Name'] || 'Unknown Device',
      isEncrypted: info['Is Encrypted'] || false,
    };
  } catch (error) {
    console.error('Error parsing Info.plist:', error);
    return null;
  }
}

function getDeviceIcon(productType) {
  if (!productType) return 'phone';
  const type = productType.toLowerCase();
  if (type.includes('ipad')) return 'tablet';
  if (type.includes('ipod')) return 'music';
  return 'phone';
}

function formatProductType(productType) {
  if (!productType) return 'iOS Device';
  
  const mappings = {
    'iPhone14,5': 'iPhone 13',
    'iPhone14,4': 'iPhone 13 mini',
    'iPhone14,2': 'iPhone 13 Pro',
    'iPhone14,3': 'iPhone 13 Pro Max',
    'iPhone15,2': 'iPhone 14 Pro',
    'iPhone15,3': 'iPhone 14 Pro Max',
    'iPhone15,4': 'iPhone 15',
    'iPhone15,5': 'iPhone 15 Plus',
    'iPhone16,1': 'iPhone 15 Pro',
    'iPhone16,2': 'iPhone 15 Pro Max',
    'iPad13,1': 'iPad Air (4th gen)',
    'iPad13,2': 'iPad Air (4th gen)',
    'iPad14,1': 'iPad mini (6th gen)',
    'iPad14,2': 'iPad mini (6th gen)',
  };
  
  return mappings[productType] || productType;
}

function getBackupSize(backupPath) {
  let totalSize = 0;
  
  try {
    const files = fs.readdirSync(backupPath);
    for (const file of files) {
      const filePath = path.join(backupPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        totalSize += stats.size;
      } else if (stats.isDirectory()) {
        totalSize += getDirectorySize(filePath);
      }
    }
  } catch (error) {
    console.error('Error calculating backup size:', error);
  }
  
  return totalSize;
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

async function scanForBackups() {
  const backups = [];
  const locations = getBackupLocations();
  
  for (const location of locations) {
    if (!fs.existsSync(location)) {
      continue;
    }
    
    try {
      const items = fs.readdirSync(location);
      
      for (const item of items) {
        const backupPath = path.join(location, item);
        const stats = fs.statSync(backupPath);
        
        if (!stats.isDirectory()) continue;
        
        const info = parseInfoPlist(backupPath);
        if (!info) continue;
        
        const size = getBackupSize(backupPath);
        
        backups.push({
          path: backupPath,
          id: item,
          deviceName: info.displayName || info.deviceName,
          deviceType: formatProductType(info.productType),
          deviceIcon: getDeviceIcon(info.productType),
          iosVersion: info.productVersion,
          lastBackup: info.lastBackupDate,
          size: formatSize(size),
          sizeBytes: size,
          isEncrypted: info.isEncrypted,
          serialNumber: info.serialNumber,
        });
      }
    } catch (error) {
      console.error('Error scanning backup location:', error);
    }
  }
  
  backups.sort((a, b) => {
    if (!a.lastBackup) return 1;
    if (!b.lastBackup) return -1;
    return new Date(b.lastBackup) - new Date(a.lastBackup);
  });
  
  return backups;
}

async function getBackupDetails(backupPath) {
  const info = parseInfoPlist(backupPath);
  if (!info) {
    return { error: 'Could not read backup information' };
  }
  
  const manifestPath = path.join(backupPath, 'Manifest.db');
  const hasManifest = fs.existsSync(manifestPath);
  
  const statusPath = path.join(backupPath, 'Status.plist');
  let status = null;
  if (fs.existsSync(statusPath)) {
    try {
      const content = fs.readFileSync(statusPath, 'utf8');
      status = plist.parse(content);
    } catch (e) {}
  }
  
  return {
    ...info,
    hasManifest,
    isFullBackup: status?.IsFullBackup || false,
    backupState: status?.BackupState || 'unknown',
    dataTypes: {
      photos: true,
      messages: true,
      contacts: true,
      notes: true,
      callHistory: true,
      voicemails: true,
    },
  };
}

module.exports = {
  scanForBackups,
  getBackupDetails,
  getBackupLocations,
};
