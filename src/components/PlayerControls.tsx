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
  Disc3,
} from 'lucide-react';
import { Turntable } from './Turntable';

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
    <div className="w-full bg-[#1a1714] border border-[#2c2722] rounded-xl p-3.5 sm:px-4 sm:py-3.5">
      {/* 1. Slim Timeline / Scrub Bar */}
      <div className="mb-3">
        <div
          onClick={handleProgressBarClick}
          className={`group relative w-full h-1.5 hover:h-2 bg-[#2b2621] rounded-sm transition-all ${
            hasTrack ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'
          }`}
        >
          <div
            className="h-full bg-[#e07a38] rounded-sm relative"
            style={{ width: `${progressPercent}%` }}
          >
            {hasTrack && (
              <div className="opacity-0 group-hover:opacity-100 absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-[#f3ede2] rounded-sm transition-opacity" />
            )}
          </div>
        </div>

        <div className="flex justify-between items-center text-[11px] font-mono text-[#9e9488] mt-1 tabular-nums">
          <span>{hasTrack ? formatTime(currentTime) : '00:00'}</span>
          <span>{hasTrack && duration > 0 ? formatTime(duration) : '--:--'}</span>
        </div>
      </div>

      {/* 2. Deck Controls & Track Details */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
        {/* Compact Vinyl + Track Info */}
        <div className="flex items-center gap-2.5 min-w-0 max-w-xs w-full sm:w-auto justify-center sm:justify-start">
          <Turntable
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            loopMode={loopMode}
            compact
          />
          <div className="min-w-0 text-left">
            <h3 className="text-xs sm:text-sm font-semibold text-[#f3ede2] truncate leading-tight">
              {currentTrack?.title || 'No record loaded'}
            </h3>
            <p className="text-[11px] text-[#9e9488] truncate leading-tight mt-0.5">
              {currentTrack?.artist || 'Add a YouTube link to spin'}
            </p>
          </div>
        </div>

        {/* Transport Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onPrevTrack}
            disabled={!hasTrack}
            className="p-1.5 rounded-md text-[#c7bfb4] hover:text-[#f3ede2] hover:bg-[#25211d] disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Previous video"
            aria-label="Previous video"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={onTogglePlay}
            disabled={!hasTrack}
            className="w-9 h-9 rounded-md bg-[#e07a38] hover:bg-[#ea8b4d] disabled:opacity-30 disabled:pointer-events-none text-[#141210] flex items-center justify-center transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
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
            className="p-1.5 rounded-md text-[#c7bfb4] hover:text-[#f3ede2] hover:bg-[#25211d] disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Next video"
            aria-label="Next video"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>

          {/* Loop Mode Toggle */}
          <button
            onClick={onToggleLoop}
            className={`p-2 rounded-md transition-colors ${
              loopMode === 'single'
                ? 'bg-[#e07a38]/20 text-[#e07a38] border border-[#e07a38]/40'
                : 'bg-[#141210] text-[#9e9488] hover:bg-[#25211d] hover:text-[#f3ede2] border border-[#2c2722]'
            }`}
            title={loopMode === 'single' ? 'Currently looping 1 video infinitely' : 'Currently looping all videos in playlist'}
            aria-label="Toggle loop mode"
          >
            {loopMode === 'single' ? (
              <Repeat1 className="w-3.5 h-3.5 stroke-[2.5]" />
            ) : (
              <Repeat className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Turntable / Video Mode Toggle */}
          <button
            onClick={onToggleVideoHidden}
            className={`p-2 rounded-md transition-colors ${
              isVideoHidden
                ? 'bg-[#e07a38]/20 text-[#e07a38] border border-[#e07a38]/40'
                : 'bg-[#141210] text-[#9e9488] hover:text-[#f3ede2] hover:bg-[#25211d] border border-[#2c2722]'
            }`}
            title={isVideoHidden ? 'Show Video Frame' : 'Turntable Mode (Audio Only)'}
            aria-label={isVideoHidden ? 'Show Video Frame' : 'Turntable Mode'}
          >
            {isVideoHidden ? <Eye className="w-3.5 h-3.5" /> : <Disc3 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-1.5 justify-end w-full sm:w-auto">
          <button
            onClick={onToggleMute}
            className="p-1 text-[#9e9488] hover:text-[#f3ede2] transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            ) : volume < 50 ? (
              <Volume1 className="w-3.5 h-3.5 text-[#c7bfb4]" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-[#f3ede2]" />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            aria-label="Volume"
            className="w-16 sm:w-20 h-1.5 bg-[#2b2621] rounded-sm appearance-none cursor-pointer accent-[#e07a38]"
          />
          <span className="text-[11px] font-mono text-[#9e9488] w-7 text-right tabular-nums">
            {isMuted ? '0%' : `${volume}%`}
          </span>
        </div>
      </div>
    </div>
  );
};
