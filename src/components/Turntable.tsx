import React from 'react';
import { getYouTubeThumbnail } from '../services/youtube';
import { LofiTrack, LoopMode } from '../types/lofi';

interface TurntableProps {
  currentTrack: LofiTrack | null;
  isPlaying: boolean;
  loopMode: LoopMode;
  onTogglePlay?: () => void;
  compact?: boolean;
}

export const Turntable: React.FC<TurntableProps> = ({
  currentTrack,
  isPlaying,
  loopMode,
  onTogglePlay,
  compact = false,
}) => {
  const hasTrack = Boolean(currentTrack && currentTrack.youtubeId);
  const spinning = hasTrack && isPlaying;

  if (compact) {
    return (
      <div
        className="relative w-10 h-10 shrink-0 rounded-full bg-[#0d0c0b] border border-[#3a332c] flex items-center justify-center overflow-hidden shadow-inner"
        title={spinning ? 'Spinning at 33⅓ RPM' : 'Turntable idle'}
      >
        <div
          className="w-full h-full rounded-full flex items-center justify-center animate-vinyl"
          style={{
            animationPlayState: spinning ? 'running' : 'paused',
            background:
              'repeating-radial-gradient(circle at center, #181512 0px, #181512 2px, #24201c 3px, #12100e 4px)',
          }}
        >
          <div className="w-4 h-4 rounded-full bg-[#e07a38] border border-[#f3ede2]/40 flex items-center justify-center overflow-hidden">
            {hasTrack && currentTrack ? (
              <img
                src={getYouTubeThumbnail(currentTrack.youtubeId)}
                alt=""
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-1 h-1 rounded-full bg-[#141210]" />
            )}
          </div>
        </div>
        <div className="absolute w-1 h-1 rounded-full bg-[#d8cfc2] pointer-events-none" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-[#1a1714] flex flex-col items-center justify-center p-4 sm:p-6 select-none overflow-hidden">
      {/* Subtle brushed-metal / walnut deck texture */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 30% 25%, rgba(224,122,56,0.12), transparent 55%), linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
        }}
      />

      {/* Top deck markings */}
      <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between text-[10px] font-mono tracking-widest uppercase text-[#9e9488]">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full transition-colors ${
              spinning
                ? 'bg-[#e07a38] shadow-[0_0_8px_#e07a38]'
                : hasTrack
                ? 'bg-[#c8a258]/70'
                : 'bg-[#463f37]'
            }`}
          />
          <span>{spinning ? '33⅓ RPM · SPINNING' : hasTrack ? '33⅓ RPM · PAUSED' : 'DECK READY'}</span>
        </div>
        <span className="text-[#c8a258]">
          {loopMode === 'single' ? 'REPEAT · 1' : 'REPEAT · ALL'}
        </span>
      </div>

      {/* Turntable Platter + Tonearm Assembly */}
      <div className="relative flex items-center justify-center my-2">
        {/* Recessed Platter Well */}
        <button
          type="button"
          onClick={hasTrack ? onTogglePlay : undefined}
          disabled={!hasTrack}
          aria-label={spinning ? 'Pause record' : hasTrack ? 'Play record' : 'No record loaded'}
          className={`relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-[#0e0c0a] border-4 border-[#2b2621] shadow-[inset_0_4px_16px_rgba(0,0,0,0.85),0_12px_30px_rgba(0,0,0,0.5)] flex items-center justify-center transition-transform ${
            hasTrack ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'
          }`}
        >
          {/* Strobe Dots Ring */}
          <div
            className="absolute inset-1 rounded-full border border-dashed border-[#6b6157]/40 pointer-events-none"
          />

          {/* Spinning Vinyl Record */}
          <div
            className="relative w-[88%] h-[88%] rounded-full flex items-center justify-center animate-vinyl shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
            style={{
              animationPlayState: spinning ? 'running' : 'paused',
              background:
                'repeating-radial-gradient(circle at center, #151311 0px, #151311 2px, #211d1a 3.5px, #110f0d 5px)',
            }}
          >
            {/* Subtle vinyl sheen */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none opacity-35"
              style={{
                background:
                  'conic-gradient(from 35deg, transparent 0deg, rgba(243,237,226,0.14) 30deg, transparent 70deg, transparent 180deg, rgba(243,237,226,0.1) 215deg, transparent 255deg)',
              }}
            />

            {/* Center Record Label */}
            <div className="relative w-[38%] h-[38%] rounded-full bg-[#e07a38] border-2 border-[#f3ede2]/30 overflow-hidden flex items-center justify-center shadow-inner">
              {hasTrack && currentTrack ? (
                <img
                  src={getYouTubeThumbnail(currentTrack.youtubeId)}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-center leading-none px-1">
                  <div className="text-[9px] font-mono font-bold tracking-widest text-[#141210]">
                    LOOPY
                  </div>
                  <div className="text-[7px] font-mono text-[#141210]/75 mt-0.5">
                    33⅓
                  </div>
                </div>
              )}
              {/* Spindle Hole */}
              <div className="absolute w-2.5 h-2.5 rounded-full bg-[#d8cfc2] border border-[#141210] shadow" />
            </div>
          </div>
        </button>

        {/* Pivoting Tonearm */}
        <div
          className="absolute -right-8 sm:-right-10 top-2 w-20 h-44 pointer-events-none origin-[52px_22px] transition-transform duration-700 ease-in-out"
          style={{
            transform: spinning ? 'rotate(18deg)' : 'rotate(-6deg)',
          }}
        >
          <svg viewBox="0 0 80 180" className="w-full h-full overflow-visible drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
            {/* Gimbal Base */}
            <circle cx="52" cy="22" r="14" fill="#2b2621" stroke="#524940" strokeWidth="2" />
            <circle cx="52" cy="22" r="7" fill="#9e9488" />
            {/* Counterweight */}
            <rect x="46" y="2" width="12" height="10" rx="2" fill="#736a60" stroke="#a69c90" strokeWidth="1" />
            {/* S-shaped Arm */}
            <path
              d="M 52 28 L 52 85 Q 52 108 38 124 L 24 142"
              fill="none"
              stroke="#c7bfb4"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Headshell & Cartridge */}
            <g transform="translate(20, 140) rotate(36)">
              <rect x="-4" y="0" width="9" height="18" rx="1.5" fill="#2b2621" stroke="#e07a38" strokeWidth="1.2" />
              <circle cx="0.5" cy="15" r="1.5" fill="#e07a38" />
            </g>
          </svg>
        </div>
      </div>

      {/* Bottom Track Caption */}
      <div className="mt-2 text-center max-w-sm px-4">
        <p className="text-xs sm:text-sm font-semibold text-[#f3ede2] truncate">
          {hasTrack && currentTrack ? currentTrack.title : 'Drop a YouTube link to spin'}
        </p>
        <p className="text-[11px] font-mono text-[#9e9488] truncate mt-0.5">
          {hasTrack && currentTrack
            ? `${currentTrack.artist} · Click platter to ${spinning ? 'pause' : 'play'}`
            : 'Paste any YouTube URL in the sleeve to the right'}
        </p>
      </div>
    </div>
  );
};
