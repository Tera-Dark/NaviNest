# NaviNest 🧭

[English Documentation](README.md)

NaviNest 是一个开源、高度可定制且适合初学者的个人导航仪表盘。它具有现代化的玻璃拟态设计、智能搜索功能以及内置的 AI 聊天组件。

## 🚀 快速开始

1. **克隆仓库**
   ```bash
   git clone https://github.com/yourusername/navinest.git
   cd navinest
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

## 🛠 配置

整个仪表盘通过单个文件进行配置：`src/data/config.json`。
编辑此文件以添加您自己的分类和链接。

### 如何配置 AI

NaviNest 包含一个由 OpenAI（或兼容的提供商，如 AgentRouter）驱动的 AI 聊天组件。

1. 打开 `src/data/config.json`。
2. 确保 `aiConfig.enabled` 设置为 `true`。
3. 设置 `provider` 和 `baseUrl`。
   - OpenAI: `https://api.openai.com/v1`
   - AgentRouter: `https://agentrouter.org/v1` (或您的特定端点)
4. **API Key**: 为了安全起见，API Key **不** 存储在 `config.json` 中。
   - 点击右下角聊天组件内的 **齿轮图标**。
   - 输入您的 API Key。它将保存到您浏览器的本地存储 (Local Storage) 中。

## ☁️ 部署

### 方式 1: 部署到 Cloudflare Pages (免费)

1. 将您的代码推送到 GitHub 仓库。
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) 并转到 **Pages**。
3. 点击 **Create a project** > **Connect to Git**。
4. 选择您的仓库。
5. 在 "Build settings" 中:
   - **Framework preset**: `Astro`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
6. 点击 **Save and Deploy**。

### 方式 2: 使用 Docker 部署

您可以使用 Docker 自托管 NaviNest。

1. 确保已安装 Docker 和 Docker Compose。
2. 在项目根目录运行以下命令：
   ```bash
   docker-compose up -d --build
   ```
3. 在浏览器中打开 `http://localhost`。

## 🎨 技术栈

- **框架**: Astro (v4+)
- **样式**: Tailwind CSS
- **交互**: React
- **图标**: Lucide React
- **动画**: Framer Motion
