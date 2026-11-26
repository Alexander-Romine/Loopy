import React, { useState } from 'react';
import { LofiTrack, LoopMode } from '../types/lofi';
import { extractYouTubeId, getYouTubeThumbnail } from '../services/youtube';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  Trash2,
  Plus,
  ExternalLink,
  AlertCircle,
  Disc3,
} from 'lucide-react';

interface ConsolePanelProps {
  tracks: LofiTrack[];
  currentTrack: LofiTrack | null;
  isPlaying: boolean;
  loopMode: LoopMode;
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
  onToggleLoop: () => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onSeek: (seconds: number) => void;
  onSelectTrack: (track: LofiTrack) => void;
  onDeleteTrack: (id: string) => void;
  onAddTrack: (track: LofiTrack, playImmediately: boolean) => void;
}

export const PlaylistManager: React.FC<ConsolePanelProps> = ({
  tracks,
  currentTrack,
  isPlaying,
  loopMode,
  volume,
  isMuted,
  currentTime,
  duration,
  onTogglePlay,
  onPrevTrack,
  onNextTrack,
  onToggleLoop,
  onVolumeChange,
  onToggleMute,
  onSeek,
  onSelectTrack,
  onDeleteTrack,
  onAddTrack,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const hasTrack = Boolean(currentTrack && currentTrack.youtubeId);
  const spinning = hasTrack && isPlaying;
  const progressPercent =
    duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasTrack || !duration || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(percent * duration);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const id = extractYouTubeId(urlInput);
    if (!id) {
      setError('Please paste a valid YouTube video link or ID.');
      return;
    }

    const newTrack: LofiTrack = {
      id: `track-${Date.now()}`,
      youtubeId: id,
      title: 'YouTube Track',
      artist: 'Vinyl Press',
      addedAt: Date.now(),
    };

    onAddTrack(newTrack, true);
    setUrlInput('');
    setError(null);
  };

  return (
    <aside
      aria-label="Listening Station Console"
      className="relative flex flex-col rounded-2xl border border-white/20 bg-[#1a120d]/45 backdrop-blur-md text-[#f7f2ea] p-5 sm:p-6 h-full min-h-[540px] shadow-[0_18px_40px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.28)]"
    >
      {/* 1. Liquid Glass Station Header */}
      <div className="flex items-center justify-between border-b border-white/15 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              spinning
                ? 'bg-[#e86b3a] shadow-[0_0_8px_#e86b3a]'
                : hasTrack
                ? 'bg-[#e2b35a]'
                : 'bg-white/30'
            }`}
          />
          <div>
            <h1 className="font-[var(--font-display)] text-lg font-extrabold tracking-tight text-white leading-none">
              LOOPY CAFE
            </h1>
            <span className="block text-[9px] font-mono uppercase tracking-[0.18em] text-white/60 mt-1">
              Espresso &amp; Vinyl Station
            </span>
          </div>
        </div>
        <span className="text-[11px] font-mono font-semibold text-[#f3d19e] bg-white/10 border border-white/15 px-2.5 py-0.5 rounded-full">
          {spinning ? '33⅓ RPM' : hasTrack ? 'PAUSED' : 'IDLE'}
        </span>
      </div>

      {/* 2. Now Playing & Frosted Transport */}
      <div className="rounded-xl bg-white/[0.08] border border-white/15 p-3.5 mb-4 space-y-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
        <div className="flex items-baseline justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-[var(--font-display)] text-sm font-bold text-white truncate">
              {currentTrack?.title || 'Drop a YouTube link to spin'}
            </h2>
            <p className="text-[11px] font-mono text-white/60 truncate">
              {currentTrack?.artist || 'Audio-only turntable'}
            </p>
          </div>
          <div className="font-mono text-[11px] text-[#f3d19e] tabular-nums shrink-0">
            {hasTrack ? formatTime(currentTime) : '00:00'}{' '}
            <span className="text-white/35">/</span>{' '}
            {hasTrack && duration > 0 ? formatTime(duration) : '--:--'}
          </div>
        </div>

        {/* Scrub Bar */}
        <div
          onClick={handleProgressBarClick}
          role="slider"
          aria-label="Track progress"
          aria-valuemin={0}
          aria-valuemax={duration || 100}
          aria-valuenow={currentTime}
          className={`relative w-full h-2 bg-black/30 border border-white/10 rounded-full ${
            hasTrack ? 'cursor-pointer' : 'opacity-45 cursor-not-allowed'
          }`}
        >
          <div
            className="h-full bg-[#e86b3a] rounded-full relative"
            style={{ width: `${progressPercent}%` }}
          >
            {hasTrack && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow" />
            )}
          </div>
        </div>

        {/* Transport & Volume */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onPrevTrack}
              disabled={!hasTrack}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white disabled:opacity-35 disabled:pointer-events-none transition-colors"
              title="Previous record"
              aria-label="Previous record"
            >
              <SkipBack className="w-3.5 h-3.5 fill-current" />
            </button>

            <button
              type="button"
              onClick={onTogglePlay}
              disabled={!hasTrack}
              className="px-3.5 py-2 rounded-lg bg-[#e86b3a] hover:bg-[#f07c4e] disabled:opacity-35 disabled:pointer-events-none text-white font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]"
              title={isPlaying ? 'Pause' : 'Spin'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying && hasTrack ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Spin</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onNextTrack}
              disabled={!hasTrack}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white disabled:opacity-35 disabled:pointer-events-none transition-colors"
              title="Next record"
              aria-label="Next record"
            >
              <SkipForward className="w-3.5 h-3.5 fill-current" />
            </button>

            <button
              type="button"
              onClick={onToggleLoop}
              className={`px-2.5 py-2 rounded-lg border font-mono text-[10px] font-bold flex items-center gap-1 transition-colors ${
                loopMode === 'single'
                  ? 'bg-[#e86b3a]/25 text-[#ffd2be] border-[#e86b3a]/50'
                  : 'bg-white/10 text-white/70 border-white/15 hover:text-white'
              }`}
              title={loopMode === 'single' ? 'Loop: 1 Side' : 'Loop: All'}
              aria-label="Toggle loop mode"
            >
              {loopMode === 'single' ? (
                <>
                  <Repeat1 className="w-3.5 h-3.5" />
                  <span>1</span>
                </>
              ) : (
                <>
                  <Repeat className="w-3.5 h-3.5" />
                  <span>ALL</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-black/25 border border-white/15 rounded-lg px-2.5 py-1.5">
            <button
              type="button"
              onClick={onToggleMute}
              className="text-white/70 hover:text-white transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-[#e86b3a]" />
              ) : volume < 50 ? (
                <Volume1 className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              aria-label="Volume"
              className="w-16 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#e86b3a]"
            />
            <span className="text-[10px] font-mono text-white/70 w-7 text-right tabular-nums">
              {isMuted ? '0%' : `${volume}%`}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Press New Record */}
      <div className="mb-3">
        <form onSubmit={handleAddSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Paste YouTube URL or ID..."
            className="flex-1 px-3 py-2 bg-black/25 border border-white/15 rounded-lg text-xs font-mono text-white placeholder-white/45 focus:outline-none focus:border-[#e86b3a] transition-colors"
          />

          <button
            type="submit"
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-colors shrink-0"
            title="Press & spin record"
            aria-label="Add and play track"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Press</span>
          </button>
        </form>

        {error && (
          <div className="flex items-center gap-1.5 text-[11px] text-rose-300 mt-1.5 font-mono">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* 4. Record Crate List */}
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-white/60 mb-2">
        <span>Record Crate</span>
        <span>
          {String(tracks.length).padStart(2, '0')} {tracks.length === 1 ? 'DISC' : 'DISCS'}
        </span>
      </div>

      <div className="space-y-2 overflow-y-auto flex-1 pr-1 max-h-[260px]">
        {tracks.length === 0 ? (
          <div className="py-10 px-4 text-center bg-black/20 rounded-xl border border-dashed border-white/20">
            <Disc3 className="w-6 h-6 text-white/50 mx-auto mb-2" />
            <p className="text-xs font-semibold text-white/90">Crate is empty</p>
            <p className="text-[11px] font-mono text-white/55 mt-0.5">
              Paste a YouTube link above to press a vinyl.
            </p>
          </div>
        ) : (
          tracks.map((track, idx) => {
            const isCurrent = track.id === currentTrack?.id;

            return (
              <div
                key={track.id}
                className={`group flex items-center gap-2.5 p-2 rounded-xl border transition-colors ${
                  isCurrent
                    ? 'bg-[#e86b3a]/20 border-[#e86b3a]/50'
                    : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/10'
                }`}
              >
                <span className="font-mono text-[10px] text-white/50 w-4 text-center shrink-0 tabular-nums">
                  {String(idx + 1).padStart(2, '0')}
                </span>

                <button
                  type="button"
                  onClick={() => onSelectTrack(track)}
                  className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 cursor-pointer bg-black/40 border border-white/10"
                  aria-label={`Play ${track.title}`}
                >
                  <img
                    src={getYouTubeThumbnail(track.youtubeId)}
                    alt={track.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTrack(track)}
                  className="min-w-0 flex-1 cursor-pointer text-left"
                >
                  <h3
                    className={`text-xs font-semibold truncate ${
                      isCurrent ? 'text-[#ffd2be]' : 'text-white'
                    }`}
                  >
                    {track.title}
                  </h3>
                  <p className="text-[10px] font-mono text-white/60 truncate">
                    {isCurrent && isPlaying ? 'NOW SPINNING' : track.artist}
                  </p>
                </button>

                <div className="flex items-center gap-0.5 shrink-0 opacity-75 group-hover:opacity-100">
                  <a
                    href={`https://www.youtube.com/watch?v=${track.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-white/60 hover:text-white transition-colors"
                    title="Open on YouTube"
                    aria-label="Open on YouTube"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => onDeleteTrack(track.id)}
                    className="p-1.5 text-white/60 hover:text-rose-300 transition-colors"
                    title="Remove from crate"
                    aria-label="Remove from crate"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Keyboard Shortcuts */}
      <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between text-[10px] font-mono text-white/55">
        <span>SPACE · PLAY</span>
        <span>L · LOOP</span>
        <span>M · MUTE</span>
        <span>←/→ · SKIP</span>
      </div>
    </aside>
  );
};
