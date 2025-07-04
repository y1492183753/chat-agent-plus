import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from './components/ChatMessage';
import MessageInput from './components/MessageInput';
import WelcomeScreen from './components/WelcomeScreen';
import './styles/App.css';
import './styles/components/Header.css';
import './styles/components/TypingIndicator.css';
// 引入彩虹泡泡主题
import './styles/themes/rainbow-bubble.css';

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [userConfig, setUserConfig] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamMessage, setCurrentStreamMessage] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamMessage]);

  // 处理欢迎页面完成
  const handleWelcomeComplete = async (config) => {
    setUserConfig(config);
    setShowWelcome(false);
    
    // 将用户配置发送到主进程
    try {
      await window.electronAPI.setUserConfig(config);
      console.log('用户配置已发送到主进程:', config);
    } catch (error) {
      console.error('设置用户配置失败:', error);
    }
    
    // 删除固定欢迎语，让AI主动介绍
    setMessages([]); // 初始化为空数组
    
    // 让AI主动进行自我介绍
    setTimeout(() => {
      initializeAIGreeting();
    }, 500);
  };

  // 新增AI主动介绍函数
const initializeAIGreeting = async () => {
  try {
    setIsLoading(true);
    
    // 发送初始化提示让AI自我介绍
    const introPrompt = '这是你第一次见到用户，请简短地自我介绍一下，告诉用户你是谁，你能做什么。不要询问用户需要什么帮助，直接介绍即可。';
    
    await window.electronAPI.sendMessage(introPrompt);
  } catch (error) {
    console.error('AI初始化介绍失败:', error);
    setIsLoading(false);
  }
};

// 同时修改清除对话功能，删除固定欢迎语
const handleClearConversation = async () => {
  try {
    await window.electronAPI.clearConversation();
    setMessages([]); // 清空为空数组
    setCurrentStreamMessage(null);
    setIsStreaming(false);
    
    // 重新让AI介绍
    setTimeout(() => {
      initializeAIGreeting();
    }, 300);
  } catch (error) {
    console.error('清除对话失败:', error);
  }
};

  // 设置流式输出监听器
  useEffect(() => {
    if (showWelcome) return; // 如果还在欢迎页面，不设置监听器

    const handleStreamStart = (event, messageId) => {
      console.log('Stream started:', messageId);
      setIsStreaming(true);
      setIsLoading(false);
      
      // 创建新的AI消息
      const aiMessage = {
        id: messageId,
        content: '',
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      
      setCurrentStreamMessage(aiMessage);
    };

    const handleStreamChunk = (event, messageId, chunk) => {
      console.log('Stream chunk:', messageId, chunk);
      setCurrentStreamMessage(prev => {
        if (prev && prev.id === messageId) {
          return {
            ...prev,
            content: prev.content + chunk
          };
        }
        return prev;
      });
    };

    const handleStreamEnd = (event, messageId) => {
      console.log('Stream ended:', messageId);
      setIsStreaming(false);
      
      // 将完整的消息添加到消息列表
      setCurrentStreamMessage(current => {
        if (current && current.id === messageId) {
          setMessages(prev => [...prev, current]);
          return null;
        }
        return current;
      });
    };

    const handleStreamError = (event, messageId, error) => {
      console.error('Stream error:', messageId, error);
      setIsStreaming(false);
      setIsLoading(false);
      
      const errorMessage = {
        id: messageId,
        content: `抱歉，发生了错误: ${error}`,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setCurrentStreamMessage(null);
    };

    // 注册事件监听器
    window.electronAPI.onMessageStreamStart(handleStreamStart);
    window.electronAPI.onMessageStreamChunk(handleStreamChunk);
    window.electronAPI.onMessageStreamEnd(handleStreamEnd);
    window.electronAPI.onMessageStreamError(handleStreamError);

    // 清理函数
    return () => {
      window.electronAPI.removeAllListeners('message-stream-start');
      window.electronAPI.removeAllListeners('message-stream-chunk');
      window.electronAPI.removeAllListeners('message-stream-end');
      window.electronAPI.removeAllListeners('message-stream-error');
    };
  }, [showWelcome]);

  const handleSendMessage = async (content) => {
    if (!content.trim()) return;
  
    // 添加用户消息
    const userMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date().toISOString()
    };
  
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
  
    try {
      // 使用统一的发送消息接口（内部支持流式输出）
      await window.electronAPI.sendMessage(content);
    } catch (error) {
      console.error('发送消息失败:', error);
      setIsLoading(false);
      setIsStreaming(false);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: '抱歉，发送消息时出现错误，请稍后重试。',
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // 如果显示欢迎页面
  if (showWelcome) {
    return <WelcomeScreen onStart={handleWelcomeComplete} />;
  }

  return (
    <div className="app">
      {/* 使用 React 方式管理彩虹光效，替代动态DOM操作 */}
      <div className="rainbow-glow"></div>
      
      <header className="app-header">
        <h1>🌈 {userConfig?.aiName || 'AI 智能助手'} ✨</h1>
        <div className="header-actions">
          <div className="status-indicator">
            <div className={`status-dot ${isLoading || isStreaming ? 'loading' : 'ready'}`}></div>
            <span>{isLoading ? '连接中...' : isStreaming ? '回复中...' : '就绪'}</span>
          </div>
          <button 
            onClick={handleClearConversation}
            className="clear-button"
            title="清除对话"
            disabled={isLoading || isStreaming}
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
        </div>
      </header>
      
      <main className="chat-container">
        <div className="messages-area">
          {messages.map((message) => (
            <ChatMessage 
              key={message.id} 
              message={message}
              userAvatar={userConfig?.userAvatar}
              aiAvatar={userConfig?.aiAvatar}
            />
          ))}
          
          {/* 显示当前流式输出的消息 */}
          {currentStreamMessage && (
            <ChatMessage 
              key={currentStreamMessage.id} 
              message={currentStreamMessage} 
              isStreaming={true}
              userAvatar={userConfig?.userAvatar}
              aiAvatar={userConfig?.aiAvatar}
            />
          )}
          
          {/* 显示加载状态 */}
          {isLoading && (
            <div className="typing-indicator">
              <div className="typing-avatar">
                <img 
                  src={require(`../../assets/head/${userConfig?.aiAvatar || 'ai-0.jpg'}`)} 
                  alt="AI助手"
                  className="typing-avatar-image"
                />
              </div>
              <div className="typing-dots">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <MessageInput onSendMessage={handleSendMessage} disabled={isLoading || isStreaming} />
      </main>
    </div>
  );
}

export default App;