import React, { useMemo } from 'react';
import '../styles/components/ChatMessage.css';

function ChatMessage({ message, isStreaming = false, userAvatar = 'boy.jpg', aiAvatar = 'ai-0.jpg' }) {
  // 使用 useMemo 缓存时间格式化结果
  const formattedTime = useMemo(() => {
    return new Date(message.timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [message.timestamp]);

  // 获取头像路径
  const getAvatarPath = (sender) => {
    if (sender === 'ai') {
      return require(`../../../assets/head/${aiAvatar}`);
    } else {
      return require(`../../../assets/head/${userAvatar}`);
    }
  };

  // 根据发送者类型渲染不同的布局
  if (message.sender === 'user') {
    // 用户消息：消息内容在左，头像在右
    return (
      <div className={`message ${message.sender}`}>
        <div className={`message-content ${isStreaming ? 'streaming' : ''}`}>
          <div className="message-text">{message.content}</div>
          <div className="message-time">{formattedTime}</div>
        </div>
        <div className="message-avatar">
          <img 
            src={getAvatarPath(message.sender)} 
            alt="用户"
            className="avatar-image"
          />
        </div>
      </div>
    );
  } else {
    // AI消息：头像在左，消息内容在右
    return (
      <div className={`message ${message.sender}`}>
        <div className="message-avatar">
          <img 
            src={getAvatarPath(message.sender)} 
            alt="AI助手"
            className="avatar-image"
          />
        </div>
        <div className={`message-content ${isStreaming ? 'streaming' : ''}`}>
          <div className="message-text">{message.content}</div>
          <div className="message-time">{formattedTime}</div>
        </div>
      </div>
    );
  }
}

// 使用 React.memo 包装组件，避免不必要的重新渲染
export default React.memo(ChatMessage);