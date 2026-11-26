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

          {/* High-Detail Articulated S-Shaped Tonearm */}
          <div
            aria-hidden="true"
            className="absolute right-3 sm:right-4 top-4 w-16 h-68 sm:h-76 pointer-events-none origin-[34px_30px] transition-transform duration-500 ease-out"
            style={{
              transform: spinning ? 'rotate(20deg)' : 'rotate(-4deg)',
            }}
          >
            <svg viewBox="0 0 64 280" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="armMetal" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8d877f" />
                  <stop offset="45%" stopColor="#e5e0d8" />
                  <stop offset="100%" stopColor="#6e6860" />
                </linearGradient>
                <linearGradient id="gimbalRing" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#46423d" />
                  <stop offset="100%" stopColor="#171513" />
                </linearGradient>
              </defs>

              {/* Main Gimbal Mounting Plate */}
              <circle cx="34" cy="30" r="20" fill="url(#gimbalRing)" stroke="#524d47" strokeWidth="1.5" />
              <circle cx="34" cy="30" r="14" fill="#1b1917" stroke="#3c3834" strokeWidth="1.2" />
              {/* Gimbal Yoke & Bearing Pivot */}
              <rect x="24" y="21" width="20" height="18" rx="3" fill="#2c2926" stroke="#666059" strokeWidth="1" />
              <circle cx="34" cy="30" r="5" fill="url(#armMetal)" stroke="#181614" strokeWidth="1" />
              <circle cx="34" cy="30" r="1.8" fill="#181614" />

              {/* Anti-Skate Dial */}
              <circle cx="52" cy="44" r="5.5" fill="#22201d" stroke="#5c564f" strokeWidth="1" />
              <line x1="52" y1="44" x2="55" y2="41" stroke="#c85a32" strokeWidth="1.2" strokeLinecap="round" />

              {/* Graduated Counterweight */}
              <rect x="25" y="1" width="18" height="14" rx="2.5" fill="url(#armMetal)" stroke="#2b2825" strokeWidth="1" />
              <line x1="25" y1="5" x2="43" y2="5" stroke="#3a3733" strokeWidth="1" />
              <line x1="25" y1="10" x2="43" y2="10" stroke="#3a3733" strokeWidth="1" />
              <rect x="31" y="15" width="6" height="6" fill="#4f4a44" />

              {/* S-Shaped Brushed Metal Arm Tube */}
              <path
                d="M 34 39 L 34 112 Q 34 148 22 172 L 15 198"
                fill="none"
                stroke="#181614"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M 34 39 L 34 112 Q 34 148 22 172 L 15 198"
                fill="none"
                stroke="url(#armMetal)"
                strokeWidth="5"
                strokeLinecap="round"
              />

              {/* Locking Collar */}
              <rect x="12.5" y="194" width="6" height="5" rx="1" transform="rotate(14 15.5 196.5)" fill="#7d776f" stroke="#22201d" strokeWidth="0.8" />

              {/* Detailed Slotted Headshell, Finger Lift & Cartridge */}
              <g transform="translate(10, 198) rotate(22)">
                {/* Finger Lift Hook */}
                <path d="M 10 6 Q 17 6 18 11" fill="none" stroke="#c7c1b7" strokeWidth="1.6" strokeLinecap="round" />
                {/* Headshell Body */}
                <rect x="0" y="0" width="11" height="26" rx="2" fill="#1e1c1a" stroke="#6b655e" strokeWidth="1" />
                {/* Weight-reduction slots */}
                <rect x="3" y="4" width="5" height="3" rx="0.8" fill="#0d0c0b" />
                <rect x="3" y="9" width="5" height="3" rx="0.8" fill="#0d0c0b" />
                {/* Cartridge + Stylus */}
                <rect x="1.5" y="15" width="8" height="10" rx="1" fill="#322e2a" stroke="#524d47" strokeWidth="0.8" />
                <circle cx="5.5" cy="23" r="1.6" fill={spinning ? '#e86b3a' : '#736a60'} />
              </g>
            </svg>
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
