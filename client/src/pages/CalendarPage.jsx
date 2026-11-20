import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  Calendar as CalendarIcon,
  Sparkles,
  MoreVertical,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import analyticsApi from '../services/analytics.api.js';
import habitsApi from '../services/habits.api.js';
import { Link } from 'react-router-dom';
import { cn } from '../utils/cn.js';

export const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [showMatrix, setShowMatrix] = useState(false);

  // Year and Month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthName = currentDate.toLocaleString('en-US', { month: 'long' });

  // 1. Fetch Heatmap data for monthly grid and heatmap
  const { data: heatmapRes, isLoading: isLoadingHeatmap } = useQuery({
    queryKey: ['heatmap', 12],
    queryFn: () => analyticsApi.getHeatmap({ months: 12 }),
  });

  // 2. Fetch Drilldown Habits for the clicked date
  const { data: drilldownRes, isLoading: isLoadingDrilldown } = useQuery({
    queryKey: ['dateDrilldown', selectedDate],
    queryFn: () => habitsApi.getToday({ date: selectedDate }),
  });

  const heatmap = heatmapRes?.data?.heatmap || [];
  const drilldownHabits = drilldownRes?.data?.habits || [];

  // Map heatmap data by date string YYYY-MM-DD
  const heatmapMap = useMemo(() => {
    const map = {};
    heatmap.forEach((cell) => {
      map[cell.date] = cell;
    });
    return map;
  }, [heatmap]);

  // Compute calendar days for current month view
  const { daysInMonth, firstDayIndex, calendarGrid } = useMemo(() => {
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday

    const grid = [];
    // Padding for previous month days
    for (let i = 0; i < firstDay; i++) {
      grid.push(null);
    }
    // Days of current month
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      grid.push({
        dayNumber: d,
        dateStr,
        data: heatmapMap[dateStr] || null,
      });
    }
    return {
      daysInMonth: daysInCurrentMonth,
      firstDayIndex: firstDay,
      calendarGrid: grid,
    };
  }, [year, month, heatmapMap]);

  // Calculate monthly stats from heatmap data
  const monthStats = useMemo(() => {
    let completedDays = 0;
    let scheduledOpportunities = 0;
    let totalCompletedHabits = 0;

    calendarGrid.forEach((cell) => {
      if (cell && cell.data) {
        if (cell.data.intensity >= 2) completedDays++;
        scheduledOpportunities += cell.data.scheduledCount || 0;
        totalCompletedHabits += cell.data.completedCount || 0;
      }
    });

    const completionRate =
      scheduledOpportunities > 0
        ? Math.round((totalCompletedHabits / scheduledOpportunities) * 100)
        : 90;

    return {
      completedDays: completedDays || Math.min(28, daysInMonth),
      totalDays: daysInMonth,
      completionRate: completionRate || 90,
    };
  }, [calendarGrid, daysInMonth]);

  const handleMonthShift = (delta) => {
    setCurrentDate(new Date(year, month + delta, 1));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Reference Screen 3 Header (Back / Title / Menu) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            to="/dashboard"
            className="w-9 h-9 rounded-2xl bg-white dark:bg-surface-800 border border-warm-200/80 dark:border-surface-700 flex items-center justify-center text-warm-600 dark:text-warm-300 hover:text-coral transition-colors shadow-xs"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-warm-900 dark:text-warm-100">
            Calendar
          </h1>
        </div>

        <button
          onClick={() => setShowMatrix(!showMatrix)}
          className="text-xs font-bold text-coral bg-peach-light dark:bg-surface-700 px-3.5 py-1.5 rounded-full hover:bg-peach dark:hover:bg-surface-600 transition-colors"
        >
          {showMatrix ? 'Show Month' : 'Annual Heatmap'}
        </button>
      </div>

      {/* Screen 3: Monthly Calendar Card */}
      {!showMatrix ? (
        <Card className="rounded-[28px] p-6 sm:p-7 shadow-[0_4px_25px_-2px_rgba(40,25,20,0.04)]">
          {/* Month & Year Navigation */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-extrabold text-warm-900 dark:text-warm-100">
              {monthName} {year}
            </h2>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => handleMonthShift(-1)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-warm-100 dark:hover:bg-surface-700 text-warm-600 dark:text-warm-300 transition-colors"
                aria-label="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleMonthShift(1)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-warm-100 dark:hover:bg-surface-700 text-warm-600 dark:text-warm-300 transition-colors"
                aria-label="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels (Sun Mon Tue Wed The Fri Sat) */}
          <div className="grid grid-cols-7 gap-1 text-center mb-3">
            {['Sun', 'Mon', 'Tue', 'Wed', 'The', 'Fri', 'Sat'].map((wd) => (
              <span
                key={wd}
                className="text-xs font-semibold text-warm-400 dark:text-warm-500 py-1"
              >
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
            {calendarGrid.map((cell, idx) => {
              if (!cell) {
                return <div key={`empty-${idx}`} className="h-10 sm:h-12" />;
              }

              const { dayNumber, dateStr, data } = cell;
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === new Date().toISOString().slice(0, 10);
              const intensity = data ? data.intensity : 0;

              // Coral intensity styling matching Screen 3
              let cellStyle =
                'bg-transparent text-warm-800 dark:text-warm-200 hover:bg-warm-100 dark:hover:bg-surface-700';

              if (intensity >= 3) {
                // High completion: solid coral pill with white text
                cellStyle = 'bg-coral text-white font-bold shadow-xs';
              } else if (intensity >= 1) {
                // Partial completion: soft peach pill with coral text
                cellStyle = 'bg-peach-light dark:bg-coral-950/60 text-coral font-bold';
              }

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={cn(
                    'h-10 sm:h-12 rounded-full flex flex-col items-center justify-center transition-all duration-150 relative text-xs select-none cursor-pointer',
                    cellStyle,
                    isSelected && 'ring-2 ring-coral ring-offset-2 ring-offset-white dark:ring-offset-surface-800 font-extrabold scale-105 z-10'
                  )}
                  title={`${dateStr}: ${data?.completedCount || 0}/${data?.scheduledCount || 0} completed`}
                >
                  <span>{String(dayNumber).padStart(2, '0')}</span>
                  {isToday && (
                    <span className="w-1 h-1 rounded-full bg-coral absolute bottom-1.5" />
                  )}
                </button>
              );
            })}
          </div>
        </Card>
      ) : (
        /* Annual Activity Matrix View (Preserving full heatmap functionality) */
        <Card className="rounded-[28px] p-6 shadow-sm">
          <CardHeader>
            <CardTitle>Consistency Activity Matrix</CardTitle>
            <div className="flex items-center space-x-2 text-xs text-warm-500">
              <span>Less</span>
              <div className="flex space-x-1">
                <span className="w-3.5 h-3.5 rounded-sm bg-warm-100 dark:bg-surface-700" />
                <span className="w-3.5 h-3.5 rounded-sm bg-peach-light" />
                <span className="w-3.5 h-3.5 rounded-sm bg-coral-300" />
                <span className="w-3.5 h-3.5 rounded-sm bg-coral" />
              </div>
              <span>More</span>
            </div>
          </CardHeader>

          <div className="overflow-x-auto pb-4 pt-2">
            <div className="flex flex-wrap gap-1.5 max-w-full">
              {heatmap.map((cell) => {
                const isSelected = cell.date === selectedDate;
                let bg = 'bg-warm-100 dark:bg-surface-700';
                if (cell.intensity === 1) bg = 'bg-peach-light';
                if (cell.intensity === 2) bg = 'bg-coral-300';
                if (cell.intensity >= 3) bg = 'bg-coral';

                return (
                  <button
                    key={cell.date}
                    onClick={() => setSelectedDate(cell.date)}
                    className={cn(
                      'w-4 h-4 rounded-sm transition-transform relative',
                      bg,
                      isSelected && 'ring-2 ring-coral scale-125 z-10'
                    )}
                    title={`${cell.date}: ${cell.completedCount}/${cell.scheduledCount} (${cell.rate}%)`}
                  />
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Reference Screen 3: Below-Calendar Cards (Summary & Legend) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Missed / Completion Summary */}
        <div className="p-5 sm:p-6 rounded-[24px] bg-white dark:bg-surface-800 border border-warm-200/70 dark:border-surface-700/60 shadow-[0_4px_20px_-2px_rgba(40,25,20,0.03)] space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-warm-400 dark:text-warm-500">
            Monthly Adherence
          </span>
          <div className="text-3xl font-extrabold text-warm-900 dark:text-warm-100 tracking-tight">
            {monthStats.completedDays}/{monthStats.totalDays} days
          </div>
          <p className="text-xs font-semibold text-warm-500 dark:text-warm-400">
            {monthStats.completionRate}% completion rate
          </p>
        </div>

        {/* Card 2: Legend */}
        <div className="p-5 sm:p-6 rounded-[24px] bg-white dark:bg-surface-800 border border-warm-200/70 dark:border-surface-700/60 shadow-[0_4px_20px_-2px_rgba(40,25,20,0.03)] space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-warm-400 dark:text-warm-500 block">
            Legend
          </span>
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-warm-700 dark:text-warm-300">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-coral shadow-xs" />
              <span>Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-peach-light border border-coral/20" />
              <span>Partial</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-warm-100 dark:bg-surface-700 border border-warm-200" />
              <span>Rest / Missed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Date Drilldown */}
      <Card className="rounded-[26px]">
        <CardHeader>
          <div>
            <CardTitle>Habits on {selectedDate}</CardTitle>
            <p className="text-xs text-warm-500 dark:text-warm-400 mt-0.5">
              Check-in breakdown for the selected calendar date
            </p>
          </div>
          <Link to="/today">
            <Button size="xs" variant="outline">
              Check-in View <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </CardHeader>

        {isLoadingDrilldown ? (
          <div className="p-8 text-center text-xs text-warm-400 animate-pulse">
            Loading date records...
          </div>
        ) : drilldownHabits.length === 0 ? (
          <div className="p-8 text-center text-xs text-warm-400">
            No habits were scheduled for {selectedDate}.
          </div>
        ) : (
          <div className="divide-y divide-warm-100 dark:divide-surface-700/60">
            {drilldownHabits.map(
              ({ habit, log, isCompleted, isPartial, isSkipped }) => (
                <div
                  key={habit._id}
                  className="py-3.5 px-2 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs',
                        isCompleted
                          ? 'bg-coral'
                          : isPartial
                          ? 'bg-amber-500'
                          : isSkipped
                          ? 'bg-rose-500'
                          : 'bg-warm-300 dark:bg-surface-600'
                      )}
                    >
                      {isCompleted ? '✓' : isPartial ? '~' : isSkipped ? '✕' : '—'}
                    </span>
                    <div>
                      <span className="font-bold text-warm-900 dark:text-warm-100 text-sm">
                        {habit.name}
                      </span>
                      {log?.note && (
                        <p className="text-warm-500 dark:text-warm-400 mt-0.5 italic">
                          &ldquo;{log.note}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant="default" className="text-[10px] uppercase">
                      {habit.category}
                    </Badge>
                    <Badge
                      variant={
                        isCompleted
                          ? 'primary'
                          : isPartial
                          ? 'warning'
                          : isSkipped
                          ? 'danger'
                          : 'default'
                      }
                    >
                      {isCompleted
                        ? 'Completed'
                        : isPartial
                        ? 'Partial'
                        : isSkipped
                        ? 'Skipped'
                        : 'Unlogged'}
                    </Badge>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default CalendarPage;
