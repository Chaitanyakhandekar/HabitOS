import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckCircle2,
  ListTodo,
  CalendarDays,
  LineChart,
  BookMarked,
  Target,
  Trophy,
  Settings,
  LogOut,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { useThemeStore } from '../../store/themeStore.js';
import authApi from '../../services/auth.api.js';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn.js';

export const Sidebar = ({ isCollapsed, toggleCollapsed, isMobileOpen, closeMobile }) => {
  const { user, clearUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      clearUser();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      clearUser();
      navigate('/login');
    }
  };

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'MY HABITS',
      items: [
        { name: "Today's Habits", path: '/today', icon: CheckCircle2 },
        { name: 'All Habits', path: '/habits', icon: ListTodo },
        { name: 'Calendar & Heatmap', path: '/calendar', icon: CalendarDays },
      ],
    },
    {
      title: 'INSIGHTS',
      items: [
        { name: 'Analytics', path: '/analytics', icon: LineChart },
        { name: 'Daily Journal', path: '/journal', icon: BookMarked },
        { name: 'Goals & Milestones', path: '/goals', icon: Target },
        { name: 'Achievements', path: '/achievements', icon: Trophy },
      ],
    },
    {
      title: 'PREFERENCES',
      items: [
        { name: 'Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 h-screen flex flex-col bg-white dark:bg-surface-800 border-r border-slate-200/80 dark:border-surface-700 transition-all duration-300 ease-in-out select-none',
          isCollapsed ? 'w-20' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100 dark:border-surface-700/80">
          <NavLink
            to="/dashboard"
            onClick={closeMobile}
            className="flex items-center space-x-3 overflow-hidden group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 flex-shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-text-primary">
                  Habit<span className="text-indigo-600 dark:text-indigo-400">OS</span>
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 dark:text-text-dim">
                  Personal Analytics
                </span>
              </div>
            )}
          </NavLink>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={toggleCollapsed}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-text-primary hover:bg-slate-100 dark:hover:bg-surface-700 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed ? (
                <div className="px-3 pb-1 text-[11px] font-bold font-mono tracking-wider text-slate-400 dark:text-text-dim">
                  {section.title}
                </div>
              ) : (
                <div className="h-2" />
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={closeMobile}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-all group relative',
                        isActive
                          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300 shadow-sm'
                          : 'text-slate-600 dark:text-text-secondary hover:text-slate-900 dark:hover:text-text-primary hover:bg-slate-100/80 dark:hover:bg-surface-700/60',
                        isCollapsed && 'justify-center'
                      )
                    }
                    title={isCollapsed ? item.name : undefined}
                  >
                    <Icon className={cn('w-4 h-4 flex-shrink-0', !isCollapsed && 'mr-3')} />
                    {!isCollapsed && <span>{item.name}</span>}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom User & Theme Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-surface-700/80 space-y-2">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={cn(
              'w-full flex items-center px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-text-secondary hover:bg-slate-100 dark:hover:bg-surface-700 transition-colors',
              isCollapsed && 'justify-center'
            )}
            title="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 flex-shrink-0" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            )}
            {!isCollapsed && (
              <span className="ml-3 capitalize">{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
            )}
          </button>

          {/* User Profile Info & Logout */}
          <div
            className={cn(
              'flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-surface-700/50 border border-slate-200/60 dark:border-surface-600/60',
              isCollapsed && 'justify-center'
            )}
          >
            <div className={cn('flex items-center space-x-2.5 overflow-hidden', isCollapsed && 'hidden')}>
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                {(user?.name || 'User')[0].toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-900 dark:text-text-primary truncate">
                  {user?.name || 'Account'}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-text-muted truncate">
                  {user?.email || ''}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
