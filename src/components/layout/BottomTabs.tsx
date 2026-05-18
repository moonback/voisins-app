import { Home, Search, MessageCircle, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function BottomTabs() {
  const tabs = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'Inbox', path: '/inbox', icon: MessageCircle },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="absolute bottom-0 w-full z-50 border-t border-slate-200 bg-white/90 pb-safe pt-2 backdrop-blur-lg">
      <div className="flex justify-around items-center px-2 pb-6 pt-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.name}
            to={tab.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center space-y-1 w-16",
                isActive ? "text-blue-600" : "text-slate-400"
              )
            }
          >
            {({ isActive }) => (
              <>
                <tab.icon className={cn("h-6 w-6", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                <span className="text-[10px] font-medium">{tab.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
