import { Habit } from '../../models/Habit.js';
import { HabitLog } from '../../models/HabitLog.js';
import { ApiError } from '../../utils/ApiError.js';
import {
  calculateOverviewAnalytics,
  calculateHeatmapData,
} from '../../services/analytics.service.js';
import { generateInsights } from '../../services/insight.service.js';
import { calculateHabitStreak } from '../../services/streak.service.js';
import { isHabitScheduledOnDate } from '../../services/habitSchedule.service.js';
import {
  getLocalDateString as getLocalStr,
  getDateRangeForPeriod as getPeriodDates,
  addDays as addLocalDays,
  getDateRangeArray as getRangeArray,
} from '../../utils/dateUtils.js';

export const getOverview = async (userId, userTimezone = 'UTC', query = {}) => {
  const localToday = getLocalStr(userTimezone);
  let { startDate, endDate, period } = query;

  if (period) {
    const range = getPeriodDates(period, localToday);
    startDate = range.startDate;
    endDate = range.endDate;
  } else if (!startDate || !endDate) {
    const range = getPeriodDates('30d', localToday);
    startDate = range.startDate;
    endDate = range.endDate;
  }

  const habits = await Habit.find({ userId });
  const logs = await HabitLog.find({
    userId,
    localDate: { $gte: startDate, $lte: endDate },
  });

  // Calculate full lifetime logs for streaks
  const allLogs = await HabitLog.find({ userId });

  const analytics = calculateOverviewAnalytics(habits, allLogs, startDate, endDate, localToday);

  return {
    period: period || 'custom',
    startDate,
    endDate,
    today: localToday,
    ...analytics,
  };
};

export const getHeatmap = async (userId, userTimezone = 'UTC', months = 6) => {
  const localToday = getLocalStr(userTimezone);
  const daysBack = months === 12 ? 365 : months === 3 ? 90 : 180;
  const startDate = addLocalDays(localToday, -daysBack);
  const endDate = localToday;

  const habits = await Habit.find({ userId });
  const logs = await HabitLog.find({
    userId,
    localDate: { $gte: startDate, $lte: endDate },
  });

  const heatmap = calculateHeatmapData(habits, logs, startDate, endDate);

  return {
    months,
    startDate,
    endDate,
    heatmap,
  };
};

export const getHabitAnalytics = async (userId, habitId, userTimezone = 'UTC', query = {}) => {
  const habit = await Habit.findOne({ _id: habitId, userId });
  if (!habit) throw new ApiError(404, 'Habit not found');

  const localToday = getLocalStr(userTimezone);
  let { startDate, endDate, period } = query;

  if (period) {
    const range = getPeriodDates(period, localToday);
    startDate = range.startDate;
    endDate = range.endDate;
  } else if (!startDate || !endDate) {
    const range = getPeriodDates('30d', localToday);
    startDate = range.startDate;
    endDate = range.endDate;
  }

  const allLogs = await HabitLog.find({ userId, habitId }).sort({ localDate: 1 });
  const streakInfo = calculateHabitStreak(habit, allLogs, localToday);

  const rangeDates = getRangeArray(startDate, endDate);
  const logMap = new Map(allLogs.map((l) => [l.localDate, l]));

  let scheduledOpportunities = 0;
  let fullCompletions = 0;
  let minimumCompletions = 0;
  let partialCompletions = 0;
  let skippedCompletions = 0;
  let totalTimeOrQuantity = 0;

  const trendData = [];
  const weekdayCounts = [
    { day: 1, name: 'Mon', scheduled: 0, completed: 0 },
    { day: 2, name: 'Tue', scheduled: 0, completed: 0 },
    { day: 3, name: 'Wed', scheduled: 0, completed: 0 },
    { day: 4, name: 'Thu', scheduled: 0, completed: 0 },
    { day: 5, name: 'Fri', scheduled: 0, completed: 0 },
    { day: 6, name: 'Sat', scheduled: 0, completed: 0 },
    { day: 0, name: 'Sun', scheduled: 0, completed: 0 },
  ];

  for (const dateStr of rangeDates) {
    const isScheduled = isHabitScheduledOnDate(habit, dateStr);
    const log = logMap.get(dateStr) || null;

    if (isScheduled) {
      scheduledOpportunities += 1;
      const dow = new Date(Date.UTC(
        ...dateStr.split('-').map((v, i) => (i === 1 ? Number(v) - 1 : Number(v)))
      )).getUTCDay();

      const wd = weekdayCounts.find((w) => w.day === dow);
      if (wd) wd.scheduled += 1;

      if (log) {
        if (log.status === 'completed' || log.completionType === 'full') {
          fullCompletions += 1;
          if (wd) wd.completed += 1;
        } else if (habit.minimumVersion?.enabled && log.completionType === 'minimum') {
          minimumCompletions += 1;
          if (wd) wd.completed += 1;
        } else if (log.status === 'partial') {
          partialCompletions += 1;
        } else if (log.status === 'skipped') {
          skippedCompletions += 1;
        }

        if (typeof log.value === 'number') {
          totalTimeOrQuantity += log.value;
        }
      }
    }

    trendData.push({
      date: dateStr,
      isScheduled,
      status: log?.status || (isScheduled ? 'missed' : 'not_scheduled'),
      completionType: log?.completionType || null,
      value: log?.value || 0,
    });
  }

  const totalSuccessful = fullCompletions + minimumCompletions;
  const completionRate =
    scheduledOpportunities > 0
      ? Math.round((totalSuccessful / scheduledOpportunities) * 100)
      : 0;

  return {
    habit,
    metrics: {
      scheduledOpportunities,
      fullCompletions,
      minimumCompletions,
      partialCompletions,
      skippedCompletions,
      completionRate,
      currentStreak: streakInfo.currentStreak,
      longestStreak: streakInfo.longestStreak,
      totalCompletions: streakInfo.totalCompletions,
      totalInvested: totalTimeOrQuantity,
      unit: habit.target?.unit || '',
    },
    trendData,
    weekdayPerformance: weekdayCounts.map((w) => ({
      ...w,
      rate: w.scheduled > 0 ? Math.round((w.completed / w.scheduled) * 100) : 0,
    })),
  };
};

export const getInsights = async (userId, userTimezone = 'UTC') => {
  const localToday = getLocalStr(userTimezone);
  const habits = await Habit.find({ userId });
  const logs = await HabitLog.find({ userId }).sort({ localDate: -1 });

  return generateInsights(habits, logs, localToday);
};
