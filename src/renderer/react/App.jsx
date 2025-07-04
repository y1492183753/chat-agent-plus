import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from './components/ChatMessage';
import MessageInput from './components/MessageInput';
import './styles/App.css';
import './styles/components/Header.css';
import './styles/components/TypingIndicator.css';

function App() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      content: '你好！我是您的 AI 助手，有什么可以帮助您的吗？',
      sender: 'ai',
      timestamp: new Date().toISOString()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamMessage, setCurrentStreamMessage] = useState(null);
  const messagesEndRef = useRef(null);

  const [userAvatar, setUserAvatar] = useState('boy.jpg'); // 默认用户头像
  const [aiAvatar, setAiAvatar] = useState('ai-0.jpg'); // 默认AI头像
  // 添加头像设置状态 
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamMessage]);

  // 设置流式输出监听器
  useEffect(() => {
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
  }, []);

  const handleSendMessage = async (content) => {
    if (!content.trim()) return;
  
    // 添加用户消息（包含头像信息）
    const userMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      avatar: userAvatar,
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
        avatar: aiAvatar,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // 添加清除对话功能
  const handleClearConversation = async () => {
    try {
      await window.electronAPI.clearConversation();
      setMessages([
        {
          id: '1',
          content: '你好！我是您的 AI 助手，有什么可以帮助您的吗？',
          sender: 'ai',
          timestamp: new Date().toISOString()
        }
      ]);
      setCurrentStreamMessage(null);
      setIsStreaming(false);
    } catch (error) {
      console.error('清除对话失败:', error);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI 智能助手</h1>
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
            🗑️
          </button>
        </div>
      </header>
      
      <main className="chat-container">
        <div className="messages-area">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {/* 显示当前流式输出的消息 */}
          {currentStreamMessage && (
            <ChatMessage 
              key={currentStreamMessage.id} 
              message={currentStreamMessage} 
              isStreaming={true}
            />
          )}
          
          {/* 显示加载状态 */}
          {isLoading && (
            <div className="typing-indicator">
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