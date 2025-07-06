# AI Agent Chat Plus

## 项目简介

**AI Agent Chat Plus** 是一个基于 Electron 和 React 构建的智能聊天应用。接入 Ollama 本地大模型，提供现代化的用户界面和流畅的聊天体验，支持与 AI 助手进行自然语言对话。

## 功能介绍
- 与本地大模型（如 Llama3、Qwen、Phi3 等）进行自然语言对话
- 支持多轮对话和上下文记忆
- 聊天消息实时显示，支持多行输入与自动换行
- 消息时间戳显示，便于追溯历史
- 支持模型切换与自定义（通过 .env 配置）
- 聊天窗口支持毛玻璃和多种主题切换
- 打字指示器与优雅的加载动画
- 完全本地化运行，保护用户隐私
- 支持消息输入快捷键（Enter 发送，Shift+Enter 换行）
- 支持开发者模式与热重载，便于二次开发

## 项目架构
本项目采用 Electron + React 架构，结合 Ollama 本地大模型，整体结构如下：

```
┌─────────────────────────────┐
│         Electron 主进程      │
│  (src/main/main.js)         │
│  - 应用窗口管理              │
│  - 与渲染进程通信            │
└─────────────┬───────────────┘
              │ preload.js
┌─────────────▼───────────────┐
│      React 渲染进程          │
│  (src/renderer/react/)      │
│  - 聊天 UI 展示              │
│  - 用户输入与消息流          │
│  - 主题切换、动画等          │
└─────────────┬───────────────┘
              │ IPC 通信
┌─────────────▼───────────────┐
│   Node 服务/中间层           │
│  (chatService.js,           │
│   knowledgeBase.js)         │
│  - 处理与 Ollama API 的交互   │
│  - 管理上下文与知识库         │
└─────────────┬───────────────┘
              │ HTTP API
┌─────────────▼───────────────┐
│        Ollama 本地模型        │
│  (如 llama3.1:8b 等)         │
└─────────────────────────────┘
```

- Electron 主进程负责窗口生命周期、系统集成等。
- preload.js 作为桥梁，安全地暴露部分 Node 能力给前端。
- React 渲染进程负责所有 UI 交互和用户体验。
- chatService.js/knowledgeBase.js 负责与 Ollama API 通信、上下文管理、知识库扩展。
- Ollama 本地模型负责 AI 推理。

## 主要特性
- 现代化的聊天界面设计
- 基于 React 的响应式前端
- Electron 跨平台桌面应用
- 接入 Ollama 本地大模型
- 实时消息发送和接收
- 优雅的加载状态和打字指示器
- 毛玻璃效果和现代化 UI 设计
- 完全本地化，数据隐私保护

## 安装与配置

### 1. 安装 Ollama

首先安装 Ollama：

```bash
# macOS
brew install ollama

# 或者访问 https://ollama.com/ 下载安装包
```

### 2. 下载模型

```bash
# 启动 Ollama 服务
ollama serve

# 在另一个终端窗口中下载模型
ollama pull qwen2.5:7b （ 推荐：人物对话情景 ）
ollama pull llama3.1:8b
ollama pull phi3:3.8b
```

### 3. 安装项目

1. 克隆本仓库：
   ```bash
   git clone <your-repo-url>
   cd chat-agent-plus
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 配置环境变量：
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，配置 Ollama 设置
   ```

4. 启动应用：
   ```bash
   npm start
   ```

5. 开发模式：
   ```bash
   npm run dev
   ```

## 环境变量配置

在项目根目录创建 `.env` 文件，包含以下配置：

```env
# Ollama 配置
OLLAMA_API_URL=http://localhost:11434/api/chat
OLLAMA_MODEL=llama3.1:8b
```

