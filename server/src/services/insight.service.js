import { isHabitScheduledOnDate } from './habitSchedule.service.js';
import { addDays, getDateRangeArray } from '../utils/dateUtils.js';

/**
 * Generates rule-based, data-driven behavioral insights from actual user logs
 * 
 * @param {Array<Object>} habits 
 * @param {Array<Object>} logs 
 * @param {string} todayDateStr 
 * @returns {Array<{ id: string, type: string, title: string, description: string, variant: 'positive'|'warning'|'info' }>}
 */
export const generateInsights = (habits, logs, todayDateStr) => {
  const insights = [];
  if (!habits || habits.length === 0 || !logs || logs.length === 0) {
    return insights;
  }

  // Quick lookup maps
  const logMap = new Map();
  for (const log of logs) {
    logMap.set(`${log.localDate}:${String(log.habitId)}`, log);
  }

  // 1. Check workload: number of active habits scheduled today
  const activeHabits = habits.filter((h) => h.status === 'active');
  const todayScheduled = activeHabits.filter((h) => isHabitScheduledOnDate(h, todayDateStr));
  if (todayScheduled.length >= 8) {
    insights.push({
      id: 'workload_high',
      type: 'workload',
      title: 'High Daily Workload',
      description: `You have ${todayScheduled.length} habits scheduled today. Behavioral research suggests focusing on 3 to 5 keystone habits produces higher long-term adherence.`,
      variant: 'info',
    });
  }

  // 2. Day-of-week performance analysis over the past 30 days
  const past30Start = addDays(todayDateStr, -29);
  const past30Dates = getDateRangeArray(past30Start, todayDateStr);

  const weekdayStats = [
    { day: 1, name: 'Monday', scheduled: 0, completed: 0 },
    { day: 2, name: 'Tuesday', scheduled: 0, completed: 0 },
    { day: 3, name: 'Wednesday', scheduled: 0, completed: 0 },
    { day: 4, name: 'Thursday', scheduled: 0, completed: 0 },
    { day: 5, name: 'Friday', scheduled: 0, completed: 0 },
    { day: 6, name: 'Saturday', scheduled: 0, completed: 0 },
    { day: 0, name: 'Sunday', scheduled: 0, completed: 0 },
  ];

  let totalScheduled30 = 0;
  let totalCompleted30 = 0;

  for (const dateStr of past30Dates) {
    const dow = new Date(Date.UTC(
      ...dateStr.split('-').map((v, i) => (i === 1 ? Number(v) - 1 : Number(v)))
    )).getUTCDay();

    const stat = weekdayStats.find((s) => s.day === dow);

    for (const habit of activeHabits) {
      if (isHabitScheduledOnDate(habit, dateStr)) {
        totalScheduled30 += 1;
        if (stat) stat.scheduled += 1;

        const log = logMap.get(`${dateStr}:${String(habit._id)}`);
        if (
          log &&
          (log.status === 'completed' ||
            log.completionType === 'full' ||
            (habit.minimumVersion?.enabled && log.completionType === 'minimum'))
        ) {
          totalCompleted30 += 1;
          if (stat) stat.completed += 1;
        }
      }
    }
  }

  // Only run weekday comparisons if there's sufficient data (at least 15 scheduled opportunities)
  if (totalScheduled30 >= 15) {
    const validDays = weekdayStats
      .filter((s) => s.scheduled >= 3)
      .map((s) => ({
        ...s,
        rate: Math.round((s.completed / s.scheduled) * 100),
      }))
      .sort((a, b) => b.rate - a.rate);

    if (validDays.length >= 3) {
      const bestDay = validDays[0];
      const worstDay = validDays[validDays.length - 1];

      if (bestDay.rate >= 75) {
        insights.push({
          id: 'best_day',
          type: 'consistency',
          title: `Strongest Day: ${bestDay.name}`,
          description: `You complete ${bestDay.rate}% of scheduled habits on ${bestDay.name}s over the past 30 days.`,
          variant: 'positive',
        });
      }

      if (worstDay.rate <= 50 && bestDay.rate - worstDay.rate >= 25) {
        insights.push({
          id: 'weakest_day',
          type: 'improvement',
          title: `Potential Blind Spot: ${worstDay.name}`,
          description: `Completion drops to ${worstDay.rate}% on ${worstDay.name}s. Consider planning lighter routines or using minimum versions on this day.`,
          variant: 'warning',
        });
      }
    }
  }

  // 3. Habit-specific momentum and declining habit identification
  for (const habit of activeHabits) {
    // Check recent 7 scheduled opportunities for this habit
    const recentScheduledDates = [];
    let curDate = todayDateStr;
    let lookbackCount = 0;

    while (recentScheduledDates.length < 7 && lookbackCount < 30) {
      if (isHabitScheduledOnDate(habit, curDate)) {
        recentScheduledDates.push(curDate);
      }
      curDate = addDays(curDate, -1);
      lookbackCount += 1;
    }

    if (recentScheduledDates.length >= 5) {
      const recentCompletions = recentScheduledDates.filter((dateStr) => {
        const log = logMap.get(`${dateStr}:${String(habit._id)}`);
        return (
          log &&
          (log.status === 'completed' ||
            log.completionType === 'full' ||
            (habit.minimumVersion?.enabled && log.completionType === 'minimum'))
        );
      }).length;

      const recentRate = (recentCompletions / recentScheduledDates.length) * 100;

      // Declining habit warning
      if (recentRate <= 25 && recentScheduledDates.length >= 5) {
        insights.push({
          id: `declining_${habit._id}`,
          type: 'declining',
          title: `${habit.name} Needs Attention`,
          description: `Completed only ${recentCompletions} of the last ${recentScheduledDates.length} scheduled sessions. Try activating the minimum version to lower resistance.`,
          variant: 'warning',
        });
      }
      // Top performing habit
      else if (recentRate >= 90 && recentScheduledDates.length >= 6) {
        insights.push({
          id: `strong_${habit._id}`,
          type: 'streak',
          title: `High Consistency: ${habit.name}`,
          description: `Maintained a ${(recentRate).toFixed(0)}% completion rate over the last ${recentScheduledDates.length} scheduled days!`,
          variant: 'positive',
        });
      }
    }
  }

  // 4. Recovery detection: Did user miss 2+ scheduled opportunities and then complete the most recent one?
  for (const habit of activeHabits) {
    const last3Scheduled = [];
    let curDate = todayDateStr;
    let lookback = 0;

    while (last3Scheduled.length < 3 && lookback < 20) {
      if (isHabitScheduledOnDate(habit, curDate)) {
        last3Scheduled.push(curDate);
      }
      curDate = addDays(curDate, -1);
      lookback += 1;
    }

    if (last3Scheduled.length === 3) {
      const [day1, day2, day3] = last3Scheduled; // day1 is most recent
      const log1 = logMap.get(`${day1}:${String(habit._id)}`);
      const log2 = logMap.get(`${day2}:${String(habit._id)}`);
      const log3 = logMap.get(`${day3}:${String(habit._id)}`);

      const c1 = log1 && (log1.status === 'completed' || log1.completionType === 'full' || (habit.minimumVersion?.enabled && log1.completionType === 'minimum'));
      const c2 = log2 && (log2.status === 'completed' || log2.completionType === 'full');
      const c3 = log3 && (log3.status === 'completed' || log3.completionType === 'full');

      if (c1 && !c2 && !c3) {
        insights.push({
          id: `recovery_${habit._id}`,
          type: 'recovery',
          title: `Great Recovery on ${habit.name}`,
          description: `You successfully completed ${habit.name} after missing previous sessions. The ability to reset after misses is the key to lasting habits.`,
          variant: 'positive',
        });
      }
    }
  }

  // Limit to at most 4 concise, relevant insights to prevent information overload
  return insights.slice(0, 4);
};
