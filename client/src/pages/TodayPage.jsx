import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  Sparkles,
  Check,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { ProgressBar } from '../components/ui/ProgressBar.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import HabitLogModal from '../components/habits/HabitLogModal.jsx';
import HabitFormModal from '../components/habits/HabitFormModal.jsx';
import habitsApi from '../services/habits.api.js';
import logsApi from '../services/logs.api.js';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn.js';

export const TodayPage = () => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [logModalState, setLogModalState] = useState({
    isOpen: false,
    habit: null,
    log: null,
  });

  // Fetch scheduled habits for selectedDate
  const { data: todayData, isLoading } = useQuery({
    queryKey: ['todayHabits', selectedDate],
    queryFn: () => habitsApi.getToday({ date: selectedDate }),
  });

  // Fetch summary for selectedDate
  const { data: summaryData } = useQuery({
    queryKey: ['todaySummary', selectedDate],
    queryFn: () => habitsApi.getTodaySummary({ date: selectedDate }),
  });

  const habits = todayData?.data?.habits || [];
  const summary = summaryData?.data?.summary || {
    totalScheduled: 0,
    completed: 0,
    partial: 0,
    skipped: 0,
    remaining: 0,
    completionRate: 0,
    score: 0,
  };

  const handleDateShift = (days) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d + days));
    setSelectedDate(date.toISOString().slice(0, 10));
  };

  const isToday = selectedDate === new Date().toISOString().slice(0, 10);

  // Quick 1-click toggle mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ habit, isCompleted, existingLog }) => {
      if (isCompleted && existingLog) {
        await logsApi.delete(existingLog._id);
      } else {
        await logsApi.log({
          habitId: habit._id,
          localDate: selectedDate,
          status: 'completed',
          value: habit.target.value,
          completionType: 'full',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayHabits', selectedDate] });
      queryClient.invalidateQueries({ queryKey: ['todaySummary', selectedDate] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update check-in');
    },
  });

  return (
    <div className="space-y-6">
      {/* Date Navigation & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-text-primary">
              Daily Tracking
            </h1>
            {isToday && (
              <Badge variant="primary" className="text-[10px]">
                Today
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-text-muted mt-1">
            Scheduled commitments and progress for {selectedDate}.
          </p>
        </div>

        {/* Date Selector Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => handleDateShift(-1)}
              className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-text-primary hover:bg-slate-100 dark:hover:bg-surface-700 transition-colors"
              title="Previous day"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2 py-1 text-xs font-semibold bg-transparent text-slate-800 dark:text-text-primary border-none focus:outline-none cursor-pointer"
            />
            <button
              onClick={() => handleDateShift(1)}
              className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-text-primary hover:bg-slate-100 dark:hover:bg-surface-700 transition-colors"
              title="Next day"
              aria-label="Next day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {!isToday && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
            >
              Today
            </Button>
          )}

          <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Habit
          </Button>
        </div>
      </div>

      {/* Daily Progress Breakdown Card */}
      <Card className="bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/30 dark:from-surface-800 dark:via-surface-800 dark:to-surface-800">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400 dark:text-text-dim">
              Scheduled
            </span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-text-primary mt-0.5">
              {summary.totalScheduled}
            </div>
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase text-emerald-600 dark:text-emerald-400">
              Completed
            </span>
            <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {summary.completed}
            </div>
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase text-amber-500">
              Partial
            </span>
            <div className="text-xl font-extrabold text-amber-500 mt-0.5">
              {summary.partial}
            </div>
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase text-rose-500">
              Skipped
            </span>
            <div className="text-xl font-extrabold text-rose-500 mt-0.5">
              {summary.skipped}
            </div>
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase text-indigo-600 dark:text-indigo-400">
              Daily Score
            </span>
            <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
              {summary.score}%
            </div>
          </div>
        </div>

        <div className="mt-4">
          <ProgressBar value={summary.completionRate} size="md" />
        </div>
      </Card>

      {/* Habit List */}
      <Card>
        <CardHeader>
          <CardTitle>Habits Scheduled for {selectedDate}</CardTitle>
          <span className="text-xs text-slate-400 font-mono">
            {summary.completed} of {summary.totalScheduled} completed
          </span>
        </CardHeader>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
            Loading scheduled habits...
          </div>
        ) : habits.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No habits scheduled on this date"
            description="Habits are only shown on dates matching their frequency configuration."
            actionLabel="Create a Habit"
            onAction={() => setIsCreateModalOpen(true)}
          />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-surface-700/60">
            {habits.map(({ habit, log, isCompleted, isPartial, isSkipped, currentStreak }) => (
              <div
                key={habit._id}
                className="py-4 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-surface-700/30 rounded-xl transition-colors"
              >
                {/* Left: Checkmark & Habit Info */}
                <div className="flex items-start space-x-3.5 min-w-0">
                  <button
                    type="button"
                    onClick={() =>
                      toggleMutation.mutate({
                        habit,
                        isCompleted,
                        existingLog: log,
                      })
                    }
                    className={cn(
                      'w-7 h-7 rounded-xl flex items-center justify-center border transition-all mt-0.5',
                      isCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/25'
                        : 'border-slate-300 dark:border-surface-600 hover:border-indigo-500 bg-white dark:bg-surface-800'
                    )}
                  >
                    {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span
                        className={cn(
                          'text-base font-semibold tracking-tight truncate',
                          isCompleted
                            ? 'line-through text-slate-400 dark:text-text-dim'
                            : 'text-slate-900 dark:text-text-primary'
                        )}
                      >
                        {habit.name}
                      </span>
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: habit.color || '#6366f1' }}
                      />
                    </div>

                    {habit.description && (
                      <p className="text-xs text-slate-500 dark:text-text-muted mt-0.5 line-clamp-1">
                        {habit.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <Badge variant="default" className="text-[10px] py-0 px-1.5 uppercase font-mono">
                        {habit.category}
                      </Badge>

                      {habit.trackingType !== 'binary' && (
                        <span className="text-xs text-slate-600 dark:text-text-secondary">
                          Target: <span className="font-semibold">{habit.target.value} {habit.target.unit}</span>
                          {log && typeof log.value === 'number' && (
                            <span className="ml-1 text-indigo-600 dark:text-indigo-400 font-bold">
                              (Logged: {log.value} {habit.target.unit})
                            </span>
                          )}
                        </span>
                      )}

                      {habit.minimumVersion?.enabled && (
                        <span className="text-[11px] text-amber-500 font-medium">
                          Fallback: {habit.minimumVersion.targetValue} {habit.target.unit}
                        </span>
                      )}

                      {currentStreak > 0 && (
                        <span className="text-xs font-semibold text-amber-500 flex items-center">
                          <Flame className="w-3.5 h-3.5 mr-0.5" />
                          {currentStreak} day streak
                        </span>
                      )}
                    </div>

                    {log?.note && (
                      <p className="text-xs italic text-slate-500 dark:text-text-muted mt-1.5 bg-slate-100 dark:bg-surface-700/50 p-1.5 rounded-lg max-w-lg">
                        &ldquo;{log.note}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Status Badges and Detailed Log Button */}
                <div className="flex items-center space-x-2 self-end sm:self-center">
                  {isCompleted && (
                    <Badge variant="success" className="text-xs">
                      {log?.completionType === 'minimum' ? 'Minimum Met' : 'Completed'}
                    </Badge>
                  )}
                  {isPartial && (
                    <Badge variant="warning" className="text-xs">
                      Partial
                    </Badge>
                  )}
                  {isSkipped && (
                    <Badge variant="danger" className="text-xs">
                      Skipped
                    </Badge>
                  )}

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setLogModalState({
                        isOpen: true,
                        habit,
                        log,
                      })
                    }
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
                    Record Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modals */}
      <HabitLogModal
        isOpen={logModalState.isOpen}
        onClose={() => setLogModalState({ isOpen: false, habit: null, log: null })}
        habit={logModalState.habit}
        existingLog={logModalState.log}
        localDate={selectedDate}
      />

      <HabitFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        todayDateStr={selectedDate}
      />
    </div>
  );
};

export default TodayPage;
