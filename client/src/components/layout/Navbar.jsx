import React from 'react';
import { Sparkles, Sun, Moon, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useThemeStore } from '../../store/themeStore.js';

export const Navbar = ({ onQuickAdd }) => {
  const { user } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="md:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-white/90 dark:bg-surface-800/90 backdrop-blur-md border-b border-slate-200/80 dark:border-surface-700/80 select-none">
      {/* Brand */}
      <Link to="/dashboard" className="flex items-center space-x-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-text-primary">
            Habit<span className="text-indigo-600 dark:text-indigo-400">OS</span>
          </span>
        </div>
      </Link>

      {/* Right Actions: Theme Toggle + User Avatar */}
      <div className="flex items-center space-x-2">
        <button
          onClick={toggleTheme}
          className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-surface-700/80 text-slate-600 dark:text-text-secondary hover:text-slate-900 dark:hover:text-text-primary transition-colors"
          title="Toggle Theme"
          aria-label="Toggle dark/light theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500" />
          )}
        </button>

        <Link
          to="/settings"
          className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-sm"
          title="Profile settings"
        >
          {(user?.name || 'U')[0].toUpperCase()}
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
