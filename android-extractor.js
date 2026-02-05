const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileExtension(filePath) {
  return path.extname(filePath).toLowerCase();
}

function isImageFile(filePath) {
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.heic', '.webp', '.bmp', '.tiff', '.raw'];
  return imageExts.includes(getFileExtension(filePath));
}

function isVideoFile(filePath) {
  const videoExts = ['.mp4', '.mov', '.avi', '.mkv', '.3gp', '.webm', '.m4v'];
  return videoExts.includes(getFileExtension(filePath));
}

function isContactFile(filePath) {
  const ext = getFileExtension(filePath);
  return ext === '.vcf' || ext === '.vcard';
}

function findFilesRecursive(dir, predicate, results = []) {
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        findFilesRecursive(fullPath, predicate, results);
      } else if (item.isFile() && predicate(fullPath)) {
        try {
          const stats = fs.statSync(fullPath);
          results.push({
            path: fullPath,
            name: item.name,
            size: stats.size,
            sizeFormatted: formatSize(stats.size),
            modified: stats.mtime,
            extension: getFileExtension(fullPath)
          });
        } catch (e) {}
      }
    }
  } catch (e) {}
  return results;
}

async function scanSamsungBackupContents(backupPath) {
  const contents = {
    photos: [],
    videos: [],
    contacts: [],
    messages: [],
    callLogs: [],
    apps: [],
    documents: [],
    totalSize: 0
  };

  try {
    if (!fs.existsSync(backupPath)) {
      return { success: false, error: 'Backup path does not exist' };
    }

    contents.photos = findFilesRecursive(backupPath, isImageFile);
    contents.videos = findFilesRecursive(backupPath, isVideoFile);
    contents.contacts = findFilesRecursive(backupPath, isContactFile);

    const msgPath = path.join(backupPath, 'message');
    const altMsgPath = path.join(backupPath, 'Messages');
    const smsPath = path.join(backupPath, 'sms');
    
    for (const mp of [msgPath, altMsgPath, smsPath]) {
      if (fs.existsSync(mp)) {
        const msgFiles = findFilesRecursive(mp, (f) => {
          const ext = getFileExtension(f);
          return ext === '.xml' || ext === '.json' || ext === '.vmsg' || ext === '.db';
        });
        contents.messages.push(...msgFiles);
      }
    }

    const callPath = path.join(backupPath, 'call');
    const altCallPath = path.join(backupPath, 'CallLog');
    for (const cp of [callPath, altCallPath]) {
      if (fs.existsSync(cp)) {
        const callFiles = findFilesRecursive(cp, (f) => {
          const ext = getFileExtension(f);
          return ext === '.xml' || ext === '.json' || ext === '.db';
        });
        contents.callLogs.push(...callFiles);
      }
    }

    const apkPath = path.join(backupPath, 'app');
    const altApkPath = path.join(backupPath, 'Apps');
    for (const ap of [apkPath, altApkPath]) {
      if (fs.existsSync(ap)) {
        const apkFiles = findFilesRecursive(ap, (f) => getFileExtension(f) === '.apk');
        contents.apps.push(...apkFiles);
      }
    }

    contents.documents = findFilesRecursive(backupPath, (f) => {
      const ext = getFileExtension(f);
      return ['.pdf', '.doc', '.docx', '.txt', '.xlsx', '.pptx', '.csv'].includes(ext);
    });

    contents.totalSize = [
      ...contents.photos,
      ...contents.videos,
      ...contents.contacts,
      ...contents.messages,
      ...contents.callLogs,
      ...contents.apps,
      ...contents.documents
    ].reduce((sum, f) => sum + (f.size || 0), 0);

    return {
      success: true,
      contents: {
        photos: { count: contents.photos.length, files: contents.photos },
        videos: { count: contents.videos.length, files: contents.videos },
        contacts: { count: contents.contacts.length, files: contents.contacts },
        messages: { count: contents.messages.length, files: contents.messages },
        callLogs: { count: contents.callLogs.length, files: contents.callLogs },
        apps: { count: contents.apps.length, files: contents.apps },
        documents: { count: contents.documents.length, files: contents.documents }
      },
      totalSize: formatSize(contents.totalSize),
      totalSizeBytes: contents.totalSize
    };
  } catch (error) {
    console.error('Error scanning Samsung backup:', error);
    return { success: false, error: error.message };
  }
}

