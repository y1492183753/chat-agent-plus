# Pixel Adventure

## 项目简介

**Pixel Adventure** 是一个基于 Electron 构建的像素风格平台冒险游戏。玩家将操控角色在不同的平台间跳跃，收集金币，体验经典的街机闯关乐趣。

## 主要特性
- 像素风格的画面与动画
- 简单易上手的操作（支持方向键和 WASD）
- 多平台关卡与收集要素
- 基于 Electron，跨平台运行
- 清晰的模块化代码结构，便于扩展

## 安装与运行

1. 克隆本仓库：
   ```bash
   git clone <你的仓库地址>
   ```
2. 安装依赖：
   ```bash
   npm install
   ```
3. 启动游戏：
   ```bash
   npm start
   ```

## 目录结构
```
PixelAdventure/
├── assets/           # 游戏资源（图片、音频、字体）
├── config/           # 配置文件
├── docs/             # 文档
├── src/
│   ├── main/         # Electron 主进程
│   └── renderer/     # 渲染进程（游戏核心）
│       ├── js/       # 游戏逻辑与系统
│       ├── styles/   # 样式文件
│       └── views/    # 页面模板
├── tests/            # 测试
├── package.json      # 项目配置
└── README.md         # 项目说明
```

## 玩法说明
- 使用方向键 ↑↓←→ 或 WASD 控制角色移动和跳跃。
- 在平台间跳跃，收集所有金币以完成关卡。
- 角色掉落出界会自动重生。
- 屏幕左上角显示当前分数和已收集金币数。

## 开发与贡献
欢迎提交 Issue 或 PR 参与改进本项目。


