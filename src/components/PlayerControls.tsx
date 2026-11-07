import React from 'react';
import { LoopMode, LofiTrack } from '../types/lofi';
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
  Eye,
  EyeOff,
} from 'lucide-react';

interface PlayerControlsProps {
  currentTrack: LofiTrack | null;
  isPlaying: boolean;
  loopMode: LoopMode;
  volume: number;
  isMuted: boolean;
  isVideoHidden: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
  onToggleLoop: () => void;
  onToggleVideoHidden: () => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onSeek: (seconds: number) => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  currentTrack,
  isPlaying,
  loopMode,
  volume,
  isMuted,
  isVideoHidden,
  currentTime,
  duration,
  onTogglePlay,
  onPrevTrack,
  onNextTrack,
  onToggleLoop,
  onToggleVideoHidden,
  onVolumeChange,
  onToggleMute,
  onSeek,
}) => {
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const hasTrack = Boolean(currentTrack && currentTrack.youtubeId);
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasTrack || !duration || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(percent * duration);
  };

  return (
    <div className="w-full bg-[#0f0921]/85 border border-purple-500/20 rounded-2xl p-3 sm:px-4 sm:py-3 shadow-[0_8px_32px_rgba(10,5,25,0.6)] backdrop-blur-xl">
      {/* 1. Slim Timeline / Scrub Bar */}
      <div className="mb-2">
        <div
          onClick={handleProgressBarClick}
          className={`group relative w-full h-1.5 hover:h-2 bg-purple-950/60 rounded-full transition-all border border-purple-900/30 ${
            hasTrack ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'
          }`}
        >
          <div
            className="h-full bg-gradient-to-r from-purple-600 via-purple-400 to-fuchsia-300 rounded-full relative shadow-[0_0_10px_rgba(168,85,247,0.5)]"
            style={{ width: `${progressPercent}%` }}
          >
            {hasTrack && (
              <div className="opacity-0 group-hover:opacity-100 absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_8px_#c084fc] transition-opacity" />
            )}
          </div>
        </div>

        <div className="flex justify-between items-center text-[11px] font-mono text-purple-300/70 mt-1 tabular-nums">
          <span>{hasTrack ? formatTime(currentTime) : '00:00'}</span>
          <span>{hasTrack && duration > 0 ? formatTime(duration) : '--:--'}</span>
        </div>
      </div>

      {/* 2. Vertically Compressed Controls & Track Details */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
        {/* Track Info */}
        <div className="min-w-0 max-w-xs w-full sm:w-auto text-center sm:text-left">
          <h3 className="text-xs sm:text-sm font-semibold text-purple-100 truncate leading-tight">
            {currentTrack?.title || 'No video loaded'}
          </h3>
          <p className="text-[11px] text-purple-300/70 truncate leading-tight mt-0.5">
            {currentTrack?.artist || 'Add a YouTube link to play'}
          </p>
        </div>

        {/* Transport Controls (Compact heights) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onPrevTrack}
            disabled={!hasTrack}
            className="p-1.5 rounded-full text-purple-200 hover:text-white hover:bg-purple-500/15 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Previous video"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={onTogglePlay}
            disabled={!hasTrack}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 via-purple-500 to-violet-400 hover:from-purple-500 hover:to-violet-300 disabled:opacity-30 disabled:pointer-events-none text-white flex items-center justify-center shadow-[0_0_16px_rgba(168,85,247,0.4)] transition-all hover:scale-105 active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying && hasTrack ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current translate-x-0.5" />
            )}
          </button>

          <button
            onClick={onNextTrack}
            disabled={!hasTrack}
            className="p-1.5 rounded-full text-purple-200 hover:text-white hover:bg-purple-500/15 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Next video"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>

          {/* Loop Mode Toggle */}
          <button
            onClick={onToggleLoop}
            className={`p-2 rounded-xl transition-all ${
              loopMode === 'single'
                ? 'bg-purple-500/25 text-purple-200 border border-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                : 'bg-purple-950/40 text-purple-300/70 hover:bg-purple-900/40 hover:text-purple-200 border border-purple-900/30'
            }`}
            title={loopMode === 'single' ? 'Currently looping 1 video infinitely' : 'Currently looping all videos in playlist'}
          >
            {loopMode === 'single' ? (
              <Repeat1 className="w-3.5 h-3.5 stroke-[2.5]" />
            ) : (
              <Repeat className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Hide Video / Audio Only Mode */}
          <button
            onClick={onToggleVideoHidden}
            className={`p-2 rounded-xl transition-all ${
              isVideoHidden
                ? 'bg-purple-500/25 text-purple-200 border border-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                : 'bg-purple-950/40 text-purple-300/70 hover:text-purple-200 hover:bg-purple-900/40 border border-purple-900/30'
            }`}
            title={isVideoHidden ? 'Show Video Frame' : 'Hide Video (Audio Only for Optimal Speed)'}
          >
            {isVideoHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-1.5 justify-end w-full sm:w-auto">
          <button
            onClick={onToggleMute}
            className="p-1 text-purple-300/70 hover:text-purple-100 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-fuchsia-400" />
            ) : volume < 50 ? (
              <Volume1 className="w-3.5 h-3.5 text-purple-300" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-purple-200" />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="w-16 sm:w-20 h-1.5 bg-purple-950 rounded-lg appearance-none cursor-pointer accent-purple-400"
          />
          <span className="text-[11px] font-mono text-purple-300/80 w-7 text-right tabular-nums">
            {isMuted ? '0%' : `${volume}%`}
          </span>
        </div>
      </div>
    </div>
  );
};
