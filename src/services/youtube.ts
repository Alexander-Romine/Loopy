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
