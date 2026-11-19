import { isHabitScheduledOnDate } from './habitSchedule.service.js';
import { addDays, getDateRangeArray } from '../utils/dateUtils.js';

/**
 * Calculates current streak and longest streak for an individual habit
 * 
 * @param {Object} habit 
 * @param {Map<string, Object>|Array<Object>} logs - Habit logs map or array
 * @param {string} todayDateStr - Current local date (YYYY-MM-DD)
 * @returns {{ currentStreak: number, longestStreak: number, totalCompletions: number }}
 */
export const calculateHabitStreak = (habit, logs, todayDateStr) => {
  // Build a quick lookup map by localDate if not already a Map
  let logMap;
  if (logs instanceof Map) {
    logMap = logs;
  } else if (Array.isArray(logs)) {
    logMap = new Map();
    for (const log of logs) {
      logMap.set(log.localDate, log);
    }
  } else {
    logMap = new Map();
  }

  const startDate = habit.startDate;
  if (startDate > todayDateStr) {
    return { currentStreak: 0, longestStreak: 0, totalCompletions: 0 };
  }

  // Generate all scheduled opportunities from startDate up to todayDateStr
  const allDates = getDateRangeArray(startDate, todayDateStr);
  const scheduledDates = allDates.filter((dateStr) =>
    isHabitScheduledOnDate(habit, dateStr)
  );

  if (scheduledDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalCompletions: 0 };
  }

  let longestStreak = 0;
  let tempStreak = 0;
  let totalCompletions = 0;

  // Track streaks across historical scheduled opportunities
  for (const dateStr of scheduledDates) {
    const log = logMap.get(dateStr);
    const isCompleted = log && (log.status === 'completed' || log.completionType === 'full' || (habit.minimumVersion?.enabled && log.completionType === 'minimum'));

    if (isCompleted) {
      tempStreak += 1;
      totalCompletions += 1;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      // Missed or partial/skipped
      tempStreak = 0;
    }
  }

  // Calculate CURRENT streak walking backwards from today or yesterday
  let currentStreak = 0;
  const isTodayScheduled = isHabitScheduledOnDate(habit, todayDateStr);
  const todayLog = logMap.get(todayDateStr);
  const isTodayCompleted = todayLog && (todayLog.status === 'completed' || todayLog.completionType === 'full' || (habit.minimumVersion?.enabled && todayLog.completionType === 'minimum'));

  let startIndex;
  if (isTodayScheduled) {
    if (isTodayCompleted) {
      // Count today and walk backwards
      startIndex = scheduledDates.length - 1;
    } else {
      // Today is still ongoing; start checking from the previous scheduled opportunity
      startIndex = scheduledDates.length - 2;
    }
  } else {
    // Today is not a scheduled day; streak is preserved from the most recent scheduled day
    startIndex = scheduledDates.length - 1;
  }

  for (let i = startIndex; i >= 0; i--) {
    const dateStr = scheduledDates[i];
    const log = logMap.get(dateStr);
    const isCompleted = log && (log.status === 'completed' || log.completionType === 'full' || (habit.minimumVersion?.enabled && log.completionType === 'minimum'));

    if (isCompleted) {
      currentStreak += 1;
    } else {
      // Break as soon as a scheduled opportunity was missed
      break;
    }
  }

  return {
    currentStreak,
    longestStreak,
    totalCompletions,
  };
};

/**
 * Calculates overall streak across all habits
 * A day is considered completed if all active habits scheduled on that day were completed.
 * 
 * @param {Array<Object>} habits 
 * @param {Array<Object>} logs 
 * @param {string} todayDateStr 
 * @returns {{ currentStreak: number, longestStreak: number }}
 */
export const calculateOverallStreak = (habits, logs, todayDateStr) => {
  if (!habits || habits.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Find the earliest start date among active habits
  const activeHabits = habits.filter((h) => h.status !== 'archived');
  if (activeHabits.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const startDates = activeHabits.map((h) => h.startDate).sort();
  const earliestStart = startDates[0];
  if (earliestStart > todayDateStr) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Group logs by localDate and habitId
  const logsByDate = new Map();
  for (const log of logs) {
    if (!logsByDate.has(log.localDate)) {
      logsByDate.set(log.localDate, new Map());
    }
    logsByDate.get(log.localDate).set(String(log.habitId), log);
  }

  const allDates = getDateRangeArray(earliestStart, todayDateStr);
  const evaluatedDates = [];

  for (const dateStr of allDates) {
    const scheduled = activeHabits.filter((h) => isHabitScheduledOnDate(h, dateStr));
    if (scheduled.length === 0) continue; // Skip rest days with no scheduled habits

    const dateLogs = logsByDate.get(dateStr) || new Map();
    const completedCount = scheduled.filter((h) => {
      const log = dateLogs.get(String(h._id));
      return log && (log.status === 'completed' || log.completionType === 'full' || (h.minimumVersion?.enabled && log.completionType === 'minimum'));
    }).length;

    // Perfect day condition: all scheduled habits completed
    const isPerfect = completedCount === scheduled.length;
    evaluatedDates.push({ dateStr, isPerfect });
  }

  if (evaluatedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  let longestStreak = 0;
  let tempStreak = 0;

  for (const entry of evaluatedDates) {
    if (entry.isPerfect) {
      tempStreak += 1;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  }

  // Current overall streak
  let currentStreak = 0;
  const lastEntry = evaluatedDates[evaluatedDates.length - 1];
  let startIndex = evaluatedDates.length - 1;

  if (lastEntry.dateStr === todayDateStr && !lastEntry.isPerfect) {
    // Today is not complete yet, inspect from yesterday's scheduled day
    startIndex = evaluatedDates.length - 2;
  }

  for (let i = startIndex; i >= 0; i--) {
    if (evaluatedDates[i].isPerfect) {
      currentStreak += 1;
    } else {
      break;
    }
  }

  return { currentStreak, longestStreak };
};
