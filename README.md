# AI Agent Chat Plus

## 项目简介

**AI Agent Chat Plus** 是一个基于 Electron 和 React 构建的智能聊天应用。接入 Ollama 本地大模型，提供现代化的用户界面和流畅的聊天体验，支持与AI助手进行自然语言对话。

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
ollama pull llama3.1:8b
# 或者其他模型
ollama pull qwen2.5:7b
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

### 支持的模型

你可以根据自己的硬件配置选择合适的模型：

- **8GB RAM**: `llama3.1:8b`, `qwen2.5:7b`, `phi3:3.8b`
- **16GB RAM**: `llama3.1:13b`, `qwen2.5:14b`, `codellama:13b`
- **32GB+ RAM**: `llama3.1:70b`, `qwen2.5:72b`

下载模型命令：
```bash
ollama pull llama3.1:8b
ollama pull qwen2.5:7b
ollama pull phi3:3.8b
```

## 目录结构
```
chat-agent-plus/
├── src/
│   ├── main/
│   │   ├── main.js          # Electron 主进程
│   │   └── preload.js       # 预加载脚本
│   └── renderer/
│       └── react/           # React 渲染进程
│           ├── components/
│           │   ├── ChatMessage.jsx    # 聊天消息组件
│           │   └── MessageInput.jsx   # 消息输入组件
│           ├── styles/
│           │   ├── index.css          # 基础样式
│           │   └── App.css            # 应用样式
│           ├── App.jsx                # 主应用组件
│           ├── index.js               # React 入口
│           └── index.html             # HTML 模板
├── dist/                    # Webpack 构建输出
├── webpack.config.js        # Webpack 配置
├── .env.example            # 环境变量示例
└── package.json            # 项目依赖和脚本
```

## 使用说明

### 启动应用
1. 确保 Ollama 服务正在运行：`ollama serve`
2. 启动聊天应用：`npm start`
3. 在输入框中输入您的消息
4. 按 Enter 发送消息（Shift+Enter 换行）
5. 支持多行文本输入，输入框会自动调整高度
6. AI 助手会通过本地 Ollama 模型实时回复您的消息
7. 消息会显示发送时间

### 切换模型
在 `.env` 文件中修改 `OLLAMA_MODEL` 变量：
```env
OLLAMA_MODEL=qwen2.5:7b  # 切换到 Qwen 模型
```

### 删除不需要的模型（释放空间）
ollama rm qwen2.5:7b

### 查看模型信息
ollama show qwen2.5:7b

### 直接在终端与模型对话（测试用）
ollama run qwen2.5:7b

## 开发脚本
- `npm start` - 构建并启动应用
- `npm run dev` - 开发模式启动（包含开发者工具）
- `npm run build:react` - 构建 React 应用
- `npm run build:react:dev` - 开发模式构建
- `npm run build:react:watch` - 监听模式构建
- `npm run build` - 构建完整应用

## 技术栈
- **前端框架**: React 18
- **桌面应用**: Electron
- **AI 模型**: Ollama (本地大模型)
- **构建工具**: Webpack
- **样式**: CSS3 (支持现代特性)
- **HTTP 客户端**: Axios
- **工具库**: UUID, dotenv

## 优势

### 相比在线 API 的优势
- **完全免费**: 无需支付 API 调用费用
- **数据隐私**: 所有对话数据完全本地化
- **离线使用**: 不依赖网络连接
- **自定义模型**: 可以选择最适合的开源模型
- **无限制**: 没有调用次数和频率限制

### 系统要求
- **最低配置**: 8GB RAM (推荐 16GB+)
- **存储空间**: 至少 10GB 可用空间
- **操作系统**: macOS, Windows, Linux

## 故障排除

### 常见问题
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