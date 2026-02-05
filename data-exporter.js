const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function getManifestDbPath(backupPath) {
  return path.join(backupPath, 'Manifest.db');
}

function hashFilename(domain, relativePath) {
  const fullPath = `${domain}-${relativePath}`;
  return crypto.createHash('sha1').update(fullPath).digest('hex');
}

function copyFileFromBackup(backupPath, fileHash, destPath) {
  const hashPrefix = fileHash.substring(0, 2);
  const sourcePath = path.join(backupPath, hashPrefix, fileHash);
  
  if (!fs.existsSync(sourcePath)) {
    const altSourcePath = path.join(backupPath, fileHash);
    if (fs.existsSync(altSourcePath)) {
      fs.copyFileSync(altSourcePath, destPath);
      return true;
    }
    return false;
  }
  
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  fs.copyFileSync(sourcePath, destPath);
  return true;
}

async function exportPhotos(backupPath, exportPath) {
  const photosDir = path.join(exportPath, 'Photos');
  if (!fs.existsSync(photosDir)) {
    fs.mkdirSync(photosDir, { recursive: true });
  }
  
  let exportedCount = 0;
  
  const cameraRollDomain = 'CameraRollDomain';
  const mediaDomain = 'MediaDomain';
  
  const manifestPath = getManifestDbPath(backupPath);
  
  try {
    const files = fs.readdirSync(backupPath);
    for (const file of files) {
      if (file.length === 2 && /^[0-9a-f]{2}$/i.test(file)) {
        const subDir = path.join(backupPath, file);
        if (fs.statSync(subDir).isDirectory()) {
          const hashFiles = fs.readdirSync(subDir);
          for (const hashFile of hashFiles) {
            if (hashFile.length === 40) {
              const sourcePath = path.join(subDir, hashFile);
              try {
                const buffer = Buffer.alloc(8);
                const fd = fs.openSync(sourcePath, 'r');
                fs.readSync(fd, buffer, 0, 8, 0);
                fs.closeSync(fd);
                
                const magicJPEG = buffer.slice(0, 2).toString('hex') === 'ffd8';
                const magicPNG = buffer.slice(0, 4).toString('hex') === '89504e47';
                const magicHEIC = buffer.slice(4, 8).toString() === 'ftyp';
                const magicMOV = buffer.slice(4, 8).toString() === 'ftyp' || buffer.slice(4, 8).toString() === 'moov';
                
                let ext = null;
                if (magicJPEG) ext = '.jpg';
                else if (magicPNG) ext = '.png';
                else if (magicHEIC) ext = '.heic';
                else if (magicMOV) ext = '.mov';
                
                if (ext) {
                  const destPath = path.join(photosDir, `photo_${exportedCount + 1}${ext}`);
                  fs.copyFileSync(sourcePath, destPath);
                  exportedCount++;
                }
              } catch (e) {}
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error exporting photos:', error);
  }
  
  return exportedCount;
}

async function exportMessages(backupPath, exportPath) {
  const messagesDir = path.join(exportPath, 'Messages');
  if (!fs.existsSync(messagesDir)) {
    fs.mkdirSync(messagesDir, { recursive: true });
  }
  
  const smsDbHash = hashFilename('HomeDomain', 'Library/SMS/sms.db');
  const smsDbPath = path.join(messagesDir, 'sms.db');
  
  let found = copyFileFromBackup(backupPath, smsDbHash, smsDbPath);
  
  if (!found) {
    const knownSmsHashes = [
      '3d0d7e5fb2ce288813306e4d4636395e047a3d28',
      'b6ffad9e1b00e020e5f6a2fd1e54e7aae6b74bf4',
    ];
    
    for (const hash of knownSmsHashes) {
      if (copyFileFromBackup(backupPath, hash, smsDbPath)) {
        found = true;
        break;
      }
    }
  }
  
  const readmePath = path.join(messagesDir, 'README.txt');
  fs.writeFileSync(readmePath, `Messages Export
================

${found ? 'Your SMS/iMessage database has been exported as sms.db' : 'Messages database not found in this backup.'}

To view messages, you can use a SQLite browser like "DB Browser for SQLite" (free).
Open the sms.db file and look at the "message" table.

The database contains your text messages, iMessages, and related attachments.
`);
  
  return found ? 1 : 0;
}

async function exportContacts(backupPath, exportPath) {
  const contactsDir = path.join(exportPath, 'Contacts');
  if (!fs.existsSync(contactsDir)) {
    fs.mkdirSync(contactsDir, { recursive: true });
  }
  
  const contactsDbHash = hashFilename('HomeDomain', 'Library/AddressBook/AddressBook.sqlitedb');
  const contactsDbPath = path.join(contactsDir, 'AddressBook.sqlitedb');
  
  let found = copyFileFromBackup(backupPath, contactsDbHash, contactsDbPath);
  
  if (!found) {
    const knownContactHashes = [
      '31bb7ba8914766d4ba40d6dfb6113c8b614be442',
      'cd6702cea29fe89cf280a76794405adb17f9a0ee',
    ];
    
    for (const hash of knownContactHashes) {
      if (copyFileFromBackup(backupPath, hash, contactsDbPath)) {
        found = true;
        break;
      }
    }
  }
  
  const readmePath = path.join(contactsDir, 'README.txt');
  fs.writeFileSync(readmePath, `Contacts Export
================

${found ? 'Your contacts database has been exported as AddressBook.sqlitedb' : 'Contacts database not found in this backup.'}

To view contacts, you can use a SQLite browser like "DB Browser for SQLite" (free).
Open the AddressBook.sqlitedb file to browse your contacts.
`);
  
  return found ? 1 : 0;
}

async function exportNotes(backupPath, exportPath) {
  const notesDir = path.join(exportPath, 'Notes');
  if (!fs.existsSync(notesDir)) {
    fs.mkdirSync(notesDir, { recursive: true });
  }
  
  const notesDbHash = hashFilename('HomeDomain', 'Library/Notes/notes.sqlite');
  const notesDbPath = path.join(notesDir, 'notes.sqlite');
  
  let found = copyFileFromBackup(backupPath, notesDbHash, notesDbPath);
  
  if (!found) {
    const knownNotesHashes = [
      'ca3bc056d4da0bbf88b5fb3be254f3b7147e639c',
      '4f98687d8ab0d6d1a371110e6b7300f6e465bef2',
    ];
    
    for (const hash of knownNotesHashes) {
      if (copyFileFromBackup(backupPath, hash, notesDbPath)) {
        found = true;
        break;
      }
    }
  }
  
  const readmePath = path.join(notesDir, 'README.txt');
  fs.writeFileSync(readmePath, `Notes Export
================

${found ? 'Your notes database has been exported as notes.sqlite' : 'Notes database not found in this backup.'}

To view notes, you can use a SQLite browser like "DB Browser for SQLite" (free).
Look in the ZNOTEBODY or ZICNOTEDATA tables for your note content.
`);
  
  return found ? 1 : 0;
}

async function exportCallHistory(backupPath, exportPath) {
  const callsDir = path.join(exportPath, 'CallHistory');
  if (!fs.existsSync(callsDir)) {
    fs.mkdirSync(callsDir, { recursive: true });
  }
  
  const callDbHash = hashFilename('HomeDomain', 'Library/CallHistoryDB/CallHistory.storedata');
  const callDbPath = path.join(callsDir, 'CallHistory.storedata');
  
  let found = copyFileFromBackup(backupPath, callDbHash, callDbPath);
  
  if (!found) {
    const knownCallHashes = [
      '2b2b0084a1bc3a5ac8c27afdf14afb42c61a19ca',
      '5a4935c78a5255723f707230a451d79c540d2741',
    ];
    
    for (const hash of knownCallHashes) {
      if (copyFileFromBackup(backupPath, hash, callDbPath)) {
        found = true;
        break;
      }
    }
  }
  
  const readmePath = path.join(callsDir, 'README.txt');
  fs.writeFileSync(readmePath, `Call History Export
================

${found ? 'Your call history database has been exported as CallHistory.storedata' : 'Call history database not found in this backup.'}

To view call history, you can use a SQLite browser like "DB Browser for SQLite" (free).
Look in the ZCALLRECORD table for your call records.
`);
  
  return found ? 1 : 0;
}

async function exportBackupData(backupPath, exportPath, dataTypes) {
  const results = {
    success: true,
    exported: {},
    errors: [],
  };
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const exportFolder = path.join(exportPath, `SafeRestore_Export_${timestamp}`);
  
  if (!fs.existsSync(exportFolder)) {
    fs.mkdirSync(exportFolder, { recursive: true });
  }
  
  try {
    if (dataTypes.photos) {
      const count = await exportPhotos(backupPath, exportFolder);
      results.exported.photos = count;
    }
    
    if (dataTypes.messages) {
      const count = await exportMessages(backupPath, exportFolder);
      results.exported.messages = count;
    }
    
    if (dataTypes.contacts) {
      const count = await exportContacts(backupPath, exportFolder);
      results.exported.contacts = count;
    }
    
    if (dataTypes.notes) {
      const count = await exportNotes(backupPath, exportFolder);
      results.exported.notes = count;
    }
    
    if (dataTypes.calls) {
      const count = await exportCallHistory(backupPath, exportFolder);
      results.exported.calls = count;
    }
    
    const summaryPath = path.join(exportFolder, 'EXPORT_SUMMARY.txt');
    fs.writeFileSync(summaryPath, `SafeRestore Data Export Summary
================================
Export Date: ${new Date().toLocaleString()}
Source Backup: ${backupPath}

Exported Data:
- Photos: ${results.exported.photos || 0} files
- Messages: ${results.exported.messages ? 'Database exported' : 'Not found'}
- Contacts: ${results.exported.contacts ? 'Database exported' : 'Not found'}
- Notes: ${results.exported.notes ? 'Database exported' : 'Not found'}
- Call History: ${results.exported.calls ? 'Database exported' : 'Not found'}

To view database files (.sqlite, .db, .sqlitedb, .storedata):
Download "DB Browser for SQLite" from https://sqlitebrowser.org/

Thank you for using SafeRestore!
Website: https://saferestorehelp.com
`);
    
  } catch (error) {
    results.success = false;
    results.error = error.message;
    results.errors.push(error.message);
  }
  
  return results;
}

module.exports = {
  exportBackupData,
};
