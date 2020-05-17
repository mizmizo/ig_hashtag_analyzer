window.remote = require('electron').remote;
window.ipcRenderer = require('electron').ipcRenderer;
window.log = require('electron-log');
window.log.transports.file.level = 'info';
window.log.transports.console.level = false;
