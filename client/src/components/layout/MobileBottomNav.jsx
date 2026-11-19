import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  CalendarCheck,
  ListChecks,
  TrendingUp,
  Menu,
} from 'lucide-react';
import { cn } from '../../utils/cn.js';

export const MobileBottomNav = ({ onOpenMore, isMoreOpen }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Active checks with nested route matching
  const isHomeActive = currentPath === '/dashboard' || currentPath === '/';
  const isTodayActive = currentPath === '/today';
  const isHabitsActive = currentPath.startsWith('/habits');
  const isAnalyticsActive = currentPath.startsWith('/analytics');

  // Secondary routes that live under the More sheet
  const isSecondaryActive =
    currentPath.startsWith('/calendar') ||
    currentPath.startsWith('/goals') ||
    currentPath.startsWith('/journal') ||
    currentPath.startsWith('/achievements') ||
    currentPath.startsWith('/settings');

  const isMoreActive = isMoreOpen || isSecondaryActive;

  const navItems = [
    {
      name: 'Home',
      path: '/dashboard',
      icon: Home,
      isActive: isHomeActive,
      type: 'link',
    },
    {
      name: 'Today',
      path: '/today',
      icon: CalendarCheck,
      isActive: isTodayActive,
      type: 'link',
    },
    {
      name: 'Habits',
      path: '/habits',
      icon: ListChecks,
      isActive: isHabitsActive,
      type: 'link',
    },
    {
      name: 'Analytics',
      path: '/analytics',
      icon: TrendingUp,
      isActive: isAnalyticsActive,
      type: 'link',
    },
    {
      name: 'More',
      icon: Menu,
      isActive: isMoreActive,
      type: 'button',
      onClick: onOpenMore,
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-surface-800/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-surface-700/80 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-lg transition-colors select-none"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          if (item.type === 'button') {
            return (
              <button
                key={item.name}
                type="button"
                onClick={item.onClick}
                className={cn(
                  'flex-1 min-w-[54px] min-h-[48px] flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-200 active:scale-95 group relative focus:outline-none',
                  active
                    ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-500 dark:text-text-muted hover:text-slate-800 dark:hover:text-text-primary'
                )}
                aria-label="Open secondary navigation menu"
              >
                {/* Active Pill / Indicator */}
                <div
                  className={cn(
                    'w-9 h-7 rounded-xl flex items-center justify-center transition-all duration-200',
                    active
                      ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300'
                      : 'group-hover:bg-slate-100 dark:group-hover:bg-surface-700/50'
                  )}
                >
                  <Icon className="w-4 h-4 transition-transform group-hover:scale-105" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5 leading-none">
                  {item.name}
                </span>
                {isSecondaryActive && !isMoreOpen && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 absolute top-1 right-3" />
                )}
              </button>
            );
          }

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive: isLinkActive }) => {
                const isSelected = active || isLinkActive;
                return cn(
                  'flex-1 min-w-[54px] min-h-[48px] flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-200 active:scale-95 group relative focus:outline-none',
                  isSelected
                    ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-500 dark:text-text-muted hover:text-slate-800 dark:hover:text-text-primary'
                );
              }}
            >
              <div
                className={cn(
                  'w-9 h-7 rounded-xl flex items-center justify-center transition-all duration-200',
                  active
                    ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300'
                    : 'group-hover:bg-slate-100 dark:group-hover:bg-surface-700/50'
                )}
              >
                <Icon className="w-4 h-4 transition-transform group-hover:scale-105" />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 leading-none">
                {item.name}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
