import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  Flame,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Edit,
  TrendingUp,
  Target,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import HabitFormModal from '../components/habits/HabitFormModal.jsx';
import analyticsApi from '../services/analytics.api.js';
import habitsApi from '../services/habits.api.js';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const HabitDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch individual habit analytics
  const { data: analyticsRes, isLoading } = useQuery({
    queryKey: ['habitAnalytics', id],
    queryFn: () => analyticsApi.getHabitAnalytics(id, { period: '30d' }),
  });

  // Fetch habit details
  const { data: habitRes } = useQuery({
    queryKey: ['habitDetails', id],
    queryFn: () => habitsApi.getById(id),
  });

  const habit = analyticsRes?.data?.habit || habitRes?.data?.habit;
  const metrics = analyticsRes?.data?.metrics || {
    scheduledOpportunities: 0,
    fullCompletions: 0,
    minimumCompletions: 0,
    completionRate: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalCompletions: 0,
    totalInvested: 0,
    unit: '',
  };
  const weekdayPerformance = analyticsRes?.data?.weekdayPerformance || [];
  const logs = habitRes?.data?.logs || [];

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs text-warm-400 animate-pulse">
        Loading habit analytics...
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-warm-500">Habit not found or unauthorized.</p>
        <Link to="/habits">
          <Button variant="outline" size="sm" className="mt-4">
            Back to Habits
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/habits"
          className="inline-flex items-center text-xs font-bold text-warm-500 hover:text-coral transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          All Habits
        </Link>
        <Button size="sm" onClick={() => setIsEditModalOpen(true)}>
          <Edit className="w-3.5 h-3.5 mr-1.5" />
          Edit Habit
        </Button>
      </div>

      {/* Main Habit Header Card */}
      <div className="p-6 sm:p-7 rounded-[28px] bg-white dark:bg-surface-800 border border-warm-200/80 dark:border-surface-700/60 shadow-[0_4px_25px_-2px_rgba(40,25,20,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span
                className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: habit.color || '#FF6B4A' }}
              />
              <h1 className="text-2xl font-extrabold tracking-tight text-warm-900 dark:text-warm-100">
                {habit.name}
              </h1>
              <Badge variant="default" className="text-xs uppercase">
                {habit.category}
              </Badge>
              <Badge variant={habit.status === 'active' ? 'primary' : 'warning'}>
                {habit.status}
              </Badge>
            </div>
            {habit.description && (
              <p className="text-xs text-warm-500 dark:text-warm-400 mt-2 max-w-2xl leading-relaxed">
                {habit.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-warm-600 dark:text-warm-300">
            <span className="px-3.5 py-1.5 rounded-full bg-peach-light dark:bg-surface-700 font-semibold">
              Schedule: <strong className="text-warm-900 dark:text-warm-100 capitalize">{habit.frequency?.type?.replace('_', ' ')}</strong>
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-peach-light dark:bg-surface-700 font-semibold">
              Target: <strong className="text-warm-900 dark:text-warm-100">{habit.target?.value} {habit.target?.unit}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="p-5 rounded-[22px] bg-white dark:bg-surface-800 border border-warm-200/70 dark:border-surface-700/60 shadow-xs">
          <span className="text-xs font-bold text-warm-400 dark:text-warm-500">
            Current Streak
          </span>
          <div className="text-2xl font-extrabold text-coral mt-2 flex items-center">
            <Flame className="w-5 h-5 mr-1 fill-coral" />
            {metrics.currentStreak}d
          </div>
          <p className="text-[11px] text-warm-400 mt-1">Best: {metrics.longestStreak} days</p>
        </div>

        <div className="p-5 rounded-[22px] bg-white dark:bg-surface-800 border border-warm-200/70 dark:border-surface-700/60 shadow-xs">
          <span className="text-xs font-bold text-warm-400 dark:text-warm-500">
            Completion Rate
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            {metrics.completionRate}%
          </div>
          <p className="text-[11px] text-warm-400 mt-1">
            {metrics.fullCompletions + metrics.minimumCompletions}/{metrics.scheduledOpportunities} opportunities
          </p>
        </div>

        <div className="p-5 rounded-[22px] bg-white dark:bg-surface-800 border border-warm-200/70 dark:border-surface-700/60 shadow-xs">
          <span className="text-xs font-bold text-warm-400 dark:text-warm-500">
            Total Completions
          </span>
          <div className="text-2xl font-extrabold text-warm-900 dark:text-warm-100 mt-2">
            {metrics.totalCompletions}
          </div>
          <p className="text-[11px] text-warm-400 mt-1">Lifetime check-ins</p>
        </div>

        <div className="p-5 rounded-[22px] bg-white dark:bg-surface-800 border border-warm-200/70 dark:border-surface-700/60 shadow-xs">
          <span className="text-xs font-bold text-warm-400 dark:text-warm-500">
            Total Output
          </span>
          <div className="text-2xl font-extrabold text-warm-900 dark:text-warm-100 mt-2">
            {metrics.totalInvested} <span className="text-xs font-normal text-warm-400">{metrics.unit}</span>
          </div>
          <p className="text-[11px] text-warm-400 mt-1">Logged over 30 days</p>
        </div>
      </div>

      {/* Weekday Performance Chart */}
      <Card className="rounded-[26px]">
        <CardHeader>
          <div>
            <CardTitle>Weekday Performance Breakdown</CardTitle>
            <p className="text-xs text-warm-500 dark:text-warm-400 mt-0.5">
              Historical completion rates for {habit.name} by day of week
            </p>
          </div>
        </CardHeader>
        <div className="h-44 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekdayPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#A8A29E" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#A8A29E" fontSize={11} unit="%" domain={[0, 100]} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: 'rgba(255, 107, 74, 0.08)' }}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#EBE6DF',
                  borderRadius: '16px',
                  color: '#1E1C1B',
                  fontSize: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                }}
                formatter={(val) => [`${val}%`, 'Adherence']}
              />
              <Bar dataKey="rate" fill="#FF6B4A" radius={[8, 8, 8, 8]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent Check-in Logs */}
      <Card className="rounded-[26px]">
        <CardHeader>
          <CardTitle>Recent Check-in Logs</CardTitle>
          <span className="text-xs text-warm-400 font-semibold">Last {logs.length} check-ins</span>
        </CardHeader>

        {logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-warm-400">
            No check-in history logged yet for this habit.
          </div>
        ) : (
          <div className="divide-y divide-warm-100 dark:divide-surface-700/60 mt-2">
            {logs.map((log) => (
              <div key={log._id} className="py-3.5 px-2 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-warm-900 dark:text-warm-100">
                    {log.localDate}
                  </div>
                  {log.note && (
                    <p className="text-warm-500 dark:text-warm-400 mt-0.5 italic">
                      &ldquo;{log.note}&rdquo;
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {habit.trackingType !== 'binary' && (
                    <span className="font-mono text-warm-600 dark:text-warm-300">
                      {log.value} {habit.target?.unit}
                    </span>
                  )}
                  <Badge
                    variant={
                      log.status === 'completed'
                        ? 'primary'
                        : log.status === 'partial'
                        ? 'warning'
                        : 'danger'
                    }
                  >
                    {log.completionType === 'minimum' ? 'Minimum Fallback' : log.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <HabitFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          habitToEdit={habit}
        />
      )}
    </div>
  );
};

export default HabitDetailsPage;
