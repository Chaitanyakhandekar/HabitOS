import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import analyticsApi from '../services/analytics.api.js';
import habitsApi from '../services/habits.api.js';
import { Link } from 'react-router-dom';
import { cn } from '../utils/cn.js';

export const CalendarPage = () => {
  const [monthsView, setMonthsView] = useState(6);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  // 1. Fetch Heatmap Data
  const { data: heatmapRes, isLoading: isLoadingHeatmap } = useQuery({
    queryKey: ['heatmap', monthsView],
    queryFn: () => analyticsApi.getHeatmap({ months: monthsView }),
  });

  // 2. Fetch Drilldown Habits for the clicked date
  const { data: drilldownRes, isLoading: isLoadingDrilldown } = useQuery({
    queryKey: ['dateDrilldown', selectedDate],
    queryFn: () => habitsApi.getToday({ date: selectedDate }),
  });

  const heatmap = heatmapRes?.data?.heatmap || [];
  const drilldownHabits = drilldownRes?.data?.habits || [];

  // Intensity color map (GitHub dark style with indigo/emerald accent)
  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 1:
        return 'bg-emerald-900/50 dark:bg-emerald-950/70 border-emerald-800/60';
      case 2:
        return 'bg-emerald-700/60 dark:bg-emerald-800/80 border-emerald-600';
      case 3:
        return 'bg-emerald-500 text-white dark:bg-emerald-600 border-emerald-400';
      case 4:
        return 'bg-emerald-400 text-slate-900 dark:bg-emerald-400 border-emerald-300';
      default:
        return 'bg-slate-100 dark:bg-surface-700/60 border-slate-200/60 dark:border-surface-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-text-primary">
            Consistency Calendar & Heatmap
          </h1>
          <p className="text-xs text-slate-500 dark:text-text-muted mt-1">
            Visual activity matrix representing genuine habit adherence over time.
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center space-x-1 bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 rounded-xl p-1 shadow-sm">
          {[
            { label: '3 Months', val: 3 },
            { label: '6 Months', val: 6 },
            { label: '12 Months', val: 12 },
          ].map((tab) => (
            <button
              key={tab.val}
              onClick={() => setMonthsView(tab.val)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                monthsView === tab.val
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-text-secondary hover:bg-slate-100 dark:hover:bg-surface-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap Card */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Matrix</CardTitle>
          {/* Legend */}
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-text-muted">
            <span>Less</span>
            <div className="flex space-x-1">
              <span className="w-3.5 h-3.5 rounded-sm bg-slate-100 dark:bg-surface-700 border border-slate-200 dark:border-surface-600" />
              <span className="w-3.5 h-3.5 rounded-sm bg-emerald-900/50 border border-emerald-800" />
              <span className="w-3.5 h-3.5 rounded-sm bg-emerald-700/60 border border-emerald-600" />
              <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500 border border-emerald-400" />
              <span className="w-3.5 h-3.5 rounded-sm bg-emerald-400 border border-emerald-300" />
            </div>
            <span>More</span>
          </div>
        </CardHeader>

        {isLoadingHeatmap ? (
          <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
            Generating heatmap data...
          </div>
        ) : (
          <div className="overflow-x-auto pb-4 pt-2">
            <div className="flex flex-wrap gap-1.5 max-w-full">
              {heatmap.map((cell) => {
                const isSelected = cell.date === selectedDate;
                return (
                  <button
                    key={cell.date}
                    onClick={() => setSelectedDate(cell.date)}
                    className={cn(
                      'w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm border transition-transform relative group',
                      getIntensityColor(cell.intensity),
                      isSelected && 'ring-2 ring-indigo-500 scale-125 z-10'
                    )}
                    title={`${cell.date}: ${cell.completedCount}/${cell.scheduledCount} (${cell.rate}%)`}
                  />
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-text-dim mt-3">
              Tip: Click any cell to inspect scheduled habits and completion notes for that date below.
            </p>
          </div>
        )}
      </Card>

      {/* Selected Date Drilldown */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Habits on {selectedDate}</CardTitle>
            <p className="text-xs text-slate-500 dark:text-text-muted mt-0.5">
              Detailed check-in records for the selected calendar day.
            </p>
          </div>
          <Link to={`/today`}>
            <Button size="xs" variant="outline">
              Open Daily Tracker
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </CardHeader>

        {isLoadingDrilldown ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading date details...</div>
        ) : drilldownHabits.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No habits were scheduled for {selectedDate}.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-surface-700/60">
            {drilldownHabits.map(({ habit, log, isCompleted, isPartial, isSkipped }) => (
              <div key={habit._id} className="py-3 px-2 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <span
                    className={cn(
                      'w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px] font-bold',
                      isCompleted
                        ? 'bg-emerald-500'
                        : isPartial
                        ? 'bg-amber-500'
                        : isSkipped
                        ? 'bg-rose-500'
                        : 'bg-slate-300 dark:bg-surface-600'
                    )}
                  >
                    {isCompleted ? '✓' : isPartial ? '~' : isSkipped ? '✕' : '—'}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-text-primary">
                      {habit.name}
                    </span>
                    {log?.note && (
                      <p className="text-slate-500 dark:text-text-muted mt-0.5 italic">
                        &ldquo;{log.note}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge variant="default" className="text-[10px] uppercase font-mono">
                    {habit.category}
                  </Badge>
                  <Badge
                    variant={
                      isCompleted ? 'success' : isPartial ? 'warning' : isSkipped ? 'danger' : 'default'
                    }
                  >
                    {isCompleted ? 'Completed' : isPartial ? 'Partial' : isSkipped ? 'Skipped' : 'Unlogged'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default CalendarPage;
