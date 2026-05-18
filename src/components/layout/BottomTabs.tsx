import { Home, Search, MessageCircle, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function BottomTabs() {
  const tabs = [
    { name: 'Accueil', path: '/', icon: Home },
    { name: 'Recherche', path: '/search', icon: Search },
    { name: 'Messages', path: '/inbox', icon: MessageCircle },
    { name: 'Profil', path: '/profile', icon: User },
  ];

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-50 px-4 pb-safe">
      <div className="pointer-events-auto rounded-[28px] border border-white/80 bg-white/88 px-2 py-2 shadow-[0_18px_44px_rgba(15,23,42,0.16)] backdrop-blur-xl ring-1 ring-slate-900/5">
        <div className="flex items-center justify-around gap-1">
        {tabs.map((tab) => (
          <NavLink
            key={tab.name}
            to={tab.path}
            className={({ isActive }) =>
              cn(
                "flex min-w-0 flex-1 flex-col items-center justify-center rounded-2xl px-2 py-2.5 transition-all",
                isActive
                  ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100"
                  : "text-slate-400 hover:bg-slate-50"
              )
            }
          >
            {({ isActive }) => (
              <>
                <tab.icon className={cn("h-5 w-5", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                <span className={cn("mt-1 text-[10px] font-semibold leading-none", isActive ? "text-blue-700" : "text-slate-500")}>
                  {tab.name}
                </span>
              </>
            )}
          </NavLink>
        ))}
        </div>
      </div>
    </div>
  );
}
