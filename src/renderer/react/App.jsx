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
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      // 调用 Electron API 发送消息
      const aiResponse = await window.electronAPI.sendMessage(content);
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('发送消息失败:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: '抱歉，发送消息时出现错误，请稍后重试。',
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
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
            <div className={`status-dot ${isLoading ? 'loading' : 'ready'}`}></div>
            <span>{isLoading ? '思考中...' : '就绪'}</span>
          </div>
          <button 
            onClick={handleClearConversation}
            className="clear-button"
            title="清除对话"
            disabled={isLoading}
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
        
        <MessageInput onSendMessage={handleSendMessage} disabled={isLoading} />
      </main>
    </div>
  );
}

export default App;