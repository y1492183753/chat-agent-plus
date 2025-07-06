// 聊天服务相关逻辑
const axios = require('axios');

// 对话历史
let conversationHistory = [];
let userConfig = null;

// 新增：支持知识库上下文
async function callOllamaAPI(message, conversationHistory = [], onChunk, isWarmup = false, kbContext = '') {
  const apiUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/chat';
  const model = process.env.OLLAMA_MODEL || 'qwen2.5:7b';
  try {
    let systemContent = '你是个和善、专业的AI助手。';
    if (userConfig && userConfig.aiIntro) {
      systemContent = `${userConfig.aiIntro}\n\n【核心约束规则】\n- 不要输出markdown格式文本`;
    } else if (userConfig && userConfig.aiName) {
      systemContent = `你是${userConfig.aiName}，一个友善、专业的AI助手。`;
    }
    // 拼接知识库上下文
    if (kbContext && kbContext.trim()) {
      systemContent = `【知识库参考】\n${kbContext}\n\n${systemContent}`;
    }
    
    const messages = [
      { role: 'system', content: systemContent },
      ...conversationHistory,
      { role: 'user', content: message }
    ];
    const response = await axios.post(apiUrl, {
      model: model,
      messages: messages,
      stream: true,
      options: {
        temperature: 0.1,
        top_p: 0.8,
        repeat_penalty: 1.15,
        num_predict: 800,
        num_ctx: 8192,
        num_batch: 1024,
        num_thread: 8
      }
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
      responseType: 'stream'
    });
    let fullContent = '';
    return new Promise((resolve, reject) => {
      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n');
        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              if (data.message && data.message.content) {
                fullContent += data.message.content;
                if (!isWarmup) {
                  onChunk(data.message.content);
                }
              }
              if (data.done) {
                resolve(fullContent);
              }
            } catch (e) {}
          }
        }
      });
      response.data.on('end', () => { resolve(fullContent); });
      response.data.on('error', (error) => { reject(error); });
    });
  } catch (error) {
    console.error('Ollama API Error:', error);
    throw error;
  }
}

function setUserConfig(config) {
  userConfig = config;
}
function getUserConfig() {
  return userConfig;
}
function getConversationHistory() {
  return conversationHistory;
}
function clearConversationHistory() {
  conversationHistory = [];
}
function pushUserMessage(message) {
  conversationHistory.push({ role: 'user', content: message });
}
function pushAssistantMessage(content) {
  conversationHistory.push({ role: 'assistant', content });
}

module.exports = {
  callOllamaAPI,
  setUserConfig,
  getUserConfig,
  getConversationHistory,
  clearConversationHistory,
  pushUserMessage,
  pushAssistantMessage
};
