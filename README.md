# NaviNest 🧭

[中文文档](README_ZH.md)

NaviNest is an open-source, highly customizable, and beginner-friendly personal navigation dashboard. It features a modern glassmorphism design, intelligent search, and a built-in AI Chat Widget.

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/navinest.git
   cd navinest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🛠 Configuration

The entire dashboard is configured via a single file: `src/data/config.json`.
Edit this file to add your own categories and links.

### How to Configure AI

NaviNest includes an AI Chat Widget powered by OpenAI (or compatible providers like AgentRouter).

1. Open `src/data/config.json`.
2. Ensure `aiConfig.enabled` is set to `true`.
3. Set the `provider` and `baseUrl`.
   - For OpenAI: `https://api.openai.com/v1`
   - For AgentRouter: `https://agentrouter.org/v1` (or your specific endpoint)
4. **API Key**: The API Key is **NOT** stored in `config.json` for security.
   - Click the **Gear Icon** inside the chat widget on the bottom right.
   - Enter your API Key. It will be saved to your browser's Local Storage.

## ☁️ Deployment

### Section 1: Deploy to Cloudflare Pages (Free)

1. Push your code to a GitHub repository.
2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) and go to **Pages**.
3. Click **Create a project** > **Connect to Git**.
4. Select your repository.
5. In "Build settings":
   - **Framework preset**: `Astro`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
6. Click **Save and Deploy**.

### Section 2: Deploy with Docker

You can self-host NaviNest using Docker.

1. Ensure Docker and Docker Compose are installed.
2. Run the following command in the project root:
   ```bash
   docker-compose up -d --build
   ```
3. Open `http://localhost` in your browser.

## 🎨 Tech Stack

- **Framework**: Astro (v4+)
- **Styling**: Tailwind CSS
- **Interactivity**: React
- **Icons**: Lucide React
- **Animation**: Framer Motion
