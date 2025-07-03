const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

let mainWindow;
// 添加全局变量来存储对话历史
let conversationHistory = [];

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

// Ollama API 调用函数-支持流式输出
async function callOllamaAPI(message, conversationHistory = []) {
  const apiUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/chat';
  const model = process.env.OLLAMA_MODEL || 'qwen2.5:7b';
  
  try {
    const messages = [
      {
        role: 'system',
        content: '你是一个友好、专业的AI助手。请用中文回答问题，保持对话的连贯性和上下文理解。回答要详细、准确，并且富有个性。'
      },
      ...conversationHistory.slice(-8), // 减少到8轮对话
      {
        role: 'user',
        content: message
      }
    ];

    const response = await axios.post(apiUrl, {
      model: model,
      messages: messages,
      stream: false, // 先保持 false，流式输出需要更复杂的实现
      options: {
        temperature: 0.7,      // 降低一点创造性
        top_p: 0.8,           // 降低一点多样性
        repeat_penalty: 1.1,
        // 提速和减少资源消耗
        num_predict: 300,     // 进一步限制输出长度
        num_ctx: 1024,        // 大幅减少上下文长度
        num_batch: 512,       // 批处理大小
        num_thread: 4         // 线程数
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 减少超时时间
    });

    return response.data.message.content;
  } catch (error) {
    console.error('Ollama API Error:', error);
    
    if (error.response) {
      throw new Error(`API Error: ${error.response.status} - ${error.response.data?.error || 'Unknown error'}`);
    } else if (error.request) {
      throw new Error('Network error: Unable to connect to Ollama API');
    } else {
      throw new Error(`Error: ${error.message}`);
    }
  }
}

// 修改后的 IPC 处理程序，支持对话历史
ipcMain.handle('send-message', async (event, message) => {
  try {
    // 将用户消息添加到对话历史
    conversationHistory.push({
      role: 'user',
      content: message
    });
    
    const aiResponse = await callOllamaAPI(message, conversationHistory);
    
    // 将 AI 回复添加到对话历史
    conversationHistory.push({
      role: 'assistant',
      content: aiResponse
    });
    
    // 限制对话历史长度，避免消耗过多内存
    if (conversationHistory.length > 20) {
      conversationHistory = conversationHistory.slice(-20);
    }
    
    return {
      id: Date.now().toString(),
      content: aiResponse,
      sender: 'ai',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('发送消息失败:', error);
    
    return {
      id: Date.now().toString(),
      content: `抱歉，我现在无法处理您的请求。错误信息: ${error.message}`,
      sender: 'ai',
      timestamp: new Date().toISOString()
    };
  }
});

// 添加清除对话历史的 IPC 处理程序
ipcMain.handle('clear-conversation', async (event) => {
  conversationHistory = [];
  return { success: true };
});

// 添加获取对话历史的 IPC 处理程序
ipcMain.handle('get-conversation-history', async (event) => {
  return conversationHistory;
});