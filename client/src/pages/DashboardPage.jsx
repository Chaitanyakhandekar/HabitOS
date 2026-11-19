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
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { ProgressBar } from '../components/ui/ProgressBar.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import HabitFormModal from '../components/habits/HabitFormModal.jsx';
import HabitLogModal from '../components/habits/HabitLogModal.jsx';
import habitsApi from '../services/habits.api.js';
import analyticsApi from '../services/analytics.api.js';
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

  // 4. Fetch Genuine Insights
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
  const weekdayPerformance = analyticsData?.data?.weekdayPerformance || [];
  const insights = insightsData?.data?.insights || [];
  const todayDateStr = todayData?.data?.date;

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Quick 1-click completion toggle mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ habit, isCompleted, existingLog }) => {
      if (isCompleted && existingLog) {
        // Undo
        await logsApi.delete(existingLog._id);
      } else {
        // Complete full
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-text-primary">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-text-muted mt-1">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}{' '}
            &bull; Ready to build consistency today?
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Habit
        </Button>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Progress */}
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-text-muted">
              Today&apos;s Progress
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-text-primary">
              {summary.completed}/{summary.totalScheduled}
            </div>
            <div className="mt-2">
              <ProgressBar value={summary.completionRate} size="sm" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-text-dim mt-2">
            {summary.completionRate}% of today&apos;s scheduled targets
          </p>
        </Card>

        {/* Current Streak */}
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-text-muted">
              Current Streak
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-500">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-text-primary">
              {metrics.currentStreak} <span className="text-xs font-medium text-slate-400">days</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-text-muted mt-2">
              Personal best: <span className="font-semibold text-slate-700 dark:text-text-secondary">{metrics.longestStreak} days</span>
            </p>
          </div>
        </Card>

        {/* 30-Day Consistency */}
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-text-muted">
              30-Day Consistency
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-text-primary">
              {metrics.consistencyScore}%
            </div>
            <p className="text-[11px] text-slate-500 dark:text-text-muted mt-2">
              Weighted scheduled adherence
            </p>
          </div>
        </Card>

        {/* Active Habits */}
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-text-muted">
              Active Habits
            </span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-500">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-text-primary">
              {metrics.activeHabitsCount}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-text-muted mt-2">
              Habits currently in active rotation
            </p>
          </div>
        </Card>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Habits Checklist (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="mb-0">
              <div>
                <CardTitle>Today&apos;s Scheduled Habits</CardTitle>
                <p className="text-xs text-slate-500 dark:text-text-muted mt-0.5">
                  Check off items or click to record partial/minimum versions.
                </p>
              </div>
              <Link
                to="/today"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center"
              >
                Full view
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </CardHeader>

            <div className="divide-y divide-slate-100 dark:divide-surface-700/60 mt-2">
              {isLoadingToday ? (
                <div className="p-6 text-center text-xs text-slate-400 animate-pulse">
                  Loading today&apos;s habits...
                </div>
              ) : habitsList.length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  title="No habits scheduled for today"
                  description="Enjoy your rest day or create a new habit to begin tracking."
                  actionLabel="Add Habit"
                  onAction={() => setIsCreateModalOpen(true)}
                />
              ) : (
                habitsList.map(({ habit, log, isCompleted, isPartial, isSkipped, currentStreak }) => (
                  <div
                    key={habit._id}
                    className="py-3 px-2 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-surface-700/30 rounded-xl transition-colors group"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {/* Checkbox Button */}
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
                          'w-6 h-6 rounded-lg flex items-center justify-center border transition-all duration-200',
                          isCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                            : 'border-slate-300 dark:border-surface-600 hover:border-indigo-500 bg-white dark:bg-surface-800'
                        )}
                      >
                        {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      {/* Habit Name and Meta */}
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span
                            className={cn(
                              'text-sm font-medium tracking-tight truncate',
                              isCompleted
                                ? 'line-through text-slate-400 dark:text-text-dim'
                                : 'text-slate-900 dark:text-text-primary'
                            )}
                          >
                            {habit.name}
                          </span>
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: habit.color || '#6366f1' }}
                          />
                        </div>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <Badge variant="default" className="text-[10px] py-0 px-1.5 uppercase font-mono">
                            {habit.category}
                          </Badge>
                          {habit.trackingType !== 'binary' && (
                            <span className="text-[11px] text-slate-500 dark:text-text-muted">
                              Target: {habit.target.value} {habit.target.unit}
                            </span>
                          )}
                          {currentStreak > 0 && (
                            <span className="text-[11px] font-medium text-amber-500 flex items-center">
                              <Flame className="w-3 h-3 mr-0.5" />
                              {currentStreak}d
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {isPartial && (
                        <Badge variant="warning" className="text-[10px]">
                          Partial
                        </Badge>
                      )}
                      {isSkipped && (
                        <Badge variant="danger" className="text-[10px]">
                          Skipped
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() =>
                          setLogModalState({
                            isOpen: true,
                            habit,
                            log,
                          })
                        }
                      >
                        Log
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Weekly Performance Recharts Bar Chart */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Weekly Day-by-Day Adherence</CardTitle>
                <p className="text-xs text-slate-500 dark:text-text-muted mt-0.5">
                  Percentage of scheduled habits completed across each day of the week.
                </p>
              </div>
            </CardHeader>
            <div className="h-48 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekdayPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} unit="%" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e2133',
                      borderColor: '#252840',
                      borderRadius: '8px',
                      color: '#f1f2f7',
                      fontSize: '12px',
                    }}
                    formatter={(val) => [`${val}%`, 'Adherence']}
                  />
                  <Bar dataKey="rate" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Insights & Quick Actions Column (1 Column) */}
        <div className="space-y-4">
          {/* Insights Summary Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <CardTitle>Behavioral Insights</CardTitle>
              </div>
            </CardHeader>

            <div className="space-y-3">
              {insights.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 dark:text-text-muted">
                  Log a few more days of habits to generate genuine analytical patterns.
                </div>
              ) : (
                insights.map((ins) => (
                  <div
                    key={ins.id}
                    className={cn(
                      'p-3 rounded-xl border text-xs',
                      ins.variant === 'positive'
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-200'
                        : ins.variant === 'warning'
                        ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200'
                        : 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/50 text-indigo-900 dark:text-indigo-200'
                    )}
                  >
                    <div className="font-semibold">{ins.title}</div>
                    <p className="mt-1 opacity-90 leading-relaxed">{ins.description}</p>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Quick Navigation Cards */}
          <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-indigo-800/50 shadow-md">
            <h4 className="font-bold text-sm tracking-tight">Today&apos;s Daily Reflection</h4>
            <p className="text-xs text-indigo-200/80 mt-1">
              Capture your wins, energy levels, and challenges for today.
            </p>
            <Link to="/journal">
              <Button size="sm" className="mt-4 bg-white text-indigo-900 hover:bg-indigo-50 shadow-none font-semibold">
                Open Journal
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <HabitFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        todayDateStr={todayDateStr}
      />

      <HabitLogModal
        isOpen={logModalState.isOpen}
        onClose={() => setLogModalState({ isOpen: false, habit: null, log: null })}
        habit={logModalState.habit}
        existingLog={logModalState.log}
        localDate={todayDateStr}
      />
    </div>
  );
};

export default DashboardPage;
