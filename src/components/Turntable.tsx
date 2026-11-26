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
      className="relative flex flex-col items-center justify-center w-full h-full py-2 sm:py-4 select-none"
    >
      {/* Open Hinged Acrylic Dust Cover Lip */}
      <div
        aria-hidden="true"
        className="w-[min(480px,90vw)] h-7 rounded-t-lg border border-b-0 border-[#f3ece0]/25 bg-[#f3ece0]/[0.08] flex items-end justify-between px-8 pb-0.5"
      >
        <span className="w-7 h-2 rounded-t bg-[#75614e] border border-[#2b1d14]" />
        <span className="w-7 h-2 rounded-t bg-[#75614e] border border-[#2b1d14]" />
      </div>

      {/* Walnut Turntable Plinth */}
      <div className="relative w-[min(500px,94vw)] rounded-xl walnut-grain border-2 border-[#6a4229] p-4 sm:p-5 shadow-[0_18px_36px_rgba(0,0,0,0.5)]">
        {/* Matte Charcoal Top Deck */}
        <div className="relative rounded-lg bg-[#1d1a18] border border-[#332d28] p-4 sm:p-5 flex items-center justify-center">
          {/* Oversized Spinning Vinyl Platter */}
          <div className="relative w-[min(370px,72vw)] h-[min(370px,72vw)] rounded-full bg-[#110f0e] border-4 border-[#2e2924] flex items-center justify-center">
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
                  'repeating-radial-gradient(circle at center, #141210 0px, #141210 2px, #231f1b 4px, #0f0d0c 6px)',
              }}
            >
              {/* Warm Cream Center Label */}
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

          {/* Pitch / Speed Markings */}
          <div
            aria-hidden="true"
            className="hidden sm:flex absolute bottom-4 left-4 items-center gap-2 text-[9px] font-mono text-[#7a7066]"
          >
            <span className="w-2 h-2 rounded-full bg-[#c85a32]" style={{ opacity: spinning ? 1 : 0.35 }} />
            <span>33 / 45</span>
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
              <circle cx="26" cy="22" r="14" fill="#141210" stroke="#3d3630" strokeWidth="2" />
              <circle cx="26" cy="22" r="6" fill="#736a60" />
              <line
                x1="26"
                y1="26"
                x2="26"
                y2="188"
                stroke="#d4cec4"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
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

      {/* Tabletop Espresso Mug & Cork Coaster */}
      <div
        aria-hidden="true"
        className="hidden sm:flex items-center gap-4 mt-3 w-[min(500px,94vw)] justify-between px-2"
      >
        <div className="flex items-center gap-2.5">
          {/* Ceramic Mug on Cork Coaster */}
          <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-[#8c6239] border border-[#5c3923]">
            <div className="w-8 h-8 rounded-full bg-[#efe7da] border-2 border-[#d6c9b4] flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-[#3b2113]" />
            </div>
            {/* Handle */}
            <div className="absolute -right-1.5 w-2.5 h-3.5 rounded-r-full border-2 border-l-0 border-[#efe7da]" />
            {/* Subtle Steam Wisps */}
            <svg
              viewBox="0 0 24 16"
              className="absolute -top-3.5 left-1.5 w-6 h-4 text-[#f3ece0]/60 animate-steam"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M7 14 Q5 9 8 4" />
              <path d="M14 14 Q12 8 15 3" />
            </svg>
          </div>
          <span className="text-[11px] font-mono text-[#e2d3be]/80 tracking-wide">
            House Roast · Vinyl Booth 01
          </span>
        </div>

        <span className="text-[10px] font-mono uppercase tracking-widest text-[#e2d3be]/70 bg-[#24160f]/80 border border-[#5c3923] px-2.5 py-1 rounded">
          {spinning ? 'Now Spinning' : 'Click Platter'}
        </span>
      </div>
    </section>
  );
};
