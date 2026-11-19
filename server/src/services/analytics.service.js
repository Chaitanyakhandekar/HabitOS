import { isHabitScheduledOnDate } from './habitSchedule.service.js';
import { calculateHabitStreak, calculateOverallStreak } from './streak.service.js';
import {
  getDateRangeArray,
  getDayOfWeek,
  getDayName,
  isValidDateString,
} from '../utils/dateUtils.js';

/**
 * Calculates full overview analytics for a user within a date range
 * 
 * @param {Array<Object>} habits - User's habits
 * @param {Array<Object>} logs - User's habit logs
 * @param {string} startDate - 'YYYY-MM-DD'
 * @param {string} endDate - 'YYYY-MM-DD'
 * @param {string} todayDateStr - 'YYYY-MM-DD'
 * @returns {Object}
 */
export const calculateOverviewAnalytics = (habits, logs, startDate, endDate, todayDateStr) => {
  // Map logs by `YYYY-MM-DD:habitId`
  const logMap = new Map();
  // Map logs by `habitId` -> array of logs (for habit streak calculation)
  const logsByHabit = new Map();

  for (const log of logs) {
    const key = `${log.localDate}:${String(log.habitId)}`;
    logMap.set(key, log);

    const habitIdStr = String(log.habitId);
    if (!logsByHabit.has(habitIdStr)) {
      logsByHabit.set(habitIdStr, []);
    }
    logsByHabit.get(habitIdStr).push(log);
  }

  const dateList = getDateRangeArray(startDate, endDate);

  let totalScheduledOpportunities = 0;
  let totalCompleted = 0;
  let totalMinimum = 0;
  let totalPartial = 0;
  let totalSkipped = 0;
  let perfectDays = 0;
  let daysWithScheduled = 0;

  const trendData = [];
  const weekdayStats = [
    { day: 1, name: 'Mon', scheduled: 0, completed: 0 },
    { day: 2, name: 'Tue', scheduled: 0, completed: 0 },
    { day: 3, name: 'Wed', scheduled: 0, completed: 0 },
    { day: 4, name: 'Thu', scheduled: 0, completed: 0 },
    { day: 5, name: 'Fri', scheduled: 0, completed: 0 },
    { day: 6, name: 'Sat', scheduled: 0, completed: 0 },
    { day: 0, name: 'Sun', scheduled: 0, completed: 0 },
  ];

  // Daily evaluations
  for (const dateStr of dateList) {
    let dayScheduled = 0;
    let dayCompleted = 0;
    let dayPartial = 0;
    let daySkipped = 0;

    for (const habit of habits) {
      if (isHabitScheduledOnDate(habit, dateStr)) {
        dayScheduled += 1;
        totalScheduledOpportunities += 1;

        const log = logMap.get(`${dateStr}:${String(habit._id)}`);
        if (log) {
          if (log.status === 'completed' || log.completionType === 'full') {
            dayCompleted += 1;
            totalCompleted += 1;
          } else if (habit.minimumVersion?.enabled && log.completionType === 'minimum') {
            dayCompleted += 1;
            totalCompleted += 1;
            totalMinimum += 1;
          } else if (log.status === 'partial' || log.completionType === 'partial') {
            dayPartial += 1;
            totalPartial += 1;
          } else if (log.status === 'skipped' || log.completionType === 'skip') {
            daySkipped += 1;
            totalSkipped += 1;
          }
        }
      }
    }

    const dayRate = dayScheduled > 0 ? Math.round((dayCompleted / dayScheduled) * 100) : 0;

    if (dayScheduled > 0) {
      daysWithScheduled += 1;
      if (dayCompleted === dayScheduled) {
        perfectDays += 1;
      }

      // Update weekday stats
      const dow = getDayOfWeek(dateStr);
      const wdStat = weekdayStats.find((w) => w.day === dow);
      if (wdStat) {
        wdStat.scheduled += dayScheduled;
        wdStat.completed += dayCompleted;
      }
    }

    trendData.push({
      date: dateStr,
      scheduled: dayScheduled,
      completed: dayCompleted,
      partial: dayPartial,
      skipped: daySkipped,
      completionRate: dayRate,
    });
  }

  // Completion rate and consistency calculation
  const completionRate =
    totalScheduledOpportunities > 0
      ? Math.round((totalCompleted / totalScheduledOpportunities) * 100)
      : 0;

  // Consistency score weights full completions at 1.0 and partial completions at 0.5
  const consistencyScore =
    totalScheduledOpportunities > 0
      ? Math.round(
          ((totalCompleted + totalPartial * 0.5) / totalScheduledOpportunities) * 100
        )
      : 0;

  const totalMissed = Math.max(
    0,
    totalScheduledOpportunities - (totalCompleted + totalPartial + totalSkipped)
  );

  // Overall streak
  const { currentStreak, longestStreak } = calculateOverallStreak(
    habits,
    logs,
    todayDateStr
  );

  // Category breakdown
  const categoryMap = new Map();
  for (const habit of habits) {
    const cat = habit.category || 'other';
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, { category: cat, scheduled: 0, completed: 0, habitsCount: 0 });
    }
    const catData = categoryMap.get(cat);
    catData.habitsCount += 1;
  }

  for (const dateStr of dateList) {
    for (const habit of habits) {
      if (isHabitScheduledOnDate(habit, dateStr)) {
        const cat = habit.category || 'other';
        const catData = categoryMap.get(cat);
        if (catData) {
          catData.scheduled += 1;
          const log = logMap.get(`${dateStr}:${String(habit._id)}`);
          if (
            log &&
            (log.status === 'completed' ||
              log.completionType === 'full' ||
              (habit.minimumVersion?.enabled && log.completionType === 'minimum'))
          ) {
            catData.completed += 1;
          }
        }
      }
    }
  }

  const categoryBreakdown = Array.from(categoryMap.values()).map((c) => ({
    ...c,
    completionRate: c.scheduled > 0 ? Math.round((c.completed / c.scheduled) * 100) : 0,
  }));

  // Habit breakdown
  const habitBreakdown = habits.map((habit) => {
    let habitScheduled = 0;
    let habitCompleted = 0;

    for (const dateStr of dateList) {
      if (isHabitScheduledOnDate(habit, dateStr)) {
        habitScheduled += 1;
        const log = logMap.get(`${dateStr}:${String(habit._id)}`);
        if (
          log &&
          (log.status === 'completed' ||
            log.completionType === 'full' ||
            (habit.minimumVersion?.enabled && log.completionType === 'minimum'))
        ) {
          habitCompleted += 1;
        }
      }
    }

    const habitLogs = logsByHabit.get(String(habit._id)) || [];
    const streakInfo = calculateHabitStreak(habit, habitLogs, todayDateStr);

    const rate = habitScheduled > 0 ? Math.round((habitCompleted / habitScheduled) * 100) : 0;

    return {
      id: habit._id,
      name: habit.name,
      category: habit.category,
      color: habit.color,
      icon: habit.icon,
      status: habit.status,
      scheduled: habitScheduled,
      completed: habitCompleted,
      completionRate: rate,
      currentStreak: streakInfo.currentStreak,
      longestStreak: streakInfo.longestStreak,
      totalLifetimeCompletions: streakInfo.totalCompletions,
    };
  });

  // Calculate weekday performance rates
  const weekdayPerformance = weekdayStats.map((w) => ({
    day: w.day,
    name: w.name,
    scheduled: w.scheduled,
    completed: w.completed,
    rate: w.scheduled > 0 ? Math.round((w.completed / w.scheduled) * 100) : 0,
  }));

  return {
    metrics: {
      totalScheduledOpportunities,
      totalCompleted,
      totalMinimum,
      totalPartial,
      totalSkipped,
      totalMissed,
      completionRate,
      consistencyScore,
      currentStreak,
      longestStreak,
      perfectDays,
      daysWithScheduled,
      activeHabitsCount: habits.filter((h) => h.status === 'active').length,
    },
    trendData,
    weekdayPerformance,
    categoryBreakdown,
    habitBreakdown,
  };
};

