import React, { useState } from 'react';

const themes = [
  { id: 'default', name: '默认主题', file: null },
  { id: 'rainbow-bubble', name: '彩虹泡泡', file: './styles/themes/rainbow-bubble.css' }
];

function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState('rainbow-bubble');

  const switchTheme = (themeId) => {
    // 移除之前的主题样式
    const existingThemeLinks = document.querySelectorAll('link[data-theme]');
    existingThemeLinks.forEach(link => link.remove());

    // 添加新主题样式
    const theme = themes.find(t => t.id === themeId);
    if (theme && theme.file) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = theme.file;
      link.setAttribute('data-theme', themeId);
      document.head.appendChild(link);
    }

    setCurrentTheme(themeId);
  };

  return (
    <div className="theme-switcher" style={{ display: 'none' }}> {/* 暂时隐藏，需要时可以显示 */}
      <select 
        value={currentTheme} 
        onChange={(e) => switchTheme(e.target.value)}
        style={{
          padding: '0.5rem',
          borderRadius: '0.5rem',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          background: 'rgba(255, 255, 255, 0.1)',
          color: 'white'
        }}
      >
        {themes.map(theme => (
          <option key={theme.id} value={theme.id} style={{ color: 'black' }}>
            {theme.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ThemeSwitcher;