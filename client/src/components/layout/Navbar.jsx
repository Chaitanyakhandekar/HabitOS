import React from 'react';
import { Sun, Moon, Sparkles, SlidersHorizontal, Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useThemeStore } from '../../store/themeStore.js';

export const Navbar = ({ onQuickAdd }) => {
  const { user } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const location = useLocation();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return "Today's Habits";
    if (path.startsWith('/today')) return "Today's Routine";
    if (path.startsWith('/calendar')) return "Calendar";
    if (path.startsWith('/analytics')) return "Analytics";
    if (path.startsWith('/habits')) return "All Habits";
    if (path.startsWith('/journal')) return "Journal & Review";
    if (path.startsWith('/goals')) return "Goals";
    if (path.startsWith('/achievements')) return "Achievements";
    if (path.startsWith('/settings')) return "Profile & Settings";
    if (path.startsWith('/more')) return "More";
    return "HabitOS";
  };

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="md:hidden sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-warm-50/90 dark:bg-surface-900/90 backdrop-blur-md border-b border-warm-200/60 dark:border-surface-700/60 select-none">
      {/* Left: Date + Page Title */}
      <div className="flex items-center space-x-3">
        <Link
          to="/dashboard"
          className="w-9 h-9 rounded-2xl bg-peach-light dark:bg-surface-700 text-coral flex items-center justify-center shadow-xs"
          title="Overview"
        >
          <SlidersHorizontal className="w-4 h-4 stroke-[2.2]" />
        </Link>
        <div className="flex flex-col">
          <span className="text-[11px] font-medium text-warm-500 dark:text-warm-400 leading-tight">
            {todayFormatted}
          </span>
          <h1 className="font-extrabold text-base tracking-tight text-warm-900 dark:text-warm-100 leading-snug">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right Actions: Theme Toggle + User Avatar */}
      <div className="flex items-center space-x-2">
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-2xl bg-white dark:bg-surface-800 text-warm-600 dark:text-warm-300 hover:text-coral transition-colors shadow-xs border border-warm-200/60 dark:border-surface-700"
          title="Toggle Theme"
          aria-label="Toggle dark/light theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-coral" />
          )}
        </button>

        <Link
          to="/settings"
          className="w-9 h-9 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-[#FF5A36] to-[#FF7A5C] text-white font-bold text-xs shadow-sm shadow-coral/30 hover:scale-105 active:scale-95 transition-all"
          title="Profile settings"
        >
          {(user?.name || 'U')[0].toUpperCase()}
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
