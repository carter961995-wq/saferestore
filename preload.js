const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('safeRestore', {
  // iOS backup scanning
  scanBackups: () => ipcRenderer.invoke('scan-backups'),
  getBackupDetails: (backupPath) => ipcRenderer.invoke('get-backup-details', backupPath),
  exportData: (backupPath, exportPath, dataTypes) => ipcRenderer.invoke('export-data', backupPath, exportPath, dataTypes),
  selectExportFolder: () => ipcRenderer.invoke('select-export-folder'),
  openFolder: (folderPath) => ipcRenderer.invoke('open-folder', folderPath),
  
  // Android backup scanning
  scanAndroidBackups: () => ipcRenderer.invoke('scan-android-backups'),
  getAndroidBackupDetails: (backupPath) => ipcRenderer.invoke('get-android-backup-details', backupPath),
  exportAndroidData: (backupPath, exportPath, dataTypes) => ipcRenderer.invoke('export-android-data', backupPath, exportPath, dataTypes),
  
  // Mac/PC recovery
  scanTrash: () => ipcRenderer.invoke('scan-trash'),
  scanTimeMachine: () => ipcRenderer.invoke('scan-time-machine'),
  restoreFromTrash: (filePath, destinationPath) => ipcRenderer.invoke('restore-from-trash', filePath, destinationPath),
  openTimeMachine: () => ipcRenderer.invoke('open-time-machine'),
  
  // Cloud services
  getCloudStatus: () => ipcRenderer.invoke('get-cloud-status'),
  getCloudServices: () => ipcRenderer.invoke('get-cloud-services'),
  openCloudService: (serviceId) => ipcRenderer.invoke('open-cloud-service', serviceId),
  openDataExport: (serviceId) => ipcRenderer.invoke('open-data-export', serviceId),
  scanCloudFolder: (folderPath, options) => ipcRenderer.invoke('scan-cloud-folder', folderPath, options),
  
  // File browser - allows users to browse and select files
  browseFiles: (options) => ipcRenderer.invoke('browse-files', options),
  browseFolder: (folderPath) => ipcRenderer.invoke('browse-folder', folderPath),
  getFileInfo: (filePath) => ipcRenderer.invoke('get-file-info', filePath),
  copyFilesToDestination: (filePaths, destination) => ipcRenderer.invoke('copy-files', filePaths, destination),
  
  // External URLs (for payment flow)
  openExternal: (url) => ipcRenderer.invoke('open-external-url', url),
  
  getPlatform: () => process.platform,
});