async function exportAndroidData(backupPath, exportPath, dataTypes) {
  const results = {
    exported: [],
    failed: [],
    totalFiles: 0,
    totalSize: 0
  };

  try {
    const scan = await scanSamsungBackupContents(backupPath);
    if (!scan.success) {
      return { success: false, error: scan.error };
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const exportDir = path.join(exportPath, `SafeRestore-Android-Export-${timestamp}`);
    fs.mkdirSync(exportDir, { recursive: true });

    for (const dataType of dataTypes) {
      const typeData = scan.contents[dataType];
      if (!typeData || typeData.count === 0) continue;

      const typeDir = path.join(exportDir, dataType);
      fs.mkdirSync(typeDir, { recursive: true });

      for (const file of typeData.files) {
        try {
          const destPath = path.join(typeDir, file.name);
          
          let finalPath = destPath;
          let counter = 1;
          while (fs.existsSync(finalPath)) {
            const ext = path.extname(file.name);
            const base = path.basename(file.name, ext);
            finalPath = path.join(typeDir, `${base}_${counter}${ext}`);
            counter++;
          }

          fs.copyFileSync(file.path, finalPath);
          results.exported.push({
            source: file.path,
            destination: finalPath,
            size: file.size,
            type: dataType
          });
          results.totalFiles++;
          results.totalSize += file.size;
        } catch (error) {
          results.failed.push({
            source: file.path,
            error: error.message,
            type: dataType
          });
        }
      }
    }

    const manifest = {
      exportDate: new Date().toISOString(),
      sourceBackup: backupPath,
      exportedTypes: dataTypes,
      totalFiles: results.totalFiles,
      totalSize: formatSize(results.totalSize),
      files: results.exported.map(f => ({
        type: f.type,
        name: path.basename(f.destination),
        size: formatSize(f.size)
      }))
    };

    fs.writeFileSync(
      path.join(exportDir, 'export-manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    return {
      success: true,
      exportPath: exportDir,
      totalFiles: results.totalFiles,
      totalSize: formatSize(results.totalSize),
      exported: results.exported.length,
      failed: results.failed.length,
      failedFiles: results.failed
    };
  } catch (error) {
    console.error('Export error:', error);
    return { success: false, error: error.message };
  }
}

function parseVcfContacts(vcfPath) {
  try {
    const content = fs.readFileSync(vcfPath, 'utf8');
    const contacts = [];
    const vcards = content.split('END:VCARD');

    for (const vcard of vcards) {
      if (!vcard.includes('BEGIN:VCARD')) continue;

      const contact = {
        name: '',
        phone: [],
        email: [],
        organization: ''
      };

      const nameMatch = vcard.match(/FN[;:]([^\r\n]+)/);
      if (nameMatch) contact.name = nameMatch[1].replace(/^[;:]/, '').trim();

      const phoneMatches = vcard.matchAll(/TEL[^:]*:([^\r\n]+)/g);
      for (const match of phoneMatches) {
        contact.phone.push(match[1].trim());
      }

      const emailMatches = vcard.matchAll(/EMAIL[^:]*:([^\r\n]+)/g);
      for (const match of emailMatches) {
        contact.email.push(match[1].trim());
      }

      const orgMatch = vcard.match(/ORG[;:]([^\r\n]+)/);
      if (orgMatch) contact.organization = orgMatch[1].replace(/^[;:]/, '').trim();

      if (contact.name || contact.phone.length > 0) {
        contacts.push(contact);
      }
    }

    return { success: true, contacts, count: contacts.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getAndroidBackupDetails(backupPath) {
  const scan = await scanSamsungBackupContents(backupPath);
  
  if (!scan.success) {
    return scan;
  }

  let sampleContacts = [];
  if (scan.contents.contacts.count > 0) {
    const firstVcf = scan.contents.contacts.files[0];
    if (firstVcf) {
      const parsed = parseVcfContacts(firstVcf.path);
      if (parsed.success) {
        sampleContacts = parsed.contacts.slice(0, 5);
      }
    }
  }

  return {
    success: true,
    summary: {
      photos: scan.contents.photos.count,
      videos: scan.contents.videos.count,
      contacts: scan.contents.contacts.count,
      messages: scan.contents.messages.count,
      callLogs: scan.contents.callLogs.count,
      apps: scan.contents.apps.count,
      documents: scan.contents.documents.count,
      totalSize: scan.totalSize
    },
    sampleContacts,
    canExport: {
      photos: scan.contents.photos.count > 0,
      videos: scan.contents.videos.count > 0,
      contacts: scan.contents.contacts.count > 0,
      messages: scan.contents.messages.count > 0,
      callLogs: scan.contents.callLogs.count > 0,
      documents: scan.contents.documents.count > 0
    }
  };
}

module.exports = {
  scanSamsungBackupContents,
  exportAndroidData,
  getAndroidBackupDetails,
  parseVcfContacts
};
