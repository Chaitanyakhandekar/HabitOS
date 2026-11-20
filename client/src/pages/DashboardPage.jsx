import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  Plus,
  Flame,
  Award,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Calendar,
  Check,
  Heart,
  Music,
  BookOpen,
  Footprints,
  Moon,
  Palette,
  Bike,
  LayoutGrid,
  Droplets,
  Dumbbell,
  Code2,
  Coffee,
  SlidersHorizontal,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { CircularProgress } from '../components/ui/CircularProgress.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import HabitFormModal from '../components/habits/HabitFormModal.jsx';
import HabitLogModal from '../components/habits/HabitLogModal.jsx';
import habitsApi from '../services/habits.api.js';
import analyticsApi from '../services/analytics.api.js';
import goalsApi from '../services/goals.api.js';
import logsApi from '../services/logs.api.js';
import { useAuthStore } from '../store/authStore.js';
import toast from 'react-hot-toast';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { cn } from '../utils/cn.js';

// Habit icon resolver
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

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [logModalState, setLogModalState] = useState({
    isOpen: false,
    habit: null,
    log: null,
  });

  // 1. Fetch Today's Habits
  const { data: todayData, isLoading: isLoadingToday } = useQuery({
    queryKey: ['todayHabits'],
    queryFn: () => habitsApi.getToday(),
  });

  // 2. Fetch Today's Summary
  const { data: summaryData } = useQuery({
    queryKey: ['todaySummary'],
    queryFn: () => habitsApi.getTodaySummary(),
  });

  // 3. Fetch Overview Analytics for streaks, consistency, and weekly performance
  const { data: analyticsData } = useQuery({
    queryKey: ['analytics', 'overview', '30d'],
    queryFn: () => analyticsApi.getOverview({ period: '30d' }),
  });

  // 4. Fetch Goals for deadline card
  const { data: goalsData } = useQuery({
    queryKey: ['goals', 'active'],
    queryFn: () => goalsApi.getAll({ status: 'active' }),
  });

  // 5. Fetch Genuine Insights
  const { data: insightsData } = useQuery({
    queryKey: ['analytics', 'insights'],
    queryFn: () => analyticsApi.getInsights(),
  });

  const habitsList = todayData?.data?.habits || [];
  const summary = summaryData?.data?.summary || {
    totalScheduled: 0,
    completed: 0,
    completionRate: 0,
  };
  const metrics = analyticsData?.data?.metrics || {
    currentStreak: 0,
    longestStreak: 0,
    consistencyScore: 0,
    activeHabitsCount: 0,
  };
  const activeGoals = goalsData?.data?.goals || [];
  const nearestGoal = activeGoals[0];
  const weekdayPerformance = analyticsData?.data?.weekdayPerformance || [];
  const insights = insightsData?.data?.insights || [];
  const todayDateStr = todayData?.data?.date || new Date().toISOString().slice(0, 10);

  // Quick 1-click completion toggle mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ habit, isCompleted, existingLog }) => {
      if (isCompleted && existingLog) {
        await logsApi.delete(existingLog._id);
      } else {
        await logsApi.log({
          habitId: habit._id,
          localDate: todayDateStr,
          status: 'completed',
          value: habit.target.value,
          completionType: 'full',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayHabits'] });
      queryClient.invalidateQueries({ queryKey: ['todaySummary'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update habit');
    },
  });

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Reference Screen 2 Header (Date & Title & Action) */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-warm-500 dark:text-warm-400">
            {formattedDate}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-warm-900 dark:text-warm-100">
            Today&apos;s Habits
          </h1>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="shadow-sm shadow-coral/30"
        >
          <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
          New Habit
        </Button>
      </div>

      {/* Reference Screen 2: Daily Progress Hero Card */}
      <div className="relative overflow-hidden rounded-[28px] p-6 sm:p-7 bg-gradient-to-br from-[#FFF0E8] via-[#FFF5F0] to-[#FFF8F5] dark:from-[#312019] dark:via-[#261A16] dark:to-[#1E1715] border border-coral/25 shadow-[0_8px_30px_rgb(255,107,74,0.08)]">
        <div className="flex items-center justify-between">
          {/* Left stats */}
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
              <span>
                Best streak:{' '}
                <strong className="text-warm-900 dark:text-warm-100 font-bold">
                  {metrics.longestStreak || 0} days
                </strong>
              </span>
            </div>
          </div>

          {/* Right: Circular Progress Ring */}
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

      {/* Reference Screen 2: Secondary Supporting Cards (2-Columns) */}
      <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
        {/* Card 1: Deadline / Goals */}
        <Link
          to="/goals"
          className="p-4 sm:p-5 rounded-[22px] bg-white dark:bg-surface-800 border border-warm-200/70 dark:border-surface-700/60 shadow-[0_4px_20px_-2px_rgba(40,25,20,0.03)] hover:border-coral/40 transition-all group"
        >
          <div className="flex items-center justify-between text-xs font-bold text-warm-400 dark:text-warm-500 mb-2">
            <span>Next Goal</span>
            <Calendar className="w-4 h-4 text-coral" />
          </div>
          <div className="font-bold text-sm sm:text-base text-warm-900 dark:text-warm-100 truncate">
            {nearestGoal ? nearestGoal.title : 'Stay consistent'}
          </div>
          <span className="text-[11px] font-semibold text-coral block mt-1">
            {nearestGoal?.targetDate
              ? new Date(nearestGoal.targetDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              : `${metrics.consistencyScore || 0}% consistency`}
          </span>
        </Link>

        {/* Card 2: Current Streak & Consistency */}
        <Link
          to="/analytics"
          className="p-4 sm:p-5 rounded-[22px] bg-white dark:bg-surface-800 border border-warm-200/70 dark:border-surface-700/60 shadow-[0_4px_20px_-2px_rgba(40,25,20,0.03)] hover:border-coral/40 transition-all group"
        >
          <div className="flex items-center justify-between text-xs font-bold text-warm-400 dark:text-warm-500 mb-2">
            <span>Active Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-bold text-sm sm:text-base text-warm-900 dark:text-warm-100">
            {metrics.currentStreak} Days
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block mt-1">
            {metrics.activeHabitsCount || habitsList.length} Active Habits
          </span>
        </Link>
      </div>

      {/* Reference Screen 2: Habit List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-warm-900 dark:text-warm-100">
            Today&apos;s Checklist
          </h2>
          <span className="text-xs text-warm-500 font-semibold">
            {summary.completed}/{summary.totalScheduled} Done
          </span>
        </div>

        {isLoadingToday ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-warm-100 dark:bg-surface-700/60 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : habitsList.length === 0 ? (
          <Card className="text-center py-10">
            <EmptyState
              title="No habits scheduled for today"
              description="Take a well-deserved rest day or create a new habit to start building positive routines."
              actionLabel="Create Habit"
              onAction={() => setIsCreateModalOpen(true)}
            />
          </Card>
        ) : (
          <div className="space-y-2.5">
            {habitsList.map(({ habit, isCompleted, existingLog }) => {
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
                  {/* Left: Squircle Icon + Habit Name + Streak */}
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
                      <div className="flex items-center space-x-2">
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
                      </div>

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

                  {/* Right: Circular Completion Indicator */}
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

      {/* Weekly Adherence Chart (Reference-Styled Analytics Section) */}
      <Card className="rounded-[26px]">
        <CardHeader>
          <div>
            <CardTitle>Weekly Performance</CardTitle>
            <p className="text-xs text-warm-500 dark:text-warm-400 mt-0.5">
              Completion distribution by day of week
            </p>
          </div>
          <Link
            to="/analytics"
            className="text-xs font-bold text-coral hover:text-coral-600 inline-flex items-center"
          >
            Detailed Analytics <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </CardHeader>

        <div className="h-48 w-full mt-2">
          {weekdayPerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weekdayPerformance}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="day"
                  stroke="#A8A29E"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#A8A29E"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  unit="%"
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 107, 74, 0.08)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-surface-800 p-2.5 rounded-xl border border-warm-200 dark:border-surface-600 shadow-md text-xs">
                          <p className="font-bold text-warm-900 dark:text-warm-100">
                            {payload[0].payload.day}
                          </p>
                          <p className="text-coral font-semibold">
                            {payload[0].value}% completion
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="rate"
                  fill="#FF6B4A"
                  radius={[8, 8, 8, 8]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-warm-400">
              Not enough logs to compute weekday patterns yet.
            </div>
          )}
        </div>
      </Card>

      {/* Behavioral Insights Section */}
      {insights.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-warm-900 dark:text-warm-100 px-1">
            Behavioral Insights
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {insights.slice(0, 2).map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white dark:bg-surface-800 border border-warm-200/70 dark:border-surface-700/60 shadow-xs flex items-start space-x-3"
              >
                <div className="w-8 h-8 rounded-xl bg-peach-light dark:bg-surface-700 text-coral flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-warm-900 dark:text-warm-100">
                    {item.title}
                  </h4>
                  <p className="text-xs text-warm-500 dark:text-warm-400 mt-1 leading-relaxed">
                    {item.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {isCreateModalOpen && (
        <HabitFormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          todayDateStr={todayDateStr}
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
          localDate={todayDateStr}
        />
      )}
    </div>
  );
};

export default DashboardPage;
