# Loopy 🎵

> A minimalist, high-performance YouTube video looper designed for distraction-free focus, study, and music replay with ultra-low resource usage.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Features

- 🔁 **Infinite Single Video Loop**: Loop your chosen video forever without reloading or buffering hitch. When the video ends, it seeks back to `0:00` and resumes immediately.
- 🔂 **Loop All (Playlist Mode)**: Switch seamlessly between looping one video and continuous playlist cycling.
- ⚡ **Audio-Only / Low-Power Mode**: Toggle video frame off-screen to eliminate GPU canvas rendering and decoding overhead for maximum battery life and minimum RAM.
- 🌙 **Space Lavender Aesthetic**: Deep cosmic obsidian background, frosted glass surfaces, and subtle starry backdrop.
- ➕ **Zero-Friction Quick Add**: Paste any YouTube URL (`youtube.com/watch?v=...`, `youtu.be/...`, shorts, or video ID) and press `Enter` (or click `+`) to immediately load and loop.
- 💾 **Local Persistence**: Your custom playlist and playback settings are automatically preserved in `localStorage`.
- ⌨️ **Keyboard Shortcuts**:
  - `Space`: Play / Pause
  - `L`: Toggle Loop mode (Single vs All)
  - `V`: Toggle Video on/off (Audio-only mode)
  - `M`: Mute / Unmute
  - `→` / `←`: Next / Previous video

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/loopy.git

# Navigate into the project directory
cd loopy

# Install dependencies
npm install

# Start the local development server
npm run dev
```

The app will be running at `http://localhost:3000`.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **API**: Native [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference)

---

## ☁️ Deployment

### Deploying to Vercel

1. Push this repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **"Add New..." > "Project"**.
3. Import your GitHub repository.
4. Vercel automatically detects the Vite framework and runs `npm run build` (output directory: `dist`).
5. Click **Deploy**.

Included in this repository is `vercel.json` with proper SPA routing rewrites and asset caching headers.

---

## 📄 License

MIT License © 2026. Free for personal and commercial use.
