import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  Flame,
  Award,
  CheckCircle2,
  Calendar,
  Layers,
  PieChart as PieIcon,
  BarChart2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { ProgressBar } from '../components/ui/ProgressBar.jsx';
import analyticsApi from '../services/analytics.api.js';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { cn } from '../utils/cn.js';

const CATEGORY_COLORS = {
  health: '#06b6d4',
  fitness: '#ef4444',
  learning: '#10b981',
  career: '#6366f1',
  mindfulness: '#8b5cf6',
  productivity: '#f59e0b',
  finance: '#14b8a6',
  social: '#ec4899',
  personal: '#64748b',
  other: '#94a3b8',
};

export const AnalyticsPage = () => {
  const [period, setPeriod] = useState('30d');

  const { data: analyticsRes, isLoading } = useQuery({
    queryKey: ['analytics', 'overview', period],
    queryFn: () => analyticsApi.getOverview({ period }),
  });

  const overview = analyticsRes?.data;
  const metrics = overview?.metrics || {
    totalScheduledOpportunities: 0,
    totalCompleted: 0,
    totalMinimum: 0,
    totalPartial: 0,
    totalSkipped: 0,
    totalMissed: 0,
    completionRate: 0,
    consistencyScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    perfectDays: 0,
  };
  const trendData = overview?.trendData || [];
  const weekdayPerformance = overview?.weekdayPerformance || [];
  const categoryBreakdown = overview?.categoryBreakdown || [];
  const habitBreakdown = overview?.habitBreakdown || [];

  return (
    <div className="space-y-6">
      {/* Header and Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-text-primary">
            Behavioral Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-text-muted mt-1">
            Data-driven evaluation of consistency, opportunities, and trends.
          </p>
        </div>

        <div className="flex items-center space-x-1 bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 rounded-xl p-1 shadow-sm">
          {[
            { id: '7d', label: '7D' },
            { id: '30d', label: '30D' },
            { id: '90d', label: '90D' },
            { id: '6m', label: '6M' },
            { id: '1y', label: '1Y' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPeriod(tab.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                period === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-text-secondary hover:bg-slate-100 dark:hover:bg-surface-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Global Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-4">
          <span className="text-[11px] font-mono text-slate-400 dark:text-text-dim uppercase">
            Scheduled
          </span>
          <div className="text-xl font-extrabold text-slate-900 dark:text-text-primary mt-1">
            {metrics.totalScheduledOpportunities}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Total opportunities</p>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-mono text-emerald-500 uppercase">
            Completed
          </span>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {metrics.totalCompleted}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">{metrics.totalMinimum} via fallback</p>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-mono text-indigo-500 uppercase">
            Completion Rate
          </span>
          <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
            {metrics.completionRate}%
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Full + minimum</p>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-mono text-purple-500 uppercase">
            Consistency
          </span>
          <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
            {metrics.consistencyScore}%
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Weighted partials</p>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-mono text-amber-500 uppercase">
            Streaks
          </span>
          <div className="text-xl font-extrabold text-amber-500 mt-1">
            {metrics.currentStreak}d
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Best: {metrics.longestStreak}d</p>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-mono text-cyan-500 uppercase">
            Perfect Days
          </span>
          <div className="text-xl font-extrabold text-cyan-600 dark:text-cyan-400 mt-1">
            {metrics.perfectDays}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">100% completed</p>
        </Card>
      </div>

      {/* Chart 1: Completion Rate Over Time */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Daily Completion Adherence Trend</CardTitle>
            <p className="text-xs text-slate-500 dark:text-text-muted mt-0.5">
              Daily percentage of scheduled habits achieved across selected range.
            </p>
          </div>
        </CardHeader>
        <div className="h-64 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} unit="%" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e2133',
                  borderColor: '#252840',
                  borderRadius: '8px',
                  color: '#f1f2f7',
                  fontSize: '12px',
                }}
                formatter={(val) => [`${val}%`, 'Completion Rate']}
              />
              <Line
                type="monotone"
                dataKey="completionRate"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Chart 2 & 3: Weekday Distribution & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekday Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Weekday Performance</CardTitle>
            <p className="text-xs text-slate-500 dark:text-text-muted mt-0.5">
              Day-by-day scheduled adherence comparison.
            </p>
          </CardHeader>
          <div className="h-56 w-full mt-2">
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
                <Bar dataKey="rate" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <p className="text-xs text-slate-500 dark:text-text-muted mt-0.5">
              Completions grouped by behavioral category.
            </p>
          </CardHeader>
          <div className="h-56 w-full mt-2 flex items-center justify-center">
            {categoryBreakdown.length === 0 ? (
              <p className="text-xs text-slate-400">No category activity recorded</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="completed"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {categoryBreakdown.map((entry) => (
                      <Cell
                        key={entry.category}
                        fill={CATEGORY_COLORS[entry.category] || '#6366f1'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e2133',
                      borderColor: '#252840',
                      borderRadius: '8px',
                      color: '#f1f2f7',
                      fontSize: '12px',
                    }}
                    formatter={(val, name) => [`${val} completions`, name]}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Individual Habit Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Habit Adherence Breakdown</CardTitle>
          <span className="text-xs text-slate-400 font-mono">
            {habitBreakdown.length} evaluated habits
          </span>
        </CardHeader>

        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-surface-700 text-slate-400 dark:text-text-dim uppercase font-mono">
                <th className="pb-3 px-2 font-semibold">Habit</th>
                <th className="pb-3 px-2 font-semibold">Category</th>
                <th className="pb-3 px-2 font-semibold">Completed / Sched</th>
                <th className="pb-3 px-2 font-semibold">Adherence</th>
                <th className="pb-3 px-2 font-semibold">Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-surface-700/50">
              {habitBreakdown.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-surface-700/30">
                  <td className="py-3 px-2 font-medium text-slate-900 dark:text-text-primary">
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: h.color || '#6366f1' }}
                      />
                      <span>{h.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 capitalize text-slate-500 dark:text-text-muted">
                    {h.category}
                  </td>
                  <td className="py-3 px-2 font-mono text-slate-700 dark:text-text-secondary">
                    {h.completed} / {h.scheduled}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-800 dark:text-text-primary w-8">
                        {h.completionRate}%
                      </span>
                      <div className="w-24">
                        <ProgressBar value={h.completionRate} size="sm" />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-amber-500 font-semibold">
                    <div className="flex items-center">
                      <Flame className="w-3.5 h-3.5 mr-1" />
                      {h.currentStreak}d
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
