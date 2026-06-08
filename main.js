const { app, BrowserWindow, shell } = require('electron');
const path = require('node:path');
const expressApp = require('./server');
const db = require('./db');

let mainWindow;
let server;
const PORT = 0; // let OS pick a free port

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 800,
    minHeight: 600,
    title: '研究生工作记录',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.setMenuBarVisibility(false);

  // Open external links in system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.loadURL(`http://127.0.0.1:${server.address().port}`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  // 打包后数据存到用户目录，开发时存到项目目录
  const dataDir = app.isPackaged ? app.getPath('userData') : __dirname;
  await db.initDb(path.join(dataDir, 'data.db'));

  server = expressApp.listen(PORT, '127.0.0.1', () => {
    createWindow();
  });
});

app.on('window-all-closed', () => {
  db.save();
  if (server) server.close();
  app.quit();
});

app.on('activate', () => {
  if (!mainWindow) createWindow();
});
