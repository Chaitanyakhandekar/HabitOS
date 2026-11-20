import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Check,
  Plus,
  Heart,
  Music,
  BookOpen,
  Footprints,
  Moon,
  Palette,
  Bike,
  Droplets,
  Dumbbell,
  Code2,
  Coffee,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { CircularProgress } from '../components/ui/CircularProgress.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import HabitLogModal from '../components/habits/HabitLogModal.jsx';
import HabitFormModal from '../components/habits/HabitFormModal.jsx';
import habitsApi from '../services/habits.api.js';
import logsApi from '../services/logs.api.js';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn.js';

const getHabitIcon = (iconName) => {
  const map = {
    Yoga: { icon: Heart, bg: 'bg-[#FFF0E8] text-[#FF6B4A]' },
    Singing: { icon: Music, bg: 'bg-[#F2EEFF] text-[#8B5CF6]' },
    Reading: { icon: BookOpen, bg: 'bg-[#EBF8F2] text-[#10B981]' },
    Running: { icon: Footprints, bg: 'bg-[#FFF7E6] text-[#F59E0B]' },
    Sleeping: { icon: Moon, bg: 'bg-[#EEF4FF] text-[#3B82F6]' },
    Drawing: { icon: Palette, bg: 'bg-[#FFF0F4] text-[#EC4899]' },
    Cycling: { icon: Bike, bg: 'bg-[#E6FAF7] text-[#06B6D4]' },
    Water: { icon: Droplets, bg: 'bg-[#E8F2FF] text-[#0284C7]' },
    Gym: { icon: Dumbbell, bg: 'bg-[#FFF0EB] text-[#EA580C]' },
    Code: { icon: Code2, bg: 'bg-[#F3EFFC] text-[#7C3AED]' },
    Coffee: { icon: Coffee, bg: 'bg-[#FFF8E7] text-[#D97706]' },
    CheckCircle2: { icon: CheckCircle2, bg: 'bg-peach-light text-coral' },
  };
  return map[iconName] || { icon: Heart, bg: 'bg-[#FFF0E8] text-[#FF6B4A]' };
};

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
      toast.error(err.message || 'Failed to update habit');
    },
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Date Stepper & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-white dark:bg-surface-800 rounded-full border border-warm-200/80 dark:border-surface-700/80 p-1 shadow-xs">
            <button
              onClick={() => handleDateShift(-1)}
              className="p-1.5 rounded-full hover:bg-warm-100 dark:hover:bg-surface-700 text-warm-600 dark:text-warm-300 transition-colors"
              title="Previous day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-warm-900 dark:text-warm-100 min-w-[110px] text-center">
              {isToday ? 'Today' : selectedDate}
            </span>
            <button
              onClick={() => handleDateShift(1)}
              className="p-1.5 rounded-full hover:bg-warm-100 dark:hover:bg-surface-700 text-warm-600 dark:text-warm-300 transition-colors"
              title="Next day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {!isToday && (
            <Button
              variant="outline"
              size="xs"
              onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
            >
              Reset to Today
            </Button>
          )}
        </div>

        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
          New Habit
        </Button>
      </div>

      {/* Daily Progress Hero Card */}
      <div className="relative overflow-hidden rounded-[28px] p-6 sm:p-7 bg-gradient-to-br from-[#FFF0E8] via-[#FFF5F0] to-[#FFF8F5] dark:from-[#312019] dark:via-[#261A16] dark:to-[#1E1715] border border-coral/25 shadow-[0_8px_30px_rgb(255,107,74,0.08)]">
        <div className="flex items-center justify-between">
          <div className="space-y-2 max-w-[65%]">
            <span className="text-xs font-bold uppercase tracking-wider text-warm-500 dark:text-warm-400">
              Daily Progress
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-warm-900 dark:text-warm-100 tracking-tight">
              {summary.completed}/{summary.totalScheduled}{' '}
              <span className="text-base sm:text-lg font-medium text-warm-500 dark:text-warm-400">
                completed
              </span>
            </div>
            <div className="flex items-center space-x-1.5 pt-1 text-xs font-semibold text-warm-600 dark:text-warm-300">
              <Flame className="w-4 h-4 text-coral fill-coral" />
              <span>{summary.completionRate}% completion rate for this date</span>
            </div>
          </div>

          <div className="flex-shrink-0">
            <CircularProgress
              value={summary.completed}
              max={summary.totalScheduled || 1}
              size={92}
              strokeWidth={8}
              trackColor="stroke-[#FDD8CC] dark:stroke-[#4A2D23]"
              progressColor="stroke-coral"
              labelClassName="text-lg font-extrabold text-warm-900 dark:text-warm-100"
            />
          </div>
        </div>
      </div>

      {/* Habit Checklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-warm-900 dark:text-warm-100">
            Scheduled for {selectedDate}
          </h2>
          <span className="text-xs font-semibold text-warm-500">
            {summary.completed}/{summary.totalScheduled} Done
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-warm-100 dark:bg-surface-700/60 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : habits.length === 0 ? (
          <Card className="text-center py-10">
            <EmptyState
              title="No habits scheduled on this date"
              description="Adjust your schedule or add a new routine to start tracking."
              actionLabel="Create Habit"
              onAction={() => setIsCreateModalOpen(true)}
            />
          </Card>
        ) : (
          <div className="space-y-2.5">
            {habits.map(({ habit, isCompleted, existingLog }) => {
              const iconData = getHabitIcon(habit.icon);
              const IconComp = iconData.icon;
              const isNumeric = habit.trackingType !== 'binary';

              return (
                <div
                  key={habit._id}
                  className={cn(
                    'p-4 rounded-[22px] bg-white dark:bg-surface-800 border transition-all duration-200 flex items-center justify-between shadow-[0_2px_12px_rgba(40,25,20,0.03)]',
                    isCompleted
                      ? 'border-coral/25 bg-peach-light/20 dark:bg-surface-800/90'
                      : 'border-warm-200/70 dark:border-surface-700/60 hover:border-warm-300'
                  )}
                >
                  {/* Left: Squircle Icon + Habit Info */}
                  <div
                    className="flex items-center space-x-3.5 min-w-0 flex-1 cursor-pointer"
                    onClick={() =>
                      setLogModalState({
                        isOpen: true,
                        habit,
                        log: existingLog,
                      })
                    }
                  >
                    <div
                      className={cn(
                        'w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105',
                        iconData.bg
                      )}
                    >
                      <IconComp className="w-5 h-5 stroke-[2.2]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3
                        className={cn(
                          'text-sm font-bold truncate transition-colors',
                          isCompleted
                            ? 'text-warm-900 dark:text-warm-100 line-through opacity-80'
                            : 'text-warm-900 dark:text-warm-100'
                        )}
                      >
                        {habit.name}
                      </h3>

                      <div className="flex items-center space-x-2 mt-0.5">
                        <div className="flex items-center space-x-1 text-xs text-warm-500 font-semibold">
                          <Flame className="w-3.5 h-3.5 text-coral fill-coral" />
                          <span>{habit.currentStreak || 0} days</span>
                        </div>
                        {isNumeric && (
                          <span className="text-[11px] text-warm-400">
                            &bull; Target: {habit.target?.value} {habit.target?.unit}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Circular Toggle Button */}
                  <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                    <button
                      type="button"
                      onClick={() =>
                        toggleMutation.mutate({
                          habit,
                          isCompleted,
                          existingLog,
                        })
                      }
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer',
                        isCompleted
                          ? 'bg-coral text-white shadow-xs shadow-coral/30'
                          : 'border-2 border-warm-300 dark:border-surface-600 hover:border-coral bg-white dark:bg-surface-700'
                      )}
                      title={isCompleted ? 'Mark incomplete' : 'Complete habit'}
                      aria-label={`Toggle habit ${habit.name}`}
                    >
                      {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <HabitFormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          todayDateStr={selectedDate}
        />
      )}

      {logModalState.isOpen && (
        <HabitLogModal
          isOpen={logModalState.isOpen}
          onClose={() =>
            setLogModalState({ isOpen: false, habit: null, log: null })
          }
          habit={logModalState.habit}
          existingLog={logModalState.log}
          localDate={selectedDate}
        />
      )}
    </div>
  );
};

export default TodayPage;
