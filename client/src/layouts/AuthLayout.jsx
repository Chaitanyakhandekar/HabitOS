import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles, Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../store/themeStore.js';

export const AuthLayout = () => {
  const { theme, setTheme } = useThemeStore();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 bg-slate-50 dark:bg-surface-900 transition-colors duration-200">
      {/* Theme Toggle Button Top Right */}
      <div className="fixed top-5 right-5">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 text-slate-600 dark:text-text-secondary hover:text-slate-900 dark:hover:text-text-primary shadow-sm transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500" />
          )}
        </button>
      </div>

      {/* Brand Header */}
      <div className="flex flex-col items-center mb-8 text-center">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-text-primary">
            Habit<span className="text-indigo-600 dark:text-indigo-400">OS</span>
          </span>
        </Link>
        <p className="text-xs text-slate-500 dark:text-text-muted mt-2 font-mono uppercase tracking-wider">
          Personal Habit Tracking & Behavioral Analytics
        </p>
      </div>

      {/* Form Container */}
      <div className="w-full max-w-md bg-white dark:bg-surface-800 border border-slate-200/80 dark:border-surface-700/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none animate-scale-in">
        <Outlet />
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-xs text-slate-400 dark:text-text-dim">
        HabitOS &bull; Zero fake metrics &bull; Strictly real behavioral analytics
      </div>
    </div>
  );
};

export default AuthLayout;
