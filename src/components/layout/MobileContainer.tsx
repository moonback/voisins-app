import React from 'react';

export function MobileContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full justify-center bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_32%),linear-gradient(180deg,_#f8fbff_0%,_#eef2ff_48%,_#e2e8f0_100%)] px-0 sm:px-6">
      <div className="relative flex h-full w-full max-w-[480px] flex-col overflow-hidden bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)] sm:my-[3vh] sm:h-[94vh] sm:rounded-[42px] sm:border sm:border-white/70 sm:ring-1 sm:ring-slate-900/10">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 hidden h-24 bg-gradient-to-b from-white/55 to-transparent sm:block" />
        <div className="pointer-events-none absolute left-1/2 top-3 z-30 hidden h-1.5 w-24 -translate-x-1/2 rounded-full bg-slate-900/12 sm:block" />
        {children}
      </div>
    </div>
  );
}
