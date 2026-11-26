export type LoopMode = 'single' | 'all';

export type ThemeId = 'cafe' | 'galaxy' | 'jungle';

export interface LofiTrack {
  id: string;
  youtubeId: string;
  title: string;
  artist: string;
  addedAt: number;
}
