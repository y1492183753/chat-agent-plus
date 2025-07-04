import React, { useState, useEffect } from 'react';
import '../styles/components/WelcomeScreen.css';

function WelcomeScreen({ onStart }) {
  const [userGender, setUserGender] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [agentIntro, setAgentIntro] = useState('');
  const [step, setStep] = useState(1);

  // 可用的头像选项
  const userAvatars = {
    male: 'boy.jpg',
    female: 'girl.jpg'
  };

  const agentAvatars = [
    { id: 'ai-0', name: '优雅助手', file: 'ai-0.jpg', personality: '温和、专业、善于分析' },
    { id: 'ai-1', name: '活力助手', file: 'ai-1.jpg', personality: '活泼、创新、充满想象力' },
    { id: 'ai-2', name: '智慧助手', file: 'ai-2.jpg', personality: '博学、理性、逻辑清晰' },
    { id: 'ai-3', name: '友善助手', file: 'ai-3.jpg', personality: '亲切、耐心、善于倾听' },
    { id: 'ai-4', name: '创意助手', file: 'ai-4.jpg', personality: '艺术、感性、富有创造力' }
  ];

  const canProceed = () => {
    if (step === 1) return userGender !== '';
    if (step === 2) return selectedAgent !== '';
    if (step === 3) return true; // 介绍是可选的
    return false;
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleStart();
    }
  };

  const handleStart = () => {
    const selectedAgentData = agentAvatars.find(agent => agent.id === selectedAgent);
    const config = {
      userAvatar: userAvatars[userGender],
      aiAvatar: selectedAgentData.file,
      aiName: selectedAgentData.name,
      aiPersonality: selectedAgentData.personality,
      aiIntro: agentIntro || `你好！我是${selectedAgentData.name}，${selectedAgentData.personality}。很高兴为您服务！`
    };
    onStart(config);
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return '👋 欢迎使用 AI 智能助手';
      case 2: return '🤖 选择您的 AI 助手';
      case 3: return '✨ 个性化设置';
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
              <h2>选择您的 AI 助手</h2>
              <div className="agent-grid">
                {agentAvatars.map(agent => (
                  <div 
                    key={agent.id}
                    className={`agent-option ${selectedAgent === agent.id ? 'selected' : ''}`}
                    onClick={() => setSelectedAgent(agent.id)}
                  >
                    <div className="agent-avatar">
                      <img src={require(`../../../assets/head/${agent.file}`)} alt={agent.name} />
                    </div>
                    <div className="agent-info">
                      <h3>{agent.name}</h3>
                      <p>{agent.personality}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 第三步：个性化介绍 */}
          {step === 3 && (
            <div className="step-content">
              <h2>为您的助手添加个性化介绍</h2>
              <div className="intro-section">
                <div className="selected-agent-preview">
                  <img src={require(`../../../assets/head/${agentAvatars.find(a => a.id === selectedAgent)?.file}`)} alt="选中的助手" />
                  <h3>{agentAvatars.find(a => a.id === selectedAgent)?.name}</h3>
                </div>
                <textarea
                  className="intro-textarea"
                  placeholder={`为${agentAvatars.find(a => a.id === selectedAgent)?.name}添加个性化介绍...（可选）`}
                  value={agentIntro}
                  onChange={(e) => setAgentIntro(e.target.value)}
                  rows="4"
                  maxLength="200"
                />
                <div className="char-count">{agentIntro.length}/200</div>
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