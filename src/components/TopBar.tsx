import React from 'react';

export const TopBar: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-purple-900/25 bg-[#0d091a]/80 backdrop-blur-xl sticky top-0 z-40 shadow-[0_4px_24px_rgba(10,5,20,0.5)]">
      {/* Clean Brand Wordmark */}
      <span className="text-base font-bold tracking-tight text-purple-100 whitespace-nowrap">
        Loopy
      </span>
    </header>
  );
};
