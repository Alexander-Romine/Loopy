import { LofiTrack } from '../types/lofi';

/**
 * Extracts an 11-character YouTube video ID from various URL formats.
 */
export function extractYouTubeId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // Plain 11-character ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Covers standard URL variants (youtube.com, youtu.be, shorts, embeds, live)
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/;
  const match = trimmed.match(regExp);

  return match && match[1] ? match[1] : null;
}

export function getYouTubeThumbnail(videoId: string): string {
  if (!videoId) return '';
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

// Default empty playlist - users add their own links
export const INITIAL_TRACKS: LofiTrack[] = [];

// Persistence helpers for video playback position
export function getSavedProgress(youtubeId: string): number {
  if (!youtubeId) return 0;
  try {
    const raw = localStorage.getItem('loopy_video_progress');
    if (raw) {
      const map = JSON.parse(raw);
      const time = map[youtubeId];
      // Only resume if at least 3 seconds into the video
      if (typeof time === 'number' && time > 3) {
        return time;
      }
    }
  } catch {
    // ignore
  }
  return 0;
}

export function saveProgress(youtubeId: string, seconds: number): void {
  if (!youtubeId) return;
  try {
    const raw = localStorage.getItem('loopy_video_progress');
    const map = raw ? JSON.parse(raw) : {};
    map[youtubeId] = Math.floor(seconds);
    localStorage.setItem('loopy_video_progress', JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function clearProgress(youtubeId: string): void {
  if (!youtubeId) return;
  try {
    const raw = localStorage.getItem('loopy_video_progress');
    if (raw) {
      const map = JSON.parse(raw);
      delete map[youtubeId];
      localStorage.setItem('loopy_video_progress', JSON.stringify(map));
    }
  } catch {
    // ignore
  }
}
