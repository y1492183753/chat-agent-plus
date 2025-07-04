const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

let mainWindow;
// 添加全局变量来存储对话历史
let conversationHistory = [];
// 添加用户配置全局变量
let userConfig = null;

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

app.whenReady().then(() => {
  createWindow();
  // 预热模型
  warmupModel();
});

// 修改预热函数，不污染对话历史
async function warmupModel() {
  try {
    console.log('正在预热模型...');
    // 使用独立的预热调用，不影响对话历史
    const apiUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/chat';
    const model = process.env.OLLAMA_MODEL || 'qwen2.5:7b';
    
    await axios.post(apiUrl, {
      model: model,
      messages: [{ role: 'user', content: 'hello' }],
      stream: false,
      options: { num_predict: 1 }
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    console.log('模型预热完成');
  } catch (error) {
    console.log('模型预热失败:', error.message);
  }
}

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

// 统一的 Ollama API 调用函数 - 支持流式输出
async function callOllamaAPI(message, conversationHistory = [], onChunk) {
  const apiUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/chat';
  const model = process.env.OLLAMA_MODEL || 'qwen2.5:7b';
  
  try {
    // 动态构建系统消息，使用用户配置的AI个性
    let systemContent = '你是个和善、专业的AI助手。';
    
    if (userConfig && userConfig.aiIntro) {
      systemContent = userConfig.aiIntro;
    } else if (userConfig && userConfig.aiName) {
      systemContent = `你是${userConfig.aiName}，一个友善、专业的AI助手。`;
    }

    console.log('调用 Ollama API:', systemContent)

    const messages = [
      {
        role: 'system',
        content: systemContent
      },
      ...conversationHistory.slice(-20), // 仅保留最近的20条消息
      {
        role: 'user',
        content: message
      }
    ];

    const response = await axios.post(apiUrl, {
      model: model,
      messages: messages,
      stream: true, // 统一使用流式输出
      options: {
        temperature: 0.8,        // 提高创造性和多样性
        top_p: 0.9,             // 增加词汇选择范围
        repeat_penalty: 1.15,    // 稍微提高重复惩罚
        num_predict: 800,        // 大幅增加最大生成长度
        num_ctx: 4096,          // 显著增加上下文窗口
        num_batch: 1024,        // 提高批处理大小
        num_thread: 8           // 增加线程数（根据CPU核心数调整）
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000,
      responseType: 'stream'
    });

    let fullContent = '';
    
    // 处理流式数据
    return new Promise((resolve, reject) => {
      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n');
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              if (data.message && data.message.content) {
                fullContent += data.message.content;
                // 通过回调发送增量内容
                onChunk(data.message.content);
              }
              // 检查是否完成
              if (data.done) {
                resolve(fullContent);
              }
            } catch (e) {
              // 忽略解析错误的行
            }
          }
        }
      });

      response.data.on('end', () => {
        resolve(fullContent);
      });

      response.data.on('error', (error) => {
        reject(error);
      });
    });

  } catch (error) {
    console.error('Ollama API Error:', error);
    throw error;
  }
}

// 新增设置用户配置的 IPC 处理程序
ipcMain.handle('set-user-config', async (event, config) => {
  userConfig = config;
  console.log('用户配置已设置:', userConfig);
  return { success: true };
});

// 统一的 IPC 处理程序 - 支持流式输出，增加错误处理
ipcMain.handle('send-message', async (event, message) => {
  try {
    // 将用户消息添加到对话历史
    conversationHistory.push({
      role: 'user',
      content: message
    });
    
    const messageId = Date.now().toString();
    
    // 安全地发送开始信号
    try {
      if (event.sender && !event.sender.isDestroyed()) {
        event.sender.send('message-stream-start', messageId);
      }
    } catch (sendError) {
      console.warn('Failed to send stream start:', sendError.message);
    }
    
    const fullResponse = await callOllamaAPI(
      message, 
      conversationHistory,
      (chunk) => {
        // 安全地发送增量内容
        try {
          if (event.sender && !event.sender.isDestroyed()) {
            event.sender.send('message-stream-chunk', messageId, chunk);
          }
        } catch (sendError) {
          console.warn('Failed to send chunk:', sendError.message);
        }
      }
    );
    
    // 将 AI 回复添加到对话历史
    conversationHistory.push({
      role: 'assistant',
      content: fullResponse
    });
    
    // 限制对话历史长度
    if (conversationHistory.length > 20) {
      conversationHistory = conversationHistory.slice(-20);
    }
    
    // 安全地发送结束信号
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
    
    // 安全地发送错误信号
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

// 清除对话历史的 IPC 处理程序
ipcMain.handle('clear-conversation', async (event) => {
  conversationHistory = [];
  return { success: true };
});

// 获取对话历史的 IPC 处理程序
ipcMain.handle('get-conversation-history', async (event) => {
  return conversationHistory;
});