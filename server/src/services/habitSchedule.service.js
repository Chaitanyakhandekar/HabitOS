import { getDayOfWeek, isValidDateString } from '../utils/dateUtils.js';

/**
 * Determines whether a habit is scheduled on a specific calendar date (YYYY-MM-DD)
 * 
 * @param {Object} habit - Habit Mongoose doc or plain object
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @returns {boolean}
 */
export const isHabitScheduledOnDate = (habit, dateStr) => {
  if (!isValidDateString(dateStr)) return false;

  // 1. Boundary checks: Start date and End date
  if (dateStr < habit.startDate) return false;
  if (habit.endDate && dateStr > habit.endDate) return false;

  // 2. Pause intervals: check if date falls within any pause period
  if (Array.isArray(habit.pauseHistory) && habit.pauseHistory.length > 0) {
    for (const interval of habit.pauseHistory) {
      if (interval.pausedAt && dateStr >= interval.pausedAt) {
        // If not resumed yet, or date is before resume date, it was paused
        if (!interval.resumedAt || dateStr < interval.resumedAt) {
          return false;
        }
      }
    }
  }

  // 3. Resolve frequency config (check scheduleHistory for historical changes if present)
  let frequency = habit.frequency || { type: 'everyday' };
  if (Array.isArray(habit.scheduleHistory) && habit.scheduleHistory.length > 0) {
    // Sort schedule history descending by effectiveDate
    const sortedHistory = [...habit.scheduleHistory].sort((a, b) => 
      b.effectiveDate.localeCompare(a.effectiveDate)
    );
    // Find the applicable historical configuration
    const match = sortedHistory.find((entry) => dateStr >= entry.effectiveDate);
    if (match && match.frequency) {
      frequency = match.frequency;
    }
  }

  const dayOfWeek = getDayOfWeek(dateStr); // 0=Sun, 1=Mon, ..., 6=Sat

  // 4. Frequency evaluation
  switch (frequency.type) {
    case 'everyday':
      return true;

    case 'weekdays':
      // Monday(1) through Friday(5)
      return dayOfWeek >= 1 && dayOfWeek <= 5;

    case 'specific_days':
      if (Array.isArray(frequency.days)) {
        return frequency.days.includes(dayOfWeek);
      }
      return false;

    case 'weekly_target':
      // If specific days are also provided, match against them; otherwise every day is an opportunity
      if (Array.isArray(frequency.days) && frequency.days.length > 0) {
        return frequency.days.includes(dayOfWeek);
      }
      return true;

    default:
      return true;
  }
};

/**
 * Filter a list of habits to only those scheduled on a given local date
 * @param {Array} habits 
 * @param {string} dateStr 
 * @returns {Array}
 */
export const getScheduledHabitsForDate = (habits, dateStr) => {
  return habits.filter((habit) => isHabitScheduledOnDate(habit, dateStr));
};
