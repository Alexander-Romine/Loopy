import React from 'react';

export const TopBar: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-800 bg-[#111114] sticky top-0 z-40">
      <h1 className="text-base font-semibold tracking-tight text-zinc-100 whitespace-nowrap">
        Loopy
      </h1>
    </header>
  );
};