## 目录结构
```
chat-agent-plus/
├── src/
│   ├── main/                      # Electron 主进程相关
│   │   ├── main.js                # Electron 主进程入口
│   │   ├── preload.js             # 预加载脚本
│   │   ├── chatService.js         # 聊天服务与 Ollama 通信
│   │   ├── knowledgeBase.js       # 知识库扩展
│   ├── assets/                    # 静态资源（图片、icon等）
│   │   ├── head/                  # 头像图片
│   │   ├── icons/                 # 图标
│   │   └── knowledge/             # 预置知识库
│   └── renderer/
│       └── react/                 # React 渲染进程
│           ├── App.jsx            # 主应用组件
│           ├── index.js           # React 入口
│           ├── index.html         # HTML 模板
│           ├── components/        # 组件
│           │   ├── ChatMessage.jsx
│           │   ├── MessageInput.jsx
│           │   ├── ThemeSwitcher.jsx
│           │   ├── TypingIndicator.jsx
│           │   └── WelcomeScreen.jsx
│           ├── contexts/          # React 上下文
│           ├── styles/            # 样式
│           │   ├── App.css
│           │   ├── index.css
│           │   └── components/
│           │       ├── ChatMessage.css
│           │       ├── Header.css
│           │       ├── MessageInput.css
│           │       ├── TypingIndicator.css
│           │       └── WelcomeScreen.css
│           │   └── themes/
│           │       └── rainbow-bubble.css
│           └── utils/             # 工具函数
├── dist/                          # Webpack 构建输出
├── webpack.config.js              # Webpack 配置
├── .env.example                   # 环境变量示例
├── package.json                   # 项目依赖和脚本
└── README.md                      # 项目说明文档
```

## 使用说明

### 启动与体验

1. 启动 Ollama 服务：
   ```bash
   ollama serve
   ```
2. 启动聊天应用：
   ```bash
   npm start
   ```
3. 在输入框中输入您的消息，按 Enter 发送（Shift+Enter 换行）。
4. 支持多行文本输入，输入框会自动调整高度。
5. AI 助手会通过本地 Ollama 模型实时回复您的消息。
6. 消息会显示发送时间。
7. 可在 `.env` 文件中切换模型（如 `OLLAMA_MODEL=qwen2.5:7b`）。

#### 常用快捷键
- Enter：发送消息
- Shift+Enter：换行

### .env 配置说明

1. 复制示例文件并编辑：
   ```bash
   cp .env.example .env
   # 用文本编辑器打开 .env 文件，配置如下：
   ```
2. 典型配置示例：
   ```env
   OLLAMA_API_URL=http://localhost:11434/api/chat
   OLLAMA_MODEL=qwen2.5:7b
   ```
3. 切换模型时，只需修改 `OLLAMA_MODEL` 的值并重启应用。

### 代码规范与 ESLint 使用

- 自动修复代码风格问题：
  ```bash
  npx eslint src --fix
  ```
- 推荐在开发时保持代码风格一致，提交前执行一次自动修复。

## 开发脚本
- `npm start` - 构建并启动应用
- `npm run dev` - 开发模式启动（包含开发者工具）
- `npm run build:react` - 构建 React 应用
- `npm run build:react:dev` - 开发模式构建
- `npm run build:react:watch` - 监听模式构建
- `npm run build` - 构建完整应用
- `npm run lint:fix` - 自动修复代码风格

## 技术栈
- **前端框架**: React 18
- **桌面应用**: Electron
- **AI 模型**: Ollama (本地大模型)
- **构建工具**: Webpack
- **样式**: CSS3 (支持现代特性)
- **HTTP 客户端**: Axios
- **工具库**: UUID, dotenv

## 优势
- **完全免费**: 无需支付 API 调用费用
- **数据隐私**: 所有对话数据完全本地化
- **离线使用**: 不依赖网络连接
- **自定义模型**: 可以选择最适合的开源模型
- **无限制**: 没有调用次数和频率限制

## 系统要求
- **最低配置**: 8GB RAM (推荐 16GB+)
- **存储空间**: 至少 10GB 可用空间
- **操作系统**: macOS, Windows, Linux

## 故障排除

1. **连接失败**: 确保 Ollama 服务正在运行 (`ollama serve`)
2. **模型未找到**: 检查模型是否已下载 (`ollama list`)
3. **响应缓慢**: 首次使用时模型需要加载，后续会更快
4. **内存不足**: 尝试使用更小的模型 (如 `phi3:3.8b`)

### 性能优化
- 使用 SSD 硬盘可以显著提升模型加载速度
- 关闭不必要的应用程序释放内存
- 如果有独立显卡，Ollama 会自动使用 GPU 加速

## 开发与贡献
欢迎提交 Issue 或 PR 参与改进本项目。

### 开发环境要求
- Node.js >= 14.0.0
- npm >= 6.0.0
- Ollama 已安装并运行

## 许可证
本项目使用 ISC 许可证。

## 作者
YaoJiaHao