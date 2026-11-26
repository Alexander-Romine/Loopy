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
      {/* Open Hinged Acrylic Dust Cover with Brushed-Steel Spring Hinges */}
      <div
        aria-hidden="true"
        className="w-[min(540px,90vw)] h-8 rounded-t-lg border border-b-0 border-white/20 bg-gradient-to-b from-white/[0.12] to-white/[0.03] flex items-end justify-between px-10 pb-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            className="w-9 h-3 rounded-t-sm bg-gradient-to-b from-[#4c4844] via-[#2c2926] to-[#1a1816] border border-[#0e0d0c] flex items-center justify-around px-1"
          >
            <span className="w-1 h-1 rounded-full bg-[#8d867e]" />
            <span className="w-1 h-1 rounded-full bg-[#8d867e]" />
          </div>
        ))}
      </div>

      {/* Walnut & Gunmetal Turntable Plinth */}
      <div className="relative w-[min(560px,94vw)] rounded-xl walnut-grain border border-[#3a2213] p-4 sm:p-5 shadow-[0_24px_50px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.14)]">
        {/* Matte Anodized Charcoal Top Plate */}
        <div className="relative rounded-lg bg-[#161514] border border-[#2c2926] p-4 sm:p-6 flex items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]">
          {/* Machined Aluminum Platter Rim */}
          <div className="relative w-[min(430px,78vw)] h-[min(430px,78vw)] rounded-full bg-[#0d0c0b] border-[5px] border-[#33302c] shadow-[0_8px_24px_rgba(0,0,0,0.8),inset_0_0_12px_rgba(0,0,0,0.9)] flex items-center justify-center">
            {/* Subtle Machined Platter Chamfer */}
            <div className="w-[97%] h-[97%] rounded-full border border-white/[0.08] flex items-center justify-center">
              {/* Keep animate-vinyl mounted whenever a track is loaded so pausing freezes the exact angle */}
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
                  hasTrack ? 'animate-vinyl cursor-pointer' : 'cursor-default'
                }`}
                style={{
                  animationPlayState: spinning ? 'running' : 'paused',
                  background:
                    'repeating-radial-gradient(circle at center, #11100f 0px, #11100f 2px, #1d1b19 3.5px, #0b0a09 5.5px)',
                }}
              >
                {/* Vinyl Specular Light Reflection */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none opacity-30"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, transparent 38%, transparent 62%, rgba(255,255,255,0.12) 100%)',
                  }}
                />

                {/* Deadwax / Run-out Groove Ring */}
                <div className="absolute w-[42%] h-[42%] rounded-full border border-white/[0.08] bg-[#0e0d0c]/65 pointer-events-none" />

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
                  <div className="absolute w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#ece8e1] to-[#6e6860] border border-[#1f1c19] shadow" />
                </div>
              </button>
            </div>
          </div>

          {/* Detailed 45 RPM Machined Aluminum Adapter Puck */}
          <div
            aria-hidden="true"
            className="hidden sm:flex absolute top-4 right-16 w-8 h-8 rounded-full bg-[#141210] border border-[#3a3632] shadow-inner items-center justify-center"
          >
            <svg viewBox="0 0 32 32" className="w-6 h-6">
              <circle cx="16" cy="16" r="13" fill="#2b2825" stroke="#5c564f" strokeWidth="1" />
              <circle cx="16" cy="16" r="4.5" fill="#11100f" stroke="#5c564f" strokeWidth="0.8" />
              <path d="M16 3 L18 11.5 M27.5 22.5 L19.8 18.2 M4.5 22.5 L12.2 18.2" stroke="#141210" strokeWidth="2" />
            </svg>
          </div>

          {/* Tonearm Rest Post */}
          <div
            aria-hidden="true"
            className="hidden sm:flex absolute right-10 top-36 w-3.5 h-3.5 rounded-full bg-[#2b2825] border border-[#4a4540] items-center justify-center"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#11100f]" />
          </div>

          {/* Real Photorealistic Turntable Tonearm */}
          <div
            aria-hidden="true"
            className="absolute right-2 sm:right-3 top-3 w-[74px] sm:w-[86px] pointer-events-none origin-[55%_15%] transition-transform duration-500 ease-out"
            style={{
              transform: spinning ? 'rotate(20deg)' : 'rotate(-4deg)',
            }}
          >
            <img
              src="/tonearm.png"
              alt=""
              decoding="async"
              className="w-full h-auto block select-none"
            />
          </div>
        </div>

        {/* Front Walnut Lip with Dark Charcoal Mesh Speaker Grille & Knurled Knob */}
        <div className="mt-3 flex items-center justify-between gap-4 px-1">
          <div className="cane-grille flex-1 h-5 rounded-sm border border-[#0b0a09] shadow-[inset_0_2px_5px_rgba(0,0,0,0.85)]" />
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#4f4b46] to-[#171513] border-2 border-[#0c0b0a] shadow flex items-center justify-center shrink-0">
            <span className="w-0.5 h-2.5 bg-[#b8b1a7] rounded-full -translate-y-0.5" />
          </div>
        </div>
      </div>
    </section>
  );
};
