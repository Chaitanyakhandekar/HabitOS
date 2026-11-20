import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ListTodo,
  CalendarDays,
  Target,
  BookMarked,
  Trophy,
  LineChart,
  User,
  Settings,
  Bell,
  Download,
  LogOut,
  Moon,
  Sun,
  ChevronRight,
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  History,
  FileText,
  Grid,
} from 'lucide-react';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { useAuthStore } from '../store/authStore.js';
import { useThemeStore } from '../store/themeStore.js';
import authApi from '../services/auth.api.js';
import settingsApi from '../services/settings.api.js';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn.js';

export const MorePage = () => {
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

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleExportLogsCSV = async () => {
    try {
      const res = await settingsApi.exportLogs('csv');
      const blob = new Blob([res], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `habitos-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      toast.success('Logs CSV exported!');
    } catch {
      toast.error('Failed to export CSV');
    }
  };

  const handleExportJournalCSV = async () => {
    try {
      const res = await settingsApi.exportJournal('csv');
      const blob = new Blob([res], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `habitos-journal-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      toast.success('Journal CSV exported!');
    } catch {
      toast.error('Failed to export CSV');
    }
  };

  const sections = [
    {
      title: 'Tracking & Routines',
      items: [
        {
          name: 'All Habits',
          description: 'Manage active, paused, and archived habits',
          path: '/habits',
          icon: ListTodo,
          bg: 'bg-[#FFF0E8] text-[#FF6B4A]',
        },
        {
          name: 'Today’s Checklist',
          description: 'Day-by-day routine tracker & quick check-ins',
          path: '/today',
          icon: CheckCircle2,
          bg: 'bg-[#EBF8F2] text-[#10B981]',
        },
        {
          name: 'Habit Matrix & Heatmap',
          description: 'Annual activity density & consistency matrix',
          path: '/calendar?view=matrix',
          icon: Grid,
          bg: 'bg-[#F2EEFF] text-[#8B5CF6]',
        },
        {
          name: 'Monthly Calendar Grid',
          description: 'Month view with daily adherence intensity',
          path: '/calendar?view=calendar',
          icon: CalendarDays,
          bg: 'bg-[#FFF7E6] text-[#F59E0B]',
        },
      ],
    },
    {
      title: 'Personal Growth',
      items: [
        {
          name: 'Goals & Milestones',
          description: 'Habit-linked milestones, progress bars & deadlines',
          path: '/goals',
          icon: Target,
          bg: 'bg-[#E8F2FF] text-[#0284C7]',
        },
        {
          name: 'Daily Reflection & Journal',
          description: 'Log daily mood, energy, wins, and friction',
          path: '/journal?tab=daily',
          icon: BookMarked,
          bg: 'bg-[#FFF0F4] text-[#EC4899]',
        },
        {
          name: 'Timeline History',
          description: 'Browse and search past reflections & tags',
          path: '/journal?tab=history',
          icon: History,
          bg: 'bg-[#F3EFFC] text-[#7C3AED]',
        },
        {
          name: 'Automated Weekly Review',
          description: 'Behavioral summary of consistency & peak performance',
          path: '/journal?tab=review',
          icon: FileText,
          bg: 'bg-[#E6FAF7] text-[#06B6D4]',
        },
        {
          name: 'Achievements & Badges',
          description: 'Milestone badges for recovery, discipline & streaks',
          path: '/achievements',
          icon: Trophy,
          bg: 'bg-[#FFF8E7] text-[#D97706]',
        },
      ],
    },
    {
      title: 'Insights & Trends',
      items: [
        {
          name: 'Behavioral Analytics',
          description: 'Completion trends, weekday distribution & breakdown',
          path: '/analytics',
          icon: LineChart,
          bg: 'bg-[#FFF0E8] text-[#FF6B4A]',
        },
      ],
    },
    {
      title: 'Account & Preferences',
      items: [
        {
          name: 'Profile & Settings',
          description: 'Name, email, schedule timezone & password',
          path: '/settings',
          icon: User,
          bg: 'bg-[#E8F2FF] text-[#0284C7]',
        },
        {
          name: 'Reminders & Notifications',
          description: 'Daily reminder time and quiet hours configuration',
          path: '/settings',
          icon: Bell,
          bg: 'bg-[#FFF7E6] text-[#F59E0B]',
        },
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-warm-900 dark:text-warm-100">
          More Features
        </h1>
        <p className="text-xs text-warm-500 dark:text-warm-400 mt-1">
          Explore tracking matrixes, personal growth tools, and account settings.
        </p>
      </div>

      {/* User Card Profile Summary */}
      <div className="p-5 rounded-[26px] bg-white dark:bg-surface-800 border border-warm-200/80 dark:border-surface-700/60 shadow-[0_4px_20px_-2px_rgba(40,25,20,0.03)] flex items-center justify-between">
        <div className="flex items-center space-x-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF5A36] to-[#FF7A5C] text-white flex items-center justify-center font-extrabold text-base flex-shrink-0 shadow-md shadow-coral/30">
            {(user?.name || 'U')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="font-extrabold text-sm text-warm-900 dark:text-warm-100 truncate">
              {user?.name || 'HabitOS User'}
            </h2>
            <p className="text-xs text-warm-500 dark:text-warm-400 truncate">
              {user?.email}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="default" className="text-[10px]">
                {user?.timezone || 'UTC'}
              </Badge>
            </div>
          </div>
        </div>

        <Link
          to="/settings"
          className="p-2.5 rounded-full hover:bg-warm-100 dark:hover:bg-surface-700 text-warm-500 hover:text-coral transition-colors"
          title="Account Settings"
        >
          <Settings className="w-5 h-5" />
        </Link>
      </div>

      {/* Quick Theme Switcher Card */}
      <div className="p-4 rounded-[22px] bg-white dark:bg-surface-800 border border-warm-200/80 dark:border-surface-700/60 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-peach-light dark:bg-surface-700 text-coral flex items-center justify-center">
            {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </div>
          <div>
            <span className="font-bold text-xs text-warm-900 dark:text-warm-100 block">
              Appearance Theme
            </span>
            <span className="text-[11px] text-warm-500 dark:text-warm-400">
              Currently using {theme === 'dark' ? 'Dark' : 'Warm Light'} theme
            </span>
          </div>
        </div>
        <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded-full text-xs font-bold bg-warm-100 dark:bg-surface-700 text-warm-700 dark:text-warm-200 hover:bg-coral hover:text-white transition-all shadow-xs"
        >
          Switch to {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </div>

      {/* Structured Sections */}
      {sections.map((section, idx) => (
        <div key={idx} className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-warm-400 dark:text-warm-500 px-1">
            {section.title}
          </h3>

          <div className="space-y-2">
            {section.items.map((item, itemIdx) => {
              const IconComp = item.icon;
              return (
                <Link
                  key={itemIdx}
                  to={item.path}
                  className="p-4 rounded-[22px] bg-white dark:bg-surface-800 border border-warm-200/70 dark:border-surface-700/60 shadow-[0_2px_12px_rgba(40,25,20,0.02)] hover:border-coral/40 transition-all flex items-center justify-between group active:scale-[0.99] min-h-[54px]"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105',
                        item.bg
                      )}
                    >
                      <IconComp className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-sm text-warm-900 dark:text-warm-100 group-hover:text-coral transition-colors block">
                        {item.name}
                      </span>
                      <span className="text-[11px] text-warm-500 dark:text-warm-400 truncate block mt-0.5">
                        {item.description}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-warm-400 group-hover:text-coral transition-colors flex-shrink-0 ml-2" />
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      {/* Data Export Quick Action */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-warm-400 dark:text-warm-500 px-1">
          Data Portability
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={handleExportLogsCSV}
            className="p-4 rounded-[22px] bg-white dark:bg-surface-800 border border-warm-200/70 dark:border-surface-700/60 shadow-xs hover:border-coral/40 transition-all flex items-center space-x-3 text-left min-h-[54px] active:scale-[0.99]"
          >
            <div className="w-10 h-10 rounded-2xl bg-peach-light dark:bg-surface-700 text-coral flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-bold text-xs text-warm-900 dark:text-warm-100 block">
                Export Habit Logs
              </span>
              <span className="text-[11px] text-warm-500 dark:text-warm-400">
                Download CSV spreadsheet
              </span>
            </div>
          </button>

          <button
            onClick={handleExportJournalCSV}
            className="p-4 rounded-[22px] bg-white dark:bg-surface-800 border border-warm-200/70 dark:border-surface-700/60 shadow-xs hover:border-coral/40 transition-all flex items-center space-x-3 text-left min-h-[54px] active:scale-[0.99]"
          >
            <div className="w-10 h-10 rounded-2xl bg-peach-light dark:bg-surface-700 text-coral flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-bold text-xs text-warm-900 dark:text-warm-100 block">
                Export Journal
              </span>
              <span className="text-[11px] text-warm-500 dark:text-warm-400">
                Download reflections CSV
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Logout Row */}
      <div className="pt-2">
        <button
          onClick={handleLogout}
          className="w-full p-4 rounded-[22px] bg-red-50/60 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center space-x-2 hover:bg-red-100/60 transition-colors min-h-[50px] active:scale-[0.99]"
        >
          <LogOut className="w-4 h-4 stroke-[2.2]" />
          <span>Sign Out of HabitOS</span>
        </button>
      </div>
    </div>
  );
};

export default MorePage;
