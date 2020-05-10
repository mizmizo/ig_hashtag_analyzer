'use strict';

const path = require('path');
const log = require('electron-log');
log.transports.file.level = 'info';
// log.transports.file.getFile();

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
let mainWindow;
const Menu = electron.Menu;
const {crashReporter, dialog} = require('electron');
const ipcMain = electron.ipcMain;
app.allowRendererProcessReuse = true;

const process = require('process');
const token_path = process.env.NODE_ENV === 'development'
      ? path.join(__dirname, 'token.json')
      : path.join(process.resourcesPath, 'token.json');
log.error(token_path);
const token = require(token_path);
const TagAnalyzer = require('./lib/tag_analyzer');
const analyzer = new TagAnalyzer(token);

process.on('uncaughtException', function(err) {
  log.error('electron:event:uncaughtException');
  log.error(err);
  log.error(err.stack);
  app.quit();
});

crashReporter.start({
  productName: 'ig_h_a',
  companyName: '',
  submitURL: 'url": "https://github.com/mizmizo/ig_hashtag_analyzer/issues', // TODO
  autoSubmit: true
});

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', function() {
    Menu.setApplicationMenu(menu);
    openWindow('index');
});

function openWindow (page) {
    mainWindow = new BrowserWindow({
        width: 1180,
        height: 960,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });
    reloadURL(page);

    mainWindow.on('closed', function() {
        mainWindow = null;
    });
};

function reloadURL (page) {
    mainWindow.loadURL('file://' + __dirname + '/' + page + '.html');
}

// メニュー情報の作成
const template = [
    {
        label: 'Quit',
        submenu: [
            {label: 'Quit',
             accelerator: 'Command+Q',
             click: function () {
                 app.quit();
             }}
        ]
    }, {
        label: 'Operation',
        submenu: [
            {
                label: 'Load Posts',
                accelerator: 'Command+O',
                click: function () {
                }
            }
        ]
    }, {
        label: 'View',
        submenu: [
            {label: 'Reload',
             accelerator: 'Command+R',
             click: function () {
                 BrowserWindow.getFocusedWindow().reload();
             }},
            {
                label: 'Toggle DevTools',
                accelerator: 'Alt+Command+I',
                click: function () {
                    BrowserWindow.getFocusedWindow().toggleDevTools();
                }
            }
        ]
    }
];

const menu = Menu.buildFromTemplate(template);

// IPC通信のCB

ipcMain.handle('requestPostData', () => {
    analyzer.requestPostData().then(() => {
        reloadURL('select');
    });
});

ipcMain.handle('getTagList', () => {
    let list = analyzer.getAllTagList();
    return list;
});

ipcMain.handle('analyse', (event, tags) => {
    analyzer.analyse(tags).then(() => {
        reloadURL('result');
    });
});

ipcMain.handle('getGalleyData', () => {
    let data = analyzer.getGalleyData();
    return data;
});

ipcMain.handle('cancel', () => {
    reloadURL('index');
});
