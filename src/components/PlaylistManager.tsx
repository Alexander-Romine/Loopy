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
      className="relative flex flex-col rounded-xl border-4 border-[#5c3923] bg-[#efe7da] text-[#241912] p-5 sm:p-6 h-full min-h-[540px] shadow-[0_16px_34px_rgba(0,0,0,0.45)]"
    >
      {/* 1. Coffee Shop & Listening Station Header */}
      <div className="flex items-center justify-between border-b-2 border-[#d6c8b4] pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              spinning ? 'bg-[#c85a32]' : hasTrack ? 'bg-[#b3863b]' : 'bg-[#b5a795]'
            }`}
          />
          <div>
            <h1 className="font-[var(--font-display)] text-lg font-extrabold tracking-tight text-[#241912] leading-none">
              LOOPY CAFE
            </h1>
            <span className="block text-[9px] font-mono uppercase tracking-[0.18em] text-[#7a6856] mt-1">
              Espresso &amp; Vinyl Station
            </span>
          </div>
        </div>
        <span className="text-[11px] font-mono font-semibold text-[#9a4626] bg-[#e5dac9] border border-[#cfc0aa] px-2 py-0.5 rounded">
          {spinning ? '33⅓ RPM' : hasTrack ? 'PAUSED' : 'IDLE'}
        </span>
      </div>

      {/* 2. Now Playing & Hardware Transport */}
      <div className="rounded-lg bg-[#e5dac9] border border-[#cfc0aa] p-3.5 mb-4 space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-[var(--font-display)] text-sm font-bold text-[#241912] truncate">
              {currentTrack?.title || 'Drop a YouTube link to spin'}
            </h2>
            <p className="text-[11px] font-mono text-[#6e5b49] truncate">
              {currentTrack?.artist || 'Audio-only turntable'}
            </p>
          </div>
          <div className="font-mono text-[11px] text-[#5c4838] tabular-nums shrink-0">
            {hasTrack ? formatTime(currentTime) : '00:00'}{' '}
            <span className="text-[#9e8c78]">/</span>{' '}
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
          className={`relative w-full h-2 bg-[#d4c6b2] rounded-sm ${
            hasTrack ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'
          }`}
        >
          <div
            className="h-full bg-[#c85a32] rounded-sm relative"
            style={{ width: `${progressPercent}%` }}
          >
            {hasTrack && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-3.5 bg-[#241912] rounded-xs" />
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
              className="p-2 rounded bg-[#efe7da] hover:bg-[#f7f2e9] border border-[#cfc0aa] text-[#241912] disabled:opacity-35 disabled:pointer-events-none transition-colors"
              title="Previous record"
              aria-label="Previous record"
            >
              <SkipBack className="w-3.5 h-3.5 fill-current" />
            </button>

            <button
              type="button"
              onClick={onTogglePlay}
              disabled={!hasTrack}
              className="px-3.5 py-2 rounded bg-[#c85a32] hover:bg-[#b54e28] disabled:opacity-35 disabled:pointer-events-none text-[#f3ece0] font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
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
              className="p-2 rounded bg-[#efe7da] hover:bg-[#f7f2e9] border border-[#cfc0aa] text-[#241912] disabled:opacity-35 disabled:pointer-events-none transition-colors"
              title="Next record"
              aria-label="Next record"
            >
              <SkipForward className="w-3.5 h-3.5 fill-current" />
            </button>

            <button
              type="button"
              onClick={onToggleLoop}
              className={`px-2.5 py-2 rounded border font-mono text-[10px] font-bold flex items-center gap-1 transition-colors ${
                loopMode === 'single'
                  ? 'bg-[#c85a32]/15 text-[#9a4626] border-[#c85a32]/40'
                  : 'bg-[#efe7da] text-[#6e5b49] border-[#cfc0aa] hover:text-[#241912]'
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

          <div className="flex items-center gap-1.5 bg-[#efe7da] border border-[#cfc0aa] rounded px-2.5 py-1.5">
            <button
              type="button"
              onClick={onToggleMute}
              className="text-[#6e5b49] hover:text-[#241912] transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-[#c85a32]" />
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
              className="w-16 h-1.5 bg-[#d4c6b2] rounded-sm appearance-none cursor-pointer accent-[#c85a32]"
            />
            <span className="text-[10px] font-mono text-[#5c4838] w-7 text-right tabular-nums">
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
            className="flex-1 px-3 py-2 bg-[#f7f2e9] border border-[#cfc0aa] rounded text-xs font-mono text-[#241912] placeholder-[#8d7b68] focus:outline-none focus:border-[#c85a32] transition-colors"
          />

          <button
            type="submit"
            className="flex items-center gap-1 px-3 py-2 rounded bg-[#3b2416] hover:bg-[#4e311f] text-[#f3ece0] font-mono text-xs font-semibold uppercase tracking-wider transition-colors shrink-0"
            title="Press & spin record"
            aria-label="Add and play track"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Press</span>
          </button>
        </form>

        {error && (
          <div className="flex items-center gap-1.5 text-[11px] text-[#b43b18] mt-1.5 font-mono">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* 4. Record Crate List */}
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[#7a6856] mb-2">
        <span>Record Crate</span>
        <span>
          {String(tracks.length).padStart(2, '0')} {tracks.length === 1 ? 'DISC' : 'DISCS'}
        </span>
      </div>

      <div className="space-y-2 overflow-y-auto flex-1 pr-1 max-h-[260px]">
        {tracks.length === 0 ? (
          <div className="py-10 px-4 text-center bg-[#e5dac9]/70 rounded-lg border border-dashed border-[#c7b7a0]">
            <Disc3 className="w-6 h-6 text-[#8d7b68] mx-auto mb-2" />
            <p className="text-xs font-semibold text-[#3b2416]">Crate is empty</p>
            <p className="text-[11px] font-mono text-[#7a6856] mt-0.5">
              Paste a YouTube link above to press a vinyl.
            </p>
          </div>
        ) : (
          tracks.map((track, idx) => {
            const isCurrent = track.id === currentTrack?.id;

            return (
              <div
                key={track.id}
                className={`group flex items-center gap-2.5 p-2 rounded-lg border transition-colors ${
                  isCurrent
                    ? 'bg-[#c85a32]/12 border-[#c85a32]/45'
                    : 'bg-[#f7f2e9]/70 hover:bg-[#f7f2e9] border-[#d6c8b4]'
                }`}
              >
                <span className="font-mono text-[10px] text-[#8d7b68] w-4 text-center shrink-0 tabular-nums">
                  {String(idx + 1).padStart(2, '0')}
                </span>

                <button
                  type="button"
                  onClick={() => onSelectTrack(track)}
                  className="relative w-10 h-10 rounded overflow-hidden shrink-0 cursor-pointer bg-[#241912]"
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
                      isCurrent ? 'text-[#9a4626]' : 'text-[#241912]'
                    }`}
                  >
                    {track.title}
                  </h3>
                  <p className="text-[10px] font-mono text-[#7a6856] truncate">
                    {isCurrent && isPlaying ? 'NOW SPINNING' : track.artist}
                  </p>
                </button>

                <div className="flex items-center gap-0.5 shrink-0 opacity-75 group-hover:opacity-100">
                  <a
                    href={`https://www.youtube.com/watch?v=${track.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-[#7a6856] hover:text-[#241912] transition-colors"
                    title="Open on YouTube"
                    aria-label="Open on YouTube"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => onDeleteTrack(track.id)}
                    className="p-1.5 text-[#7a6856] hover:text-[#b43b18] transition-colors"
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
      <div className="mt-3 pt-2.5 border-t border-[#d6c8b4] flex items-center justify-between text-[10px] font-mono text-[#7a6856]">
        <span>SPACE · PLAY</span>
        <span>L · LOOP</span>
        <span>M · MUTE</span>
        <span>←/→ · SKIP</span>
      </div>
    </aside>
  );
};
