export type LoopMode = 'single' | 'all';

export type ThemeId = 'cafe' | 'midnight' | 'botanical';

export interface LofiTrack {
  id: string;
  youtubeId: string;
  title: string;
  artist: string;
  addedAt: number;
}
