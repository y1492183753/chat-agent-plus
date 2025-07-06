const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
require('dotenv').config();

// 引入聊天服务和知识库服务
const chatService = require('./chatService');
const knowledgeBase = require('./knowledgeBase');

let mainWindow;

// 全局知识库加载标志
let kbLoaded = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, ''),
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    minWidth: 800,
    minHeight: 600,
    show: false,
    vibrancy: process.platform === 'darwin' ? 'under-window' : undefined,
    center: true
  });

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

app.whenReady().then(async () => {
  createWindow();
  chatService.clearConversationHistory();
  // 加载本地知识库（请根据实际路径调整）
  try {
    await knowledgeBase.loadTxtKnowledgeBase(path.join(__dirname, '../assets/knowledge/my_knowledge.txt'));
    kbLoaded = true;
    console.log('本地知识库已加载');
  } catch (e) {
    console.warn('本地知识库加载失败:', e.message);
  }
  chatService.callOllamaAPI('你好', [], () => {}, true).catch(() => {});
});

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

// 聊天相关 IPC 事件
ipcMain.handle('set-user-config', async (event, config) => {
  chatService.setUserConfig(config);
  console.log('用户配置已设置:', chatService.getUserConfig());
  return { success: true };
});

ipcMain.handle('send-message', async (event, message) => {
  try {
    chatService.pushUserMessage(message);
    const messageId = Date.now().toString();
    try {
      if (event.sender && !event.sender.isDestroyed()) {
        event.sender.send('message-stream-start', messageId);
      }
    } catch (sendError) {
      console.warn('Failed to send stream start:', sendError.message);
    }
    // 检索本地知识库
    let kbContext = '';
    if (kbLoaded) {
      const kbResults = await knowledgeBase.searchKnowledgeBase(message, 3);
      if (kbResults.length) {
        kbContext = kbResults.join('\n');
      }
    }
    const fullResponse = await chatService.callOllamaAPI(
      message,
      chatService.getConversationHistory(),
      (chunk) => {
        try {
          if (event.sender && !event.sender.isDestroyed()) {
            event.sender.send('message-stream-chunk', messageId, chunk);
          }
        } catch (sendError) {
          console.warn('Failed to send chunk:', sendError.message);
        }
      },
      false,
      kbContext // 新增：知识库上下文
    );
    chatService.pushAssistantMessage(fullResponse);
    try {
      if (event.sender && !event.sender.isDestroyed()) {
        event.sender.send('message-stream-end', messageId);
      }
    } catch (sendError) {
      console.warn('Failed to send stream end:', sendError.message);
    }
    return {
      id: messageId,
      content: fullResponse,
      sender: 'ai',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('发送消息失败:', error);
    const messageId = Date.now().toString();
    try {
      if (event.sender && !event.sender.isDestroyed()) {
        event.sender.send('message-stream-error', messageId, error.message);
      }
    } catch (sendError) {
      console.warn('Failed to send error:', sendError.message);
    }
    return {
      id: messageId,
      content: `抱歉，我现在无法处理您的请求。错误信息: ${error.message}`,
      sender: 'ai',
      timestamp: new Date().toISOString()
    };
  }
});

ipcMain.handle('clear-conversation', async (event) => {
  chatService.clearConversationHistory();
  return { success: true };
});

ipcMain.handle('get-conversation-history', async (event) => {
  return chatService.getConversationHistory();
});

// 知识库相关 IPC 事件（接口预留，可扩展）
ipcMain.handle('search-knowledge-base', async (event, query) => {
  return knowledgeBase.searchKnowledgeBase(query);
});

ipcMain.handle('add-knowledge-entry', async (event, entry) => {
  knowledgeBase.addKnowledgeEntry(entry);
  return { success: true };
});

ipcMain.handle('clear-knowledge-base', async (event) => {
  knowledgeBase.clearKnowledgeBase();
  return { success: true };
});