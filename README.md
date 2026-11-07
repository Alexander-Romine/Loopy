# Loopy

Minimalist, distraction-free YouTube video and lo-fi looper for continuous replay and low-power focus sessions.

**Live site:** https://loopy-music.vercel.app

![Loopy screenshot](screenshot.png)

## Features

- Infinite single video loop — instantly replays from 0:00 without reloading or buffering hitch
- Playlist loop mode — cycle through your entire saved queue continuously
- Audio-only performance mode — moves video offscreen to cut GPU canvas decoding and save battery/RAM
- Automatic progress persistence — saves your exact playback timestamp so you resume where you left off
- Saved loop preferences — remembers your single vs. all looping choice and active video
- Quick-add input bar — paste any YouTube URL (standard, shortened, or video ID) and press Enter or `+`
- Space lavender dark theme with subtle starry backdrop
- Background tab resource freeze — automatically sleeps polling intervals and CSS animations when tab is inactive
- Keyboard shortcuts: `Space` (Play/Pause), `L` (Loop mode), `V` (Audio-only toggle), `M` (Mute), `→`/`←` (Next/Prev)
- Playlists and settings kept locally in the browser with zero external accounts or telemetry

## Tech Stack

- [Vite](https://vite.dev/)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/)
- [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference)
- Hosted on [Vercel](https://vercel.com)
