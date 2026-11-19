import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Flame,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Edit,
  TrendingUp,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { ProgressBar } from '../components/ui/ProgressBar.jsx';
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

  // Fetch habit logs
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
      <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
        Loading habit analytics...
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">Habit not found or unauthorized.</p>
        <Link to="/habits">
          <Button variant="outline" size="sm" className="mt-4">
            Back to Habits
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/habits"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to all habits
        </Link>
        <Button size="sm" onClick={() => setIsEditModalOpen(true)}>
          <Edit className="w-3.5 h-3.5 mr-1.5" />
          Edit Configuration
        </Button>
      </div>

      {/* Main Habit Header Card */}
      <Card className="border-t-4" style={{ borderTopColor: habit.color || '#6366f1' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span
                className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: habit.color || '#6366f1' }}
              />
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-text-primary">
                {habit.name}
              </h1>
              <Badge variant="default" className="text-xs uppercase font-mono">
                {habit.category}
              </Badge>
              <Badge variant={habit.status === 'active' ? 'success' : 'warning'}>
                {habit.status}
              </Badge>
            </div>
            {habit.description && (
              <p className="text-xs text-slate-500 dark:text-text-muted mt-1.5 max-w-2xl">
                {habit.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-text-muted">
            <span className="p-2 rounded-lg bg-slate-100 dark:bg-surface-700">
              Schedule: <strong className="text-slate-800 dark:text-text-primary capitalize">{habit.frequency?.type?.replace('_', ' ')}</strong>
            </span>
            <span className="p-2 rounded-lg bg-slate-100 dark:bg-surface-700">
              Target: <strong className="text-slate-800 dark:text-text-primary">{habit.target?.value} {habit.target?.unit}</strong>
            </span>
          </div>
        </div>
      </Card>

      {/* Analytics KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <span className="text-xs font-semibold text-slate-500 dark:text-text-muted">
            Current Streak
          </span>
          <div className="text-2xl font-extrabold text-amber-500 mt-2 flex items-center">
            <Flame className="w-5 h-5 mr-1" />
            {metrics.currentStreak}d
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Best: {metrics.longestStreak} days</p>
        </Card>

        <Card>
          <span className="text-xs font-semibold text-slate-500 dark:text-text-muted">
            Completion Rate
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            {metrics.completionRate}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {metrics.fullCompletions + metrics.minimumCompletions} / {metrics.scheduledOpportunities} opportunities
          </p>
        </Card>

        <Card>
          <span className="text-xs font-semibold text-slate-500 dark:text-text-muted">
            Total Completions
          </span>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">
            {metrics.totalCompletions}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Lifetime check-ins recorded</p>
        </Card>

        <Card>
          <span className="text-xs font-semibold text-slate-500 dark:text-text-muted">
            Total Output Logged
          </span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-text-primary mt-2">
            {metrics.totalInvested} <span className="text-xs font-normal text-slate-400">{metrics.unit}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Recorded over past 30 days</p>
        </Card>
      </div>

      {/* Weekday Performance Chart */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Weekday Performance Breakdown</CardTitle>
            <p className="text-xs text-slate-500 dark:text-text-muted mt-0.5">
              Historical completion rates for {habit.name} by day of week.
            </p>
          </div>
        </CardHeader>
        <div className="h-44 w-full mt-4">
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
              <Bar dataKey="rate" fill={habit.color || '#6366f1'} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent Log History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Check-in Logs</CardTitle>
          <span className="text-xs text-slate-400 font-mono">Last {logs.length} check-ins</span>
        </CardHeader>

        {logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No check-in history logged yet for this habit.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-surface-700/60 mt-2">
            {logs.map((log) => (
              <div key={log._id} className="py-3 px-2 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-text-primary">
                    {log.localDate}
                  </div>
                  {log.note && (
                    <p className="text-slate-500 dark:text-text-muted mt-0.5 italic">
                      &ldquo;{log.note}&rdquo;
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {habit.trackingType !== 'binary' && (
                    <span className="font-mono text-slate-600 dark:text-text-secondary">
                      {log.value} {habit.target?.unit}
                    </span>
                  )}
                  <Badge
                    variant={
                      log.status === 'completed'
                        ? 'success'
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
      <HabitFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        habitToEdit={habit}
      />
    </div>
  );
};

export default HabitDetailsPage;
