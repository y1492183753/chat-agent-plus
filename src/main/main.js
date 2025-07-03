const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, ''), // 可选图标
    // 在 macOS 上使用隐藏标题栏但保留交通灯按钮
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    // 设置最小窗口大小
    minWidth: 800,
    minHeight: 600,
    show: false,
    // 在 macOS 上启用 vibrancy 效果
    vibrancy: process.platform === 'darwin' ? 'under-window' : undefined,
    // 确保窗口居中
    center: true
  });

  // 加载应用
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadFile(path.join(__dirname, '../../dist/renderer/index.html'));
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/renderer/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC 处理程序 - 用于后续与 AI API 通信
ipcMain.handle('send-message', async (event, message) => {
  // 这里后续会实现 AI API 调用
  // 现在先返回一个简单的回复
  return {
    id: Date.now().toString(),
    content: `收到您的消息: "${message}"。这是一个测试回复。`,
    sender: 'ai',
    timestamp: new Date().toISOString()
  };
});