import React from 'react';
import { getYouTubeThumbnail } from '../services/youtube';
import { LofiTrack, LoopMode } from '../types/lofi';
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
} from 'lucide-react';

interface TurntableProps {
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
}

export const Turntable: React.FC<TurntableProps> = ({
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
}) => {
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

  return (
    <section
      aria-label="Analog Turntable Deck"
      className="relative flex flex-col justify-between rounded-2xl border border-[#2d2925] bg-[#161412] p-5 sm:p-7 overflow-hidden min-h-[560px] lg:min-h-[640px]"
    >
      {/* Warm analog ambient wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 42% 38%, rgba(232, 93, 42, 0.11) 0%, rgba(200, 162, 88, 0.04) 38%, transparent 72%)',
        }}
      />

      {/* Top Editorial / Hardware Strip */}
      <div className="relative z-10 flex items-center justify-between gap-4 border-b border-[#272320] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                spinning
                  ? 'bg-[#e85d2a] shadow-[0_0_10px_#e85d2a]'
                  : hasTrack
                  ? 'bg-[#d4a34b]'
                  : 'bg-[#3d3731]'
              }`}
            />
            <h1 className="font-[var(--font-display)] text-xl sm:text-2xl font-extrabold tracking-tight text-[#f2ece1]">
              LOOPY
            </h1>
          </div>
          <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-[0.2em] text-[#8d8479] border-l border-[#2d2925] pl-3">
            Direct-Drive Audio Deck
          </span>
        </div>

        {/* Live Backlit VU Meter + RPM Readout */}
        <div className="flex items-center gap-4">
          <div className="flex items-end gap-1 h-5 px-2.5 py-1 rounded bg-[#0e0d0c] border border-[#272320]" aria-hidden="true">
            <span
              className={`w-1 h-full rounded-xs bg-[#d4a34b] ${spinning ? 'animate-vu-1' : 'scale-y-[0.2] opacity-40'}`}
            />
            <span
              className={`w-1 h-full rounded-xs bg-[#e85d2a] ${spinning ? 'animate-vu-2' : 'scale-y-[0.2] opacity-40'}`}
            />
            <span
              className={`w-1 h-full rounded-xs bg-[#d4a34b] ${spinning ? 'animate-vu-3' : 'scale-y-[0.2] opacity-40'}`}
            />
            <span
              className={`w-1 h-full rounded-xs bg-[#e85d2a] ${spinning ? 'animate-vu-4' : 'scale-y-[0.2] opacity-40'}`}
            />
          </div>
          <span className="text-[11px] font-mono tracking-widest text-[#d4a34b]">
            {spinning ? '33⅓ RPM' : hasTrack ? 'HOLD' : 'IDLE'}
          </span>
        </div>
      </div>

      {/* Centerpiece: Sculptural Turntable Platter & Tonearm */}
      <div className="relative z-10 flex-1 flex items-center justify-center py-6 sm:py-8">
        <div className="relative flex items-center justify-center">
          {/* Architectural Plinth Ring */}
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-[#0c0b0a] border-[6px] border-[#26221e] shadow-[inset_0_8px_24px_rgba(0,0,0,0.9),0_20px_50px_rgba(0,0,0,0.65)] flex items-center justify-center">
            {/* Strobe Timing Dots */}
            <div className="absolute inset-2 rounded-full border border-dashed border-[#6e655b]/35 pointer-events-none" />

            {/* Interactive Vinyl Record */}
            <button
              type="button"
              onClick={hasTrack ? onTogglePlay : undefined}
              disabled={!hasTrack}
              aria-label={
                spinning ? 'Pause record' : hasTrack ? 'Play record' : 'No record loaded'
              }
              className={`relative w-[90%] h-[90%] rounded-full flex items-center justify-center animate-vinyl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e85d2a] ${
                hasTrack ? 'cursor-pointer' : 'cursor-default'
              }`}
              style={{
                animationPlayState: spinning ? 'running' : 'paused',
                background:
                  'repeating-radial-gradient(circle at center, #141210 0px, #141210 2px, #211d1a 3.5px, #100e0d 5px)',
              }}
            >
              {/* Iridescent / Warm Studio Light Refraction */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none opacity-45"
                style={{
                  background:
                    'conic-gradient(from 25deg, transparent 0deg, rgba(242,236,225,0.16) 28deg, transparent 62deg, transparent 180deg, rgba(232,93,42,0.15) 210deg, transparent 250deg)',
                }}
              />

              {/* Center Record Label */}
              <div className="relative w-[38%] h-[38%] rounded-full bg-[#e85d2a] border-2 border-[#f2ece1]/35 overflow-hidden flex items-center justify-center shadow-inner">
                {hasTrack && currentTrack ? (
                  <img
                    src={getYouTubeThumbnail(currentTrack.youtubeId)}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-center leading-none px-2">
                    <div className="font-[var(--font-display)] text-xs font-extrabold tracking-widest text-[#12100e]">
                      LOOPY
                    </div>
                    <div className="text-[8px] font-mono text-[#12100e]/80 mt-1">
                      SIDE A · 33⅓
                    </div>
                  </div>
                )}
                {/* Brushed Brass Spindle */}
                <div className="absolute w-3 h-3 rounded-full bg-[#e6dccd] border border-[#12100e] shadow" />
              </div>
            </button>
          </div>

          {/* Articulated S-Shaped Tonearm */}
          <div
            className="absolute -right-8 sm:-right-12 top-2 w-24 h-56 pointer-events-none origin-[62px_26px] transition-transform duration-700 ease-in-out"
            style={{
              transform: spinning ? 'rotate(20deg)' : 'rotate(-6deg)',
            }}
          >
            <svg
              viewBox="0 0 96 224"
              className="w-full h-full overflow-visible drop-shadow-[0_8px_12px_rgba(0,0,0,0.7)]"
            >
              {/* Gimbal Base & Anti-Skate Dial */}
              <circle cx="62" cy="26" r="18" fill="#231f1c" stroke="#4a433c" strokeWidth="2" />
              <circle cx="62" cy="26" r="9" fill="#8d8479" />
              <circle cx="62" cy="26" r="3" fill="#161412" />
              {/* Counterweight */}
              <rect
                x="54"
                y="2"
                width="16"
                height="12"
                rx="2"
                fill="#5e564e"
                stroke="#a89e92"
                strokeWidth="1"
              />
              {/* S-Shaped Tonearm Tube */}
              <path
                d="M 62 34 L 62 104 Q 62 134 44 154 L 28 176"
                fill="none"
                stroke="#d6cfc4"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              {/* Headshell & Glowing Stylus */}
              <g transform="translate(23, 173) rotate(36)">
                <rect
                  x="-5"
                  y="0"
                  width="11"
                  height="22"
                  rx="1.5"
                  fill="#1f1b18"
                  stroke="#e85d2a"
                  strokeWidth="1.4"
                />
                <circle
                  cx="0.5"
                  cy="18"
                  r="2"
                  fill={spinning ? '#e85d2a' : '#8d8479'}
                />
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom Integrated Faceplate: Track Info, Groove Scale, Hardware Controls */}
      <div className="relative z-10 border-t border-[#272320] pt-4 space-y-4">
        {/* Track Title + Timecode */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-[var(--font-display)] text-lg sm:text-xl font-bold text-[#f2ece1] truncate leading-tight">
              {currentTrack?.title || 'Drop a YouTube link to spin'}
            </h2>
            <p className="text-xs font-mono text-[#8d8479] truncate mt-0.5">
              {currentTrack?.artist || 'Audio-only vinyl loop console'}
            </p>
          </div>
          <div className="font-mono text-xs text-[#d4a34b] tabular-nums shrink-0">
            {hasTrack ? formatTime(currentTime) : '00:00'}{' '}
            <span className="text-[#5e564e]">/</span>{' '}
            {hasTrack && duration > 0 ? formatTime(duration) : '--:--'}
          </div>
        </div>

        {/* Groove Tracking Scrub Bar */}
        <div
          onClick={handleProgressBarClick}
          role="slider"
          aria-label="Track progress"
          aria-valuemin={0}
          aria-valuemax={duration || 100}
          aria-valuenow={currentTime}
          className={`group relative w-full h-2 bg-[#0e0d0c] border border-[#272320] rounded-sm ${
            hasTrack ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'
          }`}
        >
          <div
            className="h-full bg-[#e85d2a] rounded-xs relative transition-[width] duration-150"
            style={{ width: `${progressPercent}%` }}
          >
            {hasTrack && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-3.5 bg-[#f2ece1] border border-[#0e0d0c] rounded-xs" />
            )}
          </div>
        </div>

        {/* Mechanical Transport & Fader Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrevTrack}
              disabled={!hasTrack}
              className="px-3 py-2 rounded-md bg-[#1f1c19] hover:bg-[#2a2622] border border-[#2f2a25] text-[#d6cfc4] disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Previous record"
              aria-label="Previous record"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            <button
              type="button"
              onClick={onTogglePlay}
              disabled={!hasTrack}
              className="px-5 py-2 rounded-md bg-[#e85d2a] hover:bg-[#f06e3e] disabled:opacity-30 disabled:pointer-events-none text-[#12100e] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
              title={isPlaying ? 'Pause' : 'Play'}
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
              className="px-3 py-2 rounded-md bg-[#1f1c19] hover:bg-[#2a2622] border border-[#2f2a25] text-[#d6cfc4] disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Next record"
              aria-label="Next record"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>

            <button
              type="button"
              onClick={onToggleLoop}
              className={`px-3 py-2 rounded-md border font-mono text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
                loopMode === 'single'
                  ? 'bg-[#e85d2a]/15 text-[#e85d2a] border-[#e85d2a]/40'
                  : 'bg-[#1f1c19] text-[#8d8479] border-[#2f2a25] hover:text-[#f2ece1]'
              }`}
              title={loopMode === 'single' ? 'Loop: Single Record' : 'Loop: Full Crate'}
              aria-label="Toggle loop mode"
            >
              {loopMode === 'single' ? (
                <>
                  <Repeat1 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">1 SIDE</span>
                </>
              ) : (
                <>
                  <Repeat className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ALL</span>
                </>
              )}
            </button>
          </div>

          {/* Volume Fader */}
          <div className="flex items-center gap-2 bg-[#0e0d0c] border border-[#272320] rounded-md px-3 py-1.5">
            <button
              type="button"
              onClick={onToggleMute}
              className="text-[#8d8479] hover:text-[#f2ece1] transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              ) : volume < 50 ? (
                <Volume1 className="w-3.5 h-3.5 text-[#d6cfc4]" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-[#f2ece1]" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              aria-label="Volume"
              className="w-20 sm:w-24 h-1.5 bg-[#272320] rounded-sm appearance-none cursor-pointer accent-[#e85d2a]"
            />
            <span className="text-[11px] font-mono text-[#8d8479] w-8 text-right tabular-nums">
              {isMuted ? '0%' : `${volume}%`}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