/**
 * Calculates Heatmap data for a user across a range of calendar dates
 * Each cell has: { date, count, scheduledCount, intensity (0-4) }
 * 
 * @param {Array<Object>} habits 
 * @param {Array<Object>} logs 
 * @param {string} startDate 
 * @param {string} endDate 
 * @returns {Array<Object>}
 */
export const calculateHeatmapData = (habits, logs, startDate, endDate) => {
  const logMap = new Map();
  for (const log of logs) {
    logMap.set(`${log.localDate}:${String(log.habitId)}`, log);
  }

  const dates = getDateRangeArray(startDate, endDate);
  const heatmap = [];

  for (const dateStr of dates) {
    let scheduledCount = 0;
    let completedCount = 0;

    for (const habit of habits) {
      if (isHabitScheduledOnDate(habit, dateStr)) {
        scheduledCount += 1;
        const log = logMap.get(`${dateStr}:${String(habit._id)}`);
        if (
          log &&
          (log.status === 'completed' ||
            log.completionType === 'full' ||
            (habit.minimumVersion?.enabled && log.completionType === 'minimum'))
        ) {
          completedCount += 1;
        }
      }
    }

    let intensity = 0;
    if (scheduledCount > 0) {
      const rate = (completedCount / scheduledCount) * 100;
      if (rate === 0) intensity = 0;
      else if (rate <= 25) intensity = 1;
      else if (rate <= 50) intensity = 2;
      else if (rate <= 75) intensity = 3;
      else intensity = 4;
    }

    heatmap.push({
      date: dateStr,
      completedCount,
      scheduledCount,
      intensity,
      rate: scheduledCount > 0 ? Math.round((completedCount / scheduledCount) * 100) : 0,
    });
  }

  return heatmap;
};
