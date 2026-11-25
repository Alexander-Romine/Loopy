import React from 'react';
import { Disc3 } from 'lucide-react';

export const TopBar: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-[#2c2722] bg-[#1a1714] sticky top-0 z-40">
      <div className="flex items-center gap-2.5">
        <Disc3 className="w-4 h-4 text-[#e07a38]" />
        <h1 className="text-base font-semibold tracking-tight text-[#f3ede2] whitespace-nowrap">
          Loopy
        </h1>
        <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-widest text-[#9e9488] border border-[#2c2722] bg-[#141210] px-2 py-0.5 rounded">
          Analog Loop Deck
        </span>
      </div>

      <div className="hidden md:flex items-center gap-3 text-[11px] font-mono text-[#9e9488]">
        <span><kbd className="text-[#f3ede2]">Space</kbd> Play</span>
        <span>·</span>
        <span><kbd className="text-[#f3ede2]">L</kbd> Loop</span>
        <span>·</span>
        <span><kbd className="text-[#f3ede2]">V</kbd> Turntable</span>
      </div>
    </header>
  );
};
