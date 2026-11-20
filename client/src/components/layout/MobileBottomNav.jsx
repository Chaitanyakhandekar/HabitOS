import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Calendar,
  Plus,
  BarChart2,
  User,
} from 'lucide-react';
import { cn } from '../../utils/cn.js';

export const MobileBottomNav = ({ onOpenQuickAction }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isHomeActive = currentPath === '/dashboard' || currentPath === '/' || currentPath === '/today';
  const isCalendarActive = currentPath.startsWith('/calendar');
  const isAnalyticsActive = currentPath.startsWith('/analytics');
  const isProfileActive = currentPath.startsWith('/settings');

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-surface-800/95 backdrop-blur-xl border-t border-warm-200/70 dark:border-surface-700/80 px-2 pt-1 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_-4px_25px_rgba(0,0,0,0.06)] select-none"
    >
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {/* 1. Home */}
        <NavLink
          to="/dashboard"
          className={cn(
            'flex-1 min-w-[50px] min-h-[46px] flex flex-col items-center justify-center py-1 rounded-2xl transition-all duration-200 active:scale-95 focus:outline-none',
            isHomeActive
              ? 'text-coral font-bold'
              : 'text-warm-400 dark:text-warm-500 hover:text-warm-700 dark:hover:text-warm-300'
          )}
          aria-label="Home"
        >
          <Home className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] mt-1 tracking-tight">Home</span>
        </NavLink>

        {/* 2. Calendar */}
        <NavLink
          to="/calendar"
          className={cn(
            'flex-1 min-w-[50px] min-h-[46px] flex flex-col items-center justify-center py-1 rounded-2xl transition-all duration-200 active:scale-95 focus:outline-none',
            isCalendarActive
              ? 'text-coral font-bold'
              : 'text-warm-400 dark:text-warm-500 hover:text-warm-700 dark:hover:text-warm-300'
          )}
          aria-label="Calendar"
        >
          <Calendar className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] mt-1 tracking-tight">Calendar</span>
        </NavLink>

        {/* 3. Center + Action */}
        <div className="flex-1 flex justify-center items-center">
          <button
            type="button"
            onClick={onOpenQuickAction}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF5A36] to-[#FF7A5C] text-white shadow-lg shadow-coral/40 flex items-center justify-center -translate-y-3 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-coral/25"
            aria-label="Quick Actions"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* 4. Analytics */}
        <NavLink
          to="/analytics"
          className={cn(
            'flex-1 min-w-[50px] min-h-[46px] flex flex-col items-center justify-center py-1 rounded-2xl transition-all duration-200 active:scale-95 focus:outline-none',
            isAnalyticsActive
              ? 'text-coral font-bold'
              : 'text-warm-400 dark:text-warm-500 hover:text-warm-700 dark:hover:text-warm-300'
          )}
          aria-label="Analytics"
        >
          <BarChart2 className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] mt-1 tracking-tight">Analytics</span>
        </NavLink>

        {/* 5. Profile */}
        <NavLink
          to="/settings"
          className={cn(
            'flex-1 min-w-[50px] min-h-[46px] flex flex-col items-center justify-center py-1 rounded-2xl transition-all duration-200 active:scale-95 focus:outline-none',
            isProfileActive
              ? 'text-coral font-bold'
              : 'text-warm-400 dark:text-warm-500 hover:text-warm-700 dark:hover:text-warm-300'
          )}
          aria-label="Profile"
        >
          <User className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] mt-1 tracking-tight">Profile</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
