import React from 'react';

export function MobileContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full justify-center bg-slate-100 sm:bg-slate-200">
      <div className="relative flex h-full w-full max-w-[480px] flex-col overflow-hidden bg-white shadow-2xl sm:h-[85vh] sm:mt-[7.5vh] sm:rounded-[40px] sm:border-[8px] sm:border-slate-900">
        {children}
      </div>
    </div>
  );
}
