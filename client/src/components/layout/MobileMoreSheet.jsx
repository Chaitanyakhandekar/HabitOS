import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Target,
  BookMarked,
  Trophy,
  Settings,
  LogOut,
  Moon,
  Sun,
  X,
  ChevronRight,
  User,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { useThemeStore } from '../../store/themeStore.js';
import authApi from '../../services/auth.api.js';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn.js';

export const MobileMoreSheet = ({ isOpen, onClose }) => {
  const { user, clearUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const navigate = useNavigate();

  // Close on Escape key and prevent background body scrolling when open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      clearUser();
      toast.success('Logged out successfully');
      onClose();
      navigate('/login');
    } catch {
      clearUser();
      onClose();
      navigate('/login');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!isOpen) return null;

  const moreNavItems = [
    {
      name: 'Calendar & Heatmap',
      description: 'Activity heatmap, month matrices & historical drilldown',
      path: '/calendar',
      icon: CalendarDays,
      badge: 'Heatmap',
    },
    {
      name: 'Daily Journal',
      description: 'Reflections, energy tracking & automated weekly review',
      path: '/journal',
      icon: BookMarked,
      badge: 'Review',
    },
    {
      name: 'Goals & Milestones',
      description: 'Habit-linked targets, progress bars & deadlines',
      path: '/goals',
      icon: Target,
    },
    {
      name: 'Achievements',
      description: 'Streak, consistency & recovery milestone badges',
      path: '/achievements',
      icon: Trophy,
    },
    {
      name: 'Settings & Data Export',
      description: 'Profile, timezone, password & CSV log export',
      path: '/settings',
      icon: Settings,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet Drawer */}
      <div className="relative w-full max-h-[85vh] bg-white dark:bg-surface-800 border-t border-slate-200 dark:border-surface-600 rounded-t-3xl shadow-2xl flex flex-col z-10 animate-slide-up overflow-hidden pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {/* Grab Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-surface-600" />
        </div>

        {/* Header with Title and Close Button */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-surface-700/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {(user?.name || 'U')[0].toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-text-primary">
                {user?.name || 'Account'}
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-text-muted truncate max-w-[200px]">
                {user?.email || 'Logged in user'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-text-primary hover:bg-slate-100 dark:hover:bg-surface-700 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
          <div className="px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-text-dim">
            Explore & Tools
          </div>

          {moreNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'min-h-[50px] flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all',
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 shadow-sm'
                      : 'text-slate-700 dark:text-text-secondary hover:bg-slate-100 dark:hover:bg-surface-700/60 active:scale-[0.99]'
                  )
                }
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-surface-700 flex items-center justify-center text-slate-600 dark:text-text-secondary flex-shrink-0">
                    <Icon className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-text-primary truncate">
                        {item.name}
                      </span>
                      {item.badge && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono uppercase bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-text-muted truncate">
                      {item.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
              </NavLink>
            );
          })}
        </div>

        {/* Footer Actions: Theme Toggle & Logout */}
        <div className="p-4 pt-2 border-t border-slate-100 dark:border-surface-700/80 space-y-2">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-full min-h-[44px] flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-surface-700/50 border border-slate-200/60 dark:border-surface-600/60 text-xs font-semibold text-slate-700 dark:text-text-secondary hover:bg-slate-100 dark:hover:bg-surface-700 transition-colors"
          >
            <div className="flex items-center space-x-2.5">
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
              <span>Appearance</span>
            </div>
            <span className="text-[11px] font-mono uppercase text-slate-400">
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </span>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full min-h-[44px] flex items-center justify-center px-4 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileMoreSheet;
