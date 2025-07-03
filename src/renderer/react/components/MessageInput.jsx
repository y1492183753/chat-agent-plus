import React, { useState, useRef, useEffect } from 'react';
import '../styles/components/MessageInput.css';

function MessageInput({ onSendMessage, disabled }) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    // 延迟执行自动调整高度，确保 DOM 更新
    setTimeout(() => {
      autoResizeTextarea();
    }, 0);
  };

  const autoResizeTextarea = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // 重置高度以获取准确的 scrollHeight
      textarea.style.height = 'auto';
      
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 120;
      const minHeight = 44;
      
      if (scrollHeight > maxHeight) {
        textarea.style.height = maxHeight + 'px';
        textarea.style.overflowY = 'auto';
      } else if (scrollHeight < minHeight) {
        textarea.style.height = minHeight + 'px';
        textarea.style.overflowY = 'hidden';
      } else {
        textarea.style.height = scrollHeight + 'px';
        textarea.style.overflowY = 'hidden';
      }
    }
  };

  useEffect(() => {
    autoResizeTextarea();
  }, [message]);

  // 组件挂载时初始化
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
      textareaRef.current.style.overflowY = 'hidden';
    }
  }, []);

  return (
    <form className="message-input-form" onSubmit={handleSubmit}>
      <div className="input-container">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={disabled ? "AI 正在思考中..." : "输入您的消息..."}
          disabled={disabled}
          rows="1"
        />
        <button type="submit" disabled={!message.trim() || disabled}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </form>
  );
}

export default MessageInput;