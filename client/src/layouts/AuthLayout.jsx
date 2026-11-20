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
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 bg-warm-50 dark:bg-surface-900 transition-colors duration-200">
      {/* Theme Toggle Top Right */}
      <div className="fixed top-5 right-5">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-full bg-white dark:bg-surface-800 border border-warm-200/80 dark:border-surface-700 text-warm-600 dark:text-warm-300 hover:text-coral shadow-xs transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-coral" />
          )}
        </button>
      </div>

      {/* Brand Header */}
      <div className="flex flex-col items-center mb-8 text-center">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF5A36] to-[#FF7A5C] flex items-center justify-center text-white shadow-lg shadow-coral/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-warm-900 dark:text-warm-100">
            Habit<span className="text-coral">OS</span>
          </span>
        </Link>
        <p className="text-xs text-warm-500 dark:text-warm-400 mt-2 font-medium tracking-wide">
          Personal Habit Tracking & Behavioral Analytics
        </p>
      </div>

      {/* Form Container */}
      <div className="w-full max-w-md bg-white dark:bg-surface-800 border border-warm-200/80 dark:border-surface-700 rounded-[28px] p-7 sm:p-9 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-scale-in">
        <Outlet />
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-xs text-warm-400 dark:text-warm-500">
        HabitOS &bull; Zero fake metrics &bull; Real behavioral data
      </div>
    </div>
  );
};

export default AuthLayout;
