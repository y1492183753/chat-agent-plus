const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 统一的发送消息接口（支持流式输出）
  sendMessage: (message) => ipcRenderer.invoke('send-message', message),
  clearConversation: () => ipcRenderer.invoke('clear-conversation'),
  getConversationHistory: () => ipcRenderer.invoke('get-conversation-history'),
  
  // 流式输出事件监听
  onMessageStreamStart: (callback) => ipcRenderer.on('message-stream-start', callback),
  onMessageStreamChunk: (callback) => ipcRenderer.on('message-stream-chunk', callback),
  onMessageStreamEnd: (callback) => ipcRenderer.on('message-stream-end', callback),
  onMessageStreamError: (callback) => ipcRenderer.on('message-stream-error', callback),
  
  // 清理监听器
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});