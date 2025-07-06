import React, { useState, useRef } from 'react';
import '../styles/components/WelcomeScreen.css';

function WelcomeScreen({ onStart }) {
  const [userGender, setUserGender] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [customName, setCustomName] = useState('');
  const [agentIntro, setAgentIntro] = useState('');
  const [step, setStep] = useState(1);
  const [knowledgeFileName, setKnowledgeFileName] = useState('');
  // 记录上一次 agent 默认名
  const lastAgentDefaultName = useRef('');

  // 可用的头像选项
  const userAvatars = {
    male: 'boy.jpg',
    female: 'girl.jpg'
  };

  const agentAvatars = [
    { id: 'ai-0', name: '阔爱小胖纸', file: 'ai-0.jpg' },
    { id: 'ai-1', name: '帅气男神', file: 'ai-1.jpg' },
    { id: 'ai-2', name: '烂漫小女孩', file: 'ai-2.jpg' },
    { id: 'ai-3', name: '优雅女士', file: 'ai-3.jpg' },
    { id: 'ai-4', name: '温柔白大褂', file: 'ai-4.jpg' }
  ];

  const canProceed = () => {
    if (step === 1) return userGender !== '';
    if (step === 2) return selectedAgent !== '';
    if (step === 3) return customName.trim() !== ''; // 名字是必填的
    return false;
  };

  const handleNext = () => {
    if (step < 3) {
      // 进入第三步时，若 customName 为空或等于上一次 agent 默认名，则自动同步为当前 agent 默认名
      if (step === 2) {
        const selectedAgentData = agentAvatars.find(agent => agent.id === selectedAgent);
        if (selectedAgentData) {
          if (!customName || customName === lastAgentDefaultName.current) {
            setCustomName(selectedAgentData.name);
          }
          lastAgentDefaultName.current = selectedAgentData.name;
        }
      }
      setStep(step + 1);
    } else {
      handleStart();
    }
  };

  // 当选择新的助手时，若 customName 为空或等于上一次 agent 默认名，则自动同步为新 agent 默认名
  const handleAgentSelect = (agentId) => {
    setSelectedAgent(agentId);
    const selectedAgentData = agentAvatars.find(agent => agent.id === agentId);
    if (selectedAgentData) {
      if (!customName || customName === lastAgentDefaultName.current) {
        setCustomName(selectedAgentData.name);
      }
      lastAgentDefaultName.current = selectedAgentData.name;
    }
  };

  const handleStart = () => {
    const selectedAgentData = agentAvatars.find(agent => agent.id === selectedAgent);
    const finalName = customName.trim() || selectedAgentData.name;
    // 简化配置，只保留用户自定义的内容
    const config = {
        userAvatar: userAvatars[userGender],
        aiAvatar: selectedAgentData.file,
        aiName: finalName,
        aiIntro: agentIntro.trim() || `你好！我是${finalName}，很高兴为您服务！✨`
      };
    onStart(config);
  };

  // 处理知识库文件上传
  const handleKnowledgeFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setKnowledgeFileName(file.name);
      // 读取文件内容并通过 Electron IPC 发送到主进程
      const reader = new FileReader();
      reader.onload = function(evt) {
        const content = evt.target.result;
        if (window.electron && window.electron.ipcRenderer) {
          window.electron.ipcRenderer.send('upload-knowledge-file', content);
        }
      };
      reader.readAsText(file, 'utf-8');
    } else {
      setKnowledgeFileName('');
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return '👋 欢迎使用 定制 Agent ✨';
      case 2: return '🤖 选择您的 Agent 形象 ✨';
      case 3: return '✨ 个性化设置 - 为您的助手命名和介绍 ✨';
      default: return '';
    }
  };

  return (
    <div className="welcome-screen">
      <div className="welcome-container">
        <div className="welcome-header">
          <h1>{getStepTitle()}</h1>
          <div className="step-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
          </div>
        </div>

        <div className="welcome-content">
          {/* 第一步：选择性别 */}
          {step === 1 && (
            <div className="step-content">
              <h2>请选择您的性别</h2>
              <div className="gender-options">
                <div 
                  className={`gender-option ${userGender === 'male' ? 'selected' : ''}`}
                  onClick={() => setUserGender('male')}
                >
                  <div className="gender-avatar">
                    <img src={require(`../../../assets/head/${userAvatars.male}`)} alt="男性" />
                  </div>
                  <span>男性</span>
                </div>
                <div 
                  className={`gender-option ${userGender === 'female' ? 'selected' : ''}`}
                  onClick={() => setUserGender('female')}
                >
                  <div className="gender-avatar">
                    <img src={require(`../../../assets/head/${userAvatars.female}`)} alt="女性" />
                  </div>
                  <span>女性</span>
                </div>
              </div>
            </div>
          )}

          {/* 第二步：选择 Agent */}
          {step === 2 && (
            <div className="step-content">
              <div className="agent-grid">
                {agentAvatars.map(agent => (
                  <div 
                    key={agent.id}
                    className={`agent-option ${selectedAgent === agent.id ? 'selected' : ''}`}
                    onClick={() => handleAgentSelect(agent.id)}
                  >
                    <div className="agent-avatar">
                      <img src={require(`../../../assets/head/${agent.file}`)} alt={agent.name} />
                    </div>
                    <div>{ agent.name }</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 第三步：自定义名字和介绍 */}
          {step === 3 && (
            <div className="step-content">
              <h2>为您的助手取个名字并添加个性化介绍</h2>
              <div className="intro-section">
                <div className="selected-agent-preview">
                  <img src={require(`../../../assets/head/${agentAvatars.find(a => a.id === selectedAgent)?.file}`)} alt="选中的助手" />
                  <h3>{customName || agentAvatars.find(a => a.id === selectedAgent)?.name}</h3>
                </div>
                
                {/* 名字输入框 */}
                <div className="name-input-container">
                  <label htmlFor="ai-name">助手名字 *</label>
                  <input
                    id="ai-name"
                    type="text"
                    className="name-input"
                    placeholder="为您的助手起个名字..."
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    maxLength="20"
                  />
                  <div className="char-count">{customName.length}/20</div>
                </div>

                {/* 介绍输入框 */}
                <div className="intro-input-container">
                  <label htmlFor="ai-intro">个性化介绍（可选）</label>
                  <textarea
                    id="ai-intro"
                    className="intro-textarea"
                    placeholder={`为${customName || '您的助手'}添加个性化介绍或提示词...例如：我是一个八岁小女孩，平时喜欢卖萌，爱用表情包...等`}
                    value={agentIntro}
                    onChange={(e) => setAgentIntro(e.target.value)}
                    rows="4"
                    maxLength="1000"
                  />
                  <div className="char-count">{agentIntro.length}/1000</div>
                </div>

                {/* 文件上传入口 */}
                <div className="file-upload-container">
                  <label htmlFor="knowledge-upload">上传您的知识库（txt 文件，可选）</label>
                  <input
                    id="knowledge-upload"
                    type="file"
                    accept=".txt"
                    onChange={handleKnowledgeFileUpload}
                  />
                  {knowledgeFileName && <div className="file-name">已选择：{knowledgeFileName}</div>}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="welcome-actions">
          {step > 1 && (
            <button 
              className="btn-secondary" 
              onClick={() => setStep(step - 1)}
            >
              上一步
            </button>
          )}
          <button 
            className="btn-primary" 
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {step === 3 ? '开始聊天' : '下一步'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;