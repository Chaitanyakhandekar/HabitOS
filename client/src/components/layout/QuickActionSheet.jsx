import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  CheckCircle2,
  BookMarked,
  Target,
  Trophy,
  ListTodo,
  Settings,
  X,
  Sparkles,
  Flame,
  CalendarDays,
} from 'lucide-react';
import { cn } from '../../utils/cn.js';

export const QuickActionSheet = ({
  isOpen,
  onClose,
  onOpenCreateHabit,
  onOpenLogModal,
}) => {
  const navigate = useNavigate();

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

  if (!isOpen) return null;

  const handleAction = (callback) => {
    onClose();
    if (callback) callback();
  };

  const navigateTo = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Content */}
      <div className="relative w-full bg-white dark:bg-surface-800 border-t border-warm-200/80 dark:border-surface-600 rounded-t-[32px] shadow-2xl z-10 max-h-[85vh] flex flex-col animate-slide-up pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {/* Grab Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-warm-300 dark:bg-surface-600" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-warm-100 dark:border-surface-700/60">
          <div>
            <h3 className="text-lg font-bold text-warm-900 dark:text-warm-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-coral animate-pulse" />
              Quick Actions
            </h3>
            <p className="text-xs text-warm-500 dark:text-warm-400">
              Create, log check-ins, or jump to any section
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full text-warm-400 hover:text-warm-700 dark:hover:text-warm-200 hover:bg-warm-100 dark:hover:bg-surface-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Grid */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Primary Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleAction(onOpenCreateHabit)}
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-peach-light to-peach/40 dark:from-surface-700 dark:to-surface-700/60 border border-coral/20 text-center hover:scale-[1.02] active:scale-95 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-coral text-white flex items-center justify-center shadow-md shadow-coral/30 mb-2 group-hover:scale-105 transition-transform">
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="font-bold text-sm text-warm-900 dark:text-warm-100">
                New Habit
              </span>
              <span className="text-[11px] text-warm-500 dark:text-warm-400 mt-0.5">
                Set routine & targets
              </span>
            </button>

            <button
              onClick={() => handleAction(onOpenLogModal)}
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-warm-50 dark:bg-surface-700/40 border border-warm-200/80 dark:border-surface-600 text-center hover:scale-[1.02] active:scale-95 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 mb-2 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="font-bold text-sm text-warm-900 dark:text-warm-100">
                Log Habit
              </span>
              <span className="text-[11px] text-warm-500 dark:text-warm-400 mt-0.5">
                Check-in today
              </span>
            </button>
          </div>

          {/* Secondary Quick Jump Items */}
          <div>
            <h4 className="text-[11px] font-bold text-warm-400 dark:text-warm-500 uppercase tracking-wider px-1 mb-2">
              Explore & Tools
            </h4>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => navigateTo('/habits')}
                className="flex items-center space-x-3 p-3 rounded-2xl bg-warm-100/70 dark:bg-surface-700/50 hover:bg-warm-100 dark:hover:bg-surface-700 text-left transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center">
                  <ListTodo className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="font-bold text-xs text-warm-900 dark:text-warm-100 block">
                    All Habits Management
                  </span>
                  <span className="text-[11px] text-warm-500 dark:text-warm-400">
                    Filter, pause, archive & inspect
                  </span>
                </div>
              </button>

              <button
                onClick={() => navigateTo('/journal')}
                className="flex items-center space-x-3 p-3 rounded-2xl bg-warm-100/70 dark:bg-surface-700/50 hover:bg-warm-100 dark:hover:bg-surface-700 text-left transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 flex items-center justify-center">
                  <BookMarked className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="font-bold text-xs text-warm-900 dark:text-warm-100 block">
                    Daily Reflection & Journal
                  </span>
                  <span className="text-[11px] text-warm-500 dark:text-warm-400">
                    Track mood, energy & notes
                  </span>
                </div>
              </button>

              <button
                onClick={() => navigateTo('/goals')}
                className="flex items-center space-x-3 p-3 rounded-2xl bg-warm-100/70 dark:bg-surface-700/50 hover:bg-warm-100 dark:hover:bg-surface-700 text-left transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="font-bold text-xs text-warm-900 dark:text-warm-100 block">
                    Goals & Milestones
                  </span>
                  <span className="text-[11px] text-warm-500 dark:text-warm-400">
                    Habit-linked target tracking
                  </span>
                </div>
              </button>

              <button
                onClick={() => navigateTo('/achievements')}
                className="flex items-center space-x-3 p-3 rounded-2xl bg-warm-100/70 dark:bg-surface-700/50 hover:bg-warm-100 dark:hover:bg-surface-700 text-left transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="font-bold text-xs text-warm-900 dark:text-warm-100 block">
                    Achievements & Badges
                  </span>
                  <span className="text-[11px] text-warm-500 dark:text-warm-400">
                    Milestones and consistency badges
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActionSheet;
