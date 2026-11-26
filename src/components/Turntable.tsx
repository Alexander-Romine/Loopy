import React from 'react';
import { getYouTubeThumbnail } from '../services/youtube';
import { LofiTrack } from '../types/lofi';

interface TurntableProps {
  currentTrack: LofiTrack | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const Turntable: React.FC<TurntableProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
}) => {
  const hasTrack = Boolean(currentTrack && currentTrack.youtubeId);
  const spinning = hasTrack && isPlaying;

  return (
    <section
      aria-label="Walnut Turntable"
      className="relative flex flex-col items-center justify-center w-full h-full py-4 sm:py-6 select-none"
    >
      {/* Open Hinged Acrylic Dust Cover Lip */}
      <div
        aria-hidden="true"
        className="w-[min(480px,90vw)] h-6 rounded-t-lg border border-b-0 border-[#f3ece0]/20 bg-[#f3ece0]/[0.05] flex items-center justify-between px-8"
      >
        <span className="w-6 h-1.5 rounded-b bg-[#6e5a49]" />
        <span className="w-6 h-1.5 rounded-b bg-[#6e5a49]" />
      </div>

      {/* Walnut Turntable Plinth */}
      <div className="relative w-[min(500px,94vw)] rounded-xl bg-[#472b19] border-2 border-[#5c3923] p-4 sm:p-5 shadow-[0_20px_45px_rgba(0,0,0,0.55)]">
        {/* Matte Charcoal Top Deck */}
        <div className="relative rounded-lg bg-[#1d1a18] border border-[#2f2a26] p-4 sm:p-5 flex items-center justify-center">
          {/* Oversized Spinning Vinyl Platter */}
          <div className="relative w-[min(370px,72vw)] h-[min(370px,72vw)] rounded-full bg-[#110f0e] border-4 border-[#2b2622] flex items-center justify-center">
            <button
              type="button"
              onClick={hasTrack ? onTogglePlay : undefined}
              disabled={!hasTrack}
              aria-label={
                spinning
                  ? 'Pause record'
                  : hasTrack
                  ? 'Play record'
                  : 'No record loaded'
              }
              className={`relative w-[94%] h-[94%] rounded-full flex items-center justify-center animate-vinyl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c85a32] ${
                hasTrack ? 'cursor-pointer' : 'cursor-default'
              }`}
              style={{
                animationPlayState: spinning ? 'running' : 'paused',
                background:
                  'repeating-radial-gradient(circle at center, #141210 0px, #141210 2px, #211d1a 4px, #0f0d0c 6px)',
              }}
            >
              {/* Warm Cream Center Label (matches reference turntable) */}
              <div className="relative w-[36%] h-[36%] rounded-full bg-[#efe7da] border-[3px] border-[#d6c9b4] overflow-hidden flex items-center justify-center">
                {hasTrack && currentTrack ? (
                  <img
                    src={getYouTubeThumbnail(currentTrack.youtubeId)}
                    alt={currentTrack.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-center leading-none px-2">
                    <div className="font-[var(--font-display)] text-xs font-extrabold tracking-widest text-[#2b1d14]">
                      LOOPY
                    </div>
                    <div className="text-[8px] font-mono text-[#6e5644] mt-1">
                      33⅓ RPM
                    </div>
                  </div>
                )}
                {/* Center Spindle */}
                <div className="absolute w-3 h-3 rounded-full bg-[#d4cbc0] border border-[#2b1d14]" />
              </div>
            </button>
          </div>

          {/* 45 RPM Adapter Puck */}
          <div
            aria-hidden="true"
            className="hidden sm:flex absolute top-4 right-16 w-7 h-7 rounded-full bg-[#12100f] border border-[#3a332d] items-center justify-center"
          >
            <div className="w-2 h-2 rounded-full bg-[#2a2521]" />
          </div>

          {/* Silver Straight Tonearm */}
          <div
            aria-hidden="true"
            className="absolute right-3 sm:right-4 top-4 w-12 h-56 sm:h-64 pointer-events-none origin-[26px_22px] transition-transform duration-500 ease-out"
            style={{
              transform: spinning ? 'rotate(20deg)' : 'rotate(-4deg)',
            }}
          >
            <svg viewBox="0 0 48 240" className="w-full h-full overflow-visible">
              {/* Tonearm Base */}
              <circle cx="26" cy="22" r="14" fill="#141210" stroke="#3d3630" strokeWidth="2" />
              <circle cx="26" cy="22" r="6" fill="#736a60" />
              {/* Straight Brushed Silver Arm */}
              <line
                x1="26"
                y1="26"
                x2="26"
                y2="188"
                stroke="#d4cec4"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              {/* Headshell */}
              <g transform="translate(21, 184) rotate(22)">
                <rect x="0" y="0" width="9" height="24" rx="1.5" fill="#181512" stroke="#9e9488" strokeWidth="1" />
                <circle cx="4.5" cy="20" r="1.5" fill={spinning ? '#c85a32' : '#736a60'} />
              </g>
            </svg>
          </div>
        </div>

        {/* Front Walnut Lip with Woven Cane Grille & Rotary Knob */}
        <div className="mt-3 flex items-center justify-between gap-4 px-1">
          <div className="cane-grille flex-1 h-5 rounded-sm border border-[#362012]" />
          <div
            className="w-5 h-5 rounded-full bg-[#c9c2b8] border-2 border-[#2b1d14] shrink-0"
            title={spinning ? 'Power ON' : 'Standby'}
          />
        </div>
      </div>
    </section>
  );
};
