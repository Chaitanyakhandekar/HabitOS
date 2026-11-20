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
  Target,
  Sparkles,
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

// Pastel palette matching the wellness reference
const CATEGORY_COLORS = {
  health: '#06B6D4',
  fitness: '#FF6B4A',
  learning: '#10B981',
  career: '#8B5CF6',
  mindfulness: '#A084E8',
  productivity: '#F59E0B',
  finance: '#14B8A6',
  social: '#EC4899',
  personal: '#64748B',
  other: '#94A3B8',
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header and Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-warm-900 dark:text-warm-100">
            Behavioral Analytics
          </h1>
          <p className="text-xs text-warm-500 dark:text-warm-400 mt-1">
            Data-driven consistency insights, completion trends, and category distribution.
          </p>
        </div>

        {/* Segmented Period Filter Pills */}
        <div className="flex items-center space-x-1 bg-white dark:bg-surface-800 border border-warm-200/80 dark:border-surface-700 rounded-full p-1 shadow-xs overflow-x-auto">
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
                'px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-150',
                period === tab.id
                  ? 'bg-coral text-white shadow-xs'
                  : 'text-warm-600 dark:text-warm-300 hover:text-warm-900 dark:hover:text-warm-100 hover:bg-warm-100 dark:hover:bg-surface-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Global Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-[22px] bg-white dark:bg-surface-800 border border-warm-200/70 dark:border-surface-700/60 shadow-xs">
          <span className="text-[11px] font-bold text-warm-400 dark:text-warm-500 uppercase tracking-wider">
            Scheduled
          </span>
          <div className="text-xl font-extrabold text-warm-900 dark:text-warm-100 mt-1">
            {metrics.totalScheduledOpportunities}
          </div>
          <p className="text-[10px] text-warm-400 mt-0.5">Opportunities</p>
        </div>

        <div className="p-4 rounded-[22px] bg-white dark:bg-surface-800 border border-warm-200/70 dark:border-surface-700/60 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Completed
          </span>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {metrics.totalCompleted}
          </div>
          <p className="text-[10px] text-warm-400 mt-0.5">{metrics.totalMinimum} fallback</p>
        </div>

        <div className="p-4 rounded-[22px] bg-white dark:bg-surface-800 border border-warm-200/70 dark:border-surface-700/60 shadow-xs">
          <span className="text-[11px] font-bold text-coral uppercase tracking-wider">
            Adherence
          </span>
          <div className="text-xl font-extrabold text-coral mt-1">
            {metrics.completionRate}%
          </div>
          <p className="text-[10px] text-warm-400 mt-0.5">Full + minimum</p>
        </div>

        <div className="p-4 rounded-[22px] bg-white dark:bg-surface-800 border border-warm-200/70 dark:border-surface-700/60 shadow-xs">
          <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            Consistency
          </span>
          <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
            {metrics.consistencyScore}%
          </div>
          <p className="text-[10px] text-warm-400 mt-0.5">Weighted partials</p>
        </div>

        <div className="p-4 rounded-[22px] bg-white dark:bg-surface-800 border border-warm-200/70 dark:border-surface-700/60 shadow-xs">
          <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">
            Streaks
          </span>
          <div className="text-xl font-extrabold text-amber-500 mt-1">
            {metrics.currentStreak}d
          </div>
          <p className="text-[10px] text-warm-400 mt-0.5">Best: {metrics.longestStreak}d</p>
        </div>

        <div className="p-4 rounded-[22px] bg-white dark:bg-surface-800 border border-warm-200/70 dark:border-surface-700/60 shadow-xs">
          <span className="text-[11px] font-bold text-sky-500 uppercase tracking-wider">
            Perfect Days
          </span>
          <div className="text-xl font-extrabold text-sky-600 dark:text-sky-400 mt-1">
            {metrics.perfectDays}
          </div>
          <p className="text-[10px] text-warm-400 mt-0.5">100% completed</p>
        </div>
      </div>

      {/* Chart 1: Completion Rate Over Time */}
      <Card className="rounded-[26px]">
        <CardHeader>
          <div>
            <CardTitle>Daily Completion Adherence Trend</CardTitle>
            <p className="text-xs text-warm-500 dark:text-warm-400 mt-0.5">
              Daily percentage of scheduled habits achieved across selected range
            </p>
          </div>
        </CardHeader>
        <div className="h-64 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" stroke="#A8A29E" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#A8A29E" fontSize={10} unit="%" domain={[0, 100]} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#EBE6DF',
                  borderRadius: '16px',
                  color: '#1E1C1B',
                  fontSize: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                }}
                formatter={(val) => [`${val}%`, 'Completion Rate']}
              />
              <Line
                type="monotone"
                dataKey="completionRate"
                stroke="#FF6B4A"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: '#FF6B4A', stroke: '#FFF' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Chart 2 & 3: Weekday Distribution & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekday Performance */}
        <Card className="rounded-[26px]">
          <CardHeader>
            <CardTitle>Weekday Performance</CardTitle>
            <p className="text-xs text-warm-500 dark:text-warm-400 mt-0.5">
              Day-by-day scheduled adherence comparison
            </p>
          </CardHeader>
          <div className="h-56 w-full mt-4">
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
                <Bar dataKey="rate" fill="#FF6B4A" radius={[8, 8, 8, 8]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Breakdown */}
        <Card className="rounded-[26px]">
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <p className="text-xs text-warm-500 dark:text-warm-400 mt-0.5">
              Completions grouped by wellness category
            </p>
          </CardHeader>
          <div className="h-56 w-full mt-2 flex items-center justify-center">
            {categoryBreakdown.length === 0 ? (
              <p className="text-xs text-warm-400">No category activity recorded</p>
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
                    outerRadius={78}
                    paddingAngle={4}
                  >
                    {categoryBreakdown.map((entry) => (
                      <Cell
                        key={entry.category}
                        fill={CATEGORY_COLORS[entry.category] || '#FF6B4A'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#EBE6DF',
                      borderRadius: '16px',
                      color: '#1E1C1B',
                      fontSize: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
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
      <Card className="rounded-[26px]">
        <CardHeader>
          <CardTitle>Habit Adherence Breakdown</CardTitle>
          <span className="text-xs text-warm-400 font-semibold">
            {habitBreakdown.length} evaluated habits
          </span>
        </CardHeader>

        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-warm-200/80 dark:border-surface-700 text-warm-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 px-3">Habit</th>
                <th className="pb-3 px-3">Category</th>
                <th className="pb-3 px-3">Completed / Sched</th>
                <th className="pb-3 px-3">Adherence</th>
                <th className="pb-3 px-3">Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100 dark:divide-surface-700/50">
              {habitBreakdown.map((h) => (
                <tr key={h.id} className="hover:bg-warm-50 dark:hover:bg-surface-700/30 transition-colors">
                  <td className="py-3 px-3 font-bold text-warm-900 dark:text-warm-100">
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: h.color || '#FF6B4A' }}
                      />
                      <span>{h.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 capitalize text-warm-500">
                    {h.category}
                  </td>
                  <td className="py-3 px-3 font-semibold text-warm-700 dark:text-warm-300">
                    {h.completed} / {h.scheduled}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-warm-900 dark:text-warm-100 w-8">
                        {h.completionRate}%
                      </span>
                      <div className="w-24">
                        <ProgressBar value={h.completionRate} size="sm" />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-coral font-bold">
                    <div className="flex items-center">
                      <Flame className="w-3.5 h-3.5 mr-1 fill-coral" />
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
