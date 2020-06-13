'use strict';

// Setup debug log
const log = require('electron-log');
log.transports.file.level = 'info';
log.transports.console.level = false;
log.info('Start app.');


// Setup Electron
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
let mainWindow;
const Menu = electron.Menu;
const {crashReporter, dialog} = require('electron');
const ipcMain = electron.ipcMain;
app.allowRendererProcessReuse = true;

// load Graph API access token
const {AccessInfo, validateAccessInfo, generatePermanentToken} = require('./lib/token_operator');
const AppSetting = require('./lib/setting_operator');
let setting = new AppSetting();
const process = require('process');
const path = require('path');
log.info(process.env.NODE_ENV)
const setting_path = process.env.NODE_ENV === 'development'
      ? path.join(__dirname, '../token/appsetting.json')
      : path.join(process.resourcesPath, 'appsetting.json');
log.info('Setting : ' + setting_path);
try{
    setting.importFile(setting_path);
} catch(err) {
    log.error(err);
    setting = new AppSetting();
    log.info("load setting failed. load default...");
}
log.info('setting : ' + JSON.stringify(setting, null, 1));

// load analyzer logic-class
const TagAnalyzer = require('./lib/tag_analyzer');
let analyzer;

process.on('uncaughtException', function(err) {
  log.error('Electron:event:uncaughtException');
  log.error(err);
  log.error(err.stack);
  app.quit();
});

// TODO : set valid-setting
crashReporter.start({
  productName: 'ig_h_a',
  companyName: '',
  submitURL: 'url": "https://github.com/mizmizo/ig_hashtag_analyzer/issues',
  autoSubmit: true
});

app.on('window-all-closed', function() {
    log.info('Quit App by window-all-closed.');
    app.quit();
});

app.on('ready', function() {
    Menu.setApplicationMenu(menu);
    openWindow('index');
});

function openWindow (page) {
    log.info('OpenWindow : ' + page);
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
    log.info('reloadURL : ' + page);
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
                 log.info('Quit App by Quit menu.');
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

// AppError handling
function logAndShowErr(err) {
    log.error(err);
    dialog.showErrorBox(err.name + ' : ' +  err.code, err.message);
}

// 分析処理CB
ipcMain.handle('requestPostData', () => {
    log.info('IPC CB : requestPostData');
    analyzer = new TagAnalyzer(setting, log);
    analyzer.requestPostData()
        .then(() => {
            reloadURL('select');
        })
        .catch((err) => {
            logAndShowErr(err);
            if(!err.sustainable){
                log.info('Quit App by Error.');
                app.quit();
            } else {
                reloadURL('index');
            }
        });
});

ipcMain.handle('getTagList', () => {
    log.info('IPC CB : getTagList');
    try{
        let list = analyzer.getAllTagList();
        return list;
    } catch (err) {
        logAndShowErr(err);
        if(!err.sustainable){
            log.info('Quit App by Error.');
            app.quit();
        } else {
            reloadURL('index');
        }
    }
});

ipcMain.handle('analyse', (event, tags) => {
    log.info('IPC CB : analyse');
    analyzer.analyse(tags)
        .then(() => {
            reloadURL('result');
        })
        .catch((err) => {
            logAndShowErr(err);
            if(!err.sustainable){
                log.info('Quit App by Error.');
                app.quit();
            } else {
                reloadURL('index');
            }
        });
});

ipcMain.handle('getGalleyData', () => {
    log.info('IPC CB : getGalleyData');
    try {
        let data = analyzer.getGalleyData();
        return data;
    } catch (err) {
        logAndShowErr(err);
        if(!err.sustainable){
            log.info('Quit App by Error.');
            app.quit();
        } else {
            reloadURL('index');
        }
    }
});

// 画面遷移CB
ipcMain.handle('cancel', () => {
    log.info('IPC CB : cancel');
    reloadURL('index');
});

ipcMain.handle('toHowto', () => {
    log.info('IPC CB : toHowto');
    reloadURL("howto")
});

ipcMain.handle('toExplain', () => {
    log.info('IPC CB : toExplain');
    reloadURL("explain")
});

// 分析設定CB
ipcMain.handle('getCurrentSetting', () => {
    log.info('IPC CB : getCurrentSetting');
    log.info(setting)
    return setting;
});

// params = {first_token:, app_id:, app_secret:, pagename:} <- str
ipcMain.handle('generatePermanentToken', async (event, params) => {
    log.info('IPC CB : generatePermanentToken');
    // 永続トークンの生成・チェック⇒OKなら登録
    let result = false;
    await generatePermanentToken(params.first_token, params.app_id,
                           params.app_secret, params.pagename, log)
    .then((ac) => {
        setting.ac = ac;
        setting.is_valid = true;
        result = true;
    })
    .catch((err) => {
        logAndShowErr(err);
        result = false;
    });
    return(result)

});
// params = {igID:, token:} <- str
ipcMain.handle('registerAccessInfo', async (event, params) => {
    log.info('IPC CB : registerAccessInfo');
    // 永続トークンのチェック⇒OKなら登録
    const ac = new AccessInfo(params.igID, params.token)
    let result = false;
    await validateAccessInfo(ac, log)
    .then(() => {
        setting.ac = ac;
        console.log(setting.ac)
        setting.is_valid = true;
        log.info('return true');
        result = true;
    })
    .catch((err) => {
        log.info('return false');
        logAndShowErr(err);
        result = false;
    });
    return(result)

});
// params = {post_num:, top_thre:} <- str
ipcMain.handle('registerSetting', async (event, params) => {
    log.info('IPC CB : registerSetting');
    log.info('params : ' + params);
    try{
        // value check : post_num
        const post_num_num = Number.parseFloat(params.post_num);
        log.info(typeof(post_num_num))
        if(!Number.isInteger(post_num_num) && post_num_num > 0){
            log.info('Invalid post_num : ' + post_num_num);
            dialog.showErrorBox("分析パラメータエラー", "分析する投稿数は自然数を指定して下さい。");
            return false;
        }

        // value check : top_thre
        const top_thre_num = Number.parseFloat(params.top_thre)
        if(!Number.isInteger(top_thre_num) && top_thre_num > 0){
            log.info('Invalid top_thre : ' + top_thre_num);
            dialog.showErrorBox("分析パラメータエラー", "人気投稿判定は自然数を指定して下さい。");
            return false;
        }

        // register setting
        setting.post_num = params.post_num;
        setting.top_thre = params.top_thre;

        // export to json file
        setting.exportFile(setting_path);
        reloadURL('index');
    } catch(err) {
        logAndShowErr(err);
        if(!err.sustainable){
            log.info('Quit App by Error.');
            app.quit();
        }
    }
});
