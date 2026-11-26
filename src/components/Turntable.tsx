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
      className="relative flex flex-col items-center justify-center w-full h-full py-2 select-none"
    >
      {/* Open Hinged Acrylic Dust Cover */}
      <div
        aria-hidden="true"
        className="w-[min(540px,90vw)] h-8 rounded-t-lg border border-b-0 border-white/20 bg-gradient-to-b from-white/[0.12] to-white/[0.03] flex items-end justify-between px-10 pb-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
      >
        <span className="w-8 h-2.5 rounded-t-sm bg-gradient-to-b from-[#3d3a37] to-[#1f1d1b] border border-[#0e0d0c]" />
        <span className="w-8 h-2.5 rounded-t-sm bg-gradient-to-b from-[#3d3a37] to-[#1f1d1b] border border-[#0e0d0c]" />
      </div>

      {/* Realistic Walnut & Gunmetal Turntable Plinth */}
      <div className="relative w-[min(560px,94vw)] rounded-xl walnut-grain border border-[#3a2213] p-4 sm:p-5 shadow-[0_24px_50px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.14)]">
        {/* Matte Anodized Charcoal Top Plate */}
        <div className="relative rounded-lg bg-[#161514] border border-[#2c2926] p-4 sm:p-6 flex items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]">
          {/* Machined Aluminum Platter Rim */}
          <div className="relative w-[min(430px,78vw)] h-[min(430px,78vw)] rounded-full bg-[#0d0c0b] border-[5px] border-[#2f2d2a] shadow-[0_8px_24px_rgba(0,0,0,0.8),inset_0_0_12px_rgba(0,0,0,0.9)] flex items-center justify-center">
            {/* Rubber Slipmat Edge */}
            <div className="w-[96%] h-[96%] rounded-full border border-white/[0.06] flex items-center justify-center">
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
                className={`relative w-[97%] h-[97%] rounded-full flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c85a32] ${
                  spinning ? 'animate-vinyl' : ''
                } ${
                  hasTrack ? 'cursor-pointer' : 'cursor-default'
                }`}
                style={{
                  background:
                    'repeating-radial-gradient(circle at center, #11100f 0px, #11100f 2px, #1d1b19 3.5px, #0b0a09 5.5px)',
                }}
              >
                {/* Realistic Vinyl Light Reflection */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none opacity-30"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, transparent 38%, transparent 62%, rgba(255,255,255,0.12) 100%)',
                  }}
                />

                {/* Deadwax / Run-out Groove Ring */}
                <div className="absolute w-[42%] h-[42%] rounded-full border border-white/[0.07] bg-[#0e0d0c]/60 pointer-events-none" />

                {/* Center Record Label */}
                <div className="relative w-[33%] h-[33%] rounded-full bg-[#e9e1d3] border-[3px] border-[#cbc0ae] overflow-hidden flex items-center justify-center shadow-[inset_0_1px_4px_rgba(0,0,0,0.35)]">
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
                    <div className="w-[76%] h-[76%] rounded-full border border-[#bfb29d]" />
                  )}
                  {/* Machined Steel Center Spindle */}
                  <div className="absolute w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#e2ded7] to-[#7d776f] border border-[#1f1c19] shadow" />
                </div>
              </button>
            </div>
          </div>

          {/* 45 RPM Adapter Puck */}
          <div
            aria-hidden="true"
            className="hidden sm:flex absolute top-4 right-16 w-7 h-7 rounded-full bg-[#1a1816] border border-[#3a3632] shadow-inner items-center justify-center"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#0c0b0a] border border-[#2a2724]" />
          </div>

          {/* Articulated Brushed-Steel Tonearm */}
          <div
            aria-hidden="true"
            className="absolute right-3 sm:right-4 top-4 w-12 h-64 sm:h-72 pointer-events-none origin-[26px_22px] transition-transform duration-500 ease-out"
            style={{
              transform: spinning ? 'rotate(20deg)' : 'rotate(-4deg)',
            }}
          >
            <svg viewBox="0 0 48 260" className="w-full h-full overflow-visible">
              {/* Gimbal Housing */}
              <circle cx="26" cy="22" r="15" fill="#181614" stroke="#3c3834" strokeWidth="2" />
              <circle cx="26" cy="22" r="8" fill="#2b2825" stroke="#57524c" strokeWidth="1" />
              <circle cx="26" cy="22" r="3" fill="#9e9890" />
              {/* Counterweight */}
              <rect x="19" y="2" width="14" height="10" rx="2" fill="#3a3733" stroke="#6b655e" strokeWidth="1" />
              {/* Brushed Metal Arm Tube */}
              <line
                x1="26"
                y1="26"
                x2="26"
                y2="205"
                stroke="#b8b2a8"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              {/* Headshell & Cartridge */}
              <g transform="translate(21, 201) rotate(22)">
                <rect x="0" y="0" width="9" height="24" rx="1.5" fill="#161412" stroke="#6b655e" strokeWidth="1" />
                <circle cx="4.5" cy="20" r="1.5" fill={spinning ? '#d96b3b' : '#57524c'} />
              </g>
            </svg>
          </div>
        </div>

        {/* Front Walnut Lip with Dark Charcoal Mesh Speaker Grille & Knurled Knob */}
        <div className="mt-3 flex items-center justify-between gap-4 px-1">
          <div className="cane-grille flex-1 h-5 rounded-sm border border-[#0b0a09] shadow-[inset_0_2px_5px_rgba(0,0,0,0.85)]" />
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#474440] to-[#1a1816] border border-[#0c0b0a] shadow flex items-center justify-center shrink-0">
            <span className="w-0.5 h-2 bg-[#9e9890] rounded-full -translate-y-0.5" />
          </div>
        </div>
      </div>
    </section>
  );
};
