const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 统一的发送消息接口（支持流式输出）
  sendMessage: (message) => ipcRenderer.invoke('send-message', message),
  clearConversation: () => ipcRenderer.invoke('clear-conversation'),
  getConversationHistory: () => ipcRenderer.invoke('get-conversation-history'),
  
  // 【新增】设置用户配置
  setUserConfig: (config) => ipcRenderer.invoke('set-user-config', config),
  
  // 流式输出事件监听
  onMessageStreamStart: (callback) => ipcRenderer.on('message-stream-start', callback),
  onMessageStreamChunk: (callback) => ipcRenderer.on('message-stream-chunk', callback),
  onMessageStreamEnd: (callback) => ipcRenderer.on('message-stream-end', callback),
  onMessageStreamError: (callback) => ipcRenderer.on('message-stream-error', callback),
  
  // 清理监听器
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel, ...args) => ipcRenderer.send(channel, ...args),
    on: (channel, listener) => ipcRenderer.on(channel, listener)
  }
});