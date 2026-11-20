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

export const DesktopSidebar = ({ isCollapsed, toggleCollapsed }) => {
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
        { name: 'Profile & Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <aside
      className={cn(
        'hidden md:flex sticky top-0 left-0 z-30 h-screen flex-col bg-white dark:bg-surface-800 border-r border-warm-200/80 dark:border-surface-700 transition-all duration-300 ease-in-out select-none flex-shrink-0',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-18 px-5 border-b border-warm-100 dark:border-surface-700/80">
        <NavLink
          to="/dashboard"
          className="flex items-center space-x-3 overflow-hidden group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF5A36] to-[#FF7A5C] flex items-center justify-center text-white shadow-md shadow-coral/30 flex-shrink-0 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-warm-900 dark:text-warm-100">
                Habit<span className="text-coral">OS</span>
              </span>
              <span className="text-[10px] text-warm-500 dark:text-warm-400 font-medium tracking-wider uppercase">
                Habit Analytics
              </span>
            </div>
          )}
        </NavLink>

        <button
          onClick={toggleCollapsed}
          className="w-7 h-7 rounded-xl flex items-center justify-center text-warm-400 hover:text-warm-700 dark:hover:text-warm-200 hover:bg-warm-100 dark:hover:bg-surface-700 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold text-warm-400 dark:text-warm-500 tracking-wider uppercase">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-3.5 py-2.5 rounded-full text-xs font-semibold transition-all duration-150 group relative',
                      isActive
                        ? 'bg-peach-light dark:bg-coral-950/60 text-coral dark:text-coral-300 font-bold shadow-xs'
                        : 'text-warm-600 dark:text-warm-300 hover:bg-warm-100/70 dark:hover:bg-surface-700 hover:text-warm-900 dark:hover:text-warm-100',
                      isCollapsed && 'justify-center px-0'
                    )
                  }
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className={cn('w-4 h-4 flex-shrink-0 transition-colors', isCollapsed ? '' : 'mr-3')} />
                  {!isCollapsed && <span>{item.name}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Footer & Theme Toggle */}
      <div className="p-3 border-t border-warm-100 dark:border-surface-700/80 space-y-2">
        <button
          onClick={toggleTheme}
          className={cn(
            'w-full flex items-center px-3.5 py-2 rounded-full text-xs font-semibold text-warm-600 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-surface-700 transition-colors',
            isCollapsed && 'justify-center px-0'
          )}
          title="Toggle theme"
        >
          {theme === 'dark' ? (
            <>
              <Sun className={cn('w-4 h-4 text-amber-400 flex-shrink-0', !isCollapsed && 'mr-3')} />
              {!isCollapsed && <span>Light Theme</span>}
            </>
          ) : (
            <>
              <Moon className={cn('w-4 h-4 text-coral flex-shrink-0', !isCollapsed && 'mr-3')} />
              {!isCollapsed && <span>Dark Theme</span>}
            </>
          )}
        </button>

        <div
          className={cn(
            'flex items-center p-2 rounded-2xl bg-warm-50 dark:bg-surface-700/60 border border-warm-200/60 dark:border-surface-600',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}
        >
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF5A36] to-[#FF7A5C] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
              {(user?.name || 'U')[0].toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-warm-900 dark:text-warm-100 truncate">
                  {user?.name || 'User'}
                </span>
                <span className="text-[10px] text-warm-500 dark:text-warm-400 truncate">
                  {user?.email}
                </span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-xl text-warm-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
