import React, { useMemo } from 'react';
import '../styles/components/ChatMessage.css';

function ChatMessage({ message }) {
  // 使用 useMemo 缓存时间格式化结果
  const formattedTime = useMemo(() => {
    return new Date(message.timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [message.timestamp]);

  return (
    <div className={`message ${message.sender}`}>
      <div className="message-content">
        <div className="message-text">{message.content}</div>
        <div className="message-time">{formattedTime}</div>
      </div>
    </div>
  );
}

// 使用 React.memo 包装组件，避免不必要的重新渲染
export default React.memo(ChatMessage);