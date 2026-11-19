import { Habit } from '../../models/Habit.js';
import { HabitLog } from '../../models/HabitLog.js';
import { ApiError } from '../../utils/ApiError.js';
import { isHabitScheduledOnDate } from '../../services/habitSchedule.service.js';
import { calculateHabitStreak } from '../../services/streak.service.js';
import { getLocalDateString } from '../../utils/dateUtils.js';

export const createHabit = async (userId, data, userTimezone = 'UTC') => {
  const localToday = getLocalDateString(userTimezone);

  const habit = await Habit.create({
    ...data,
    userId,
    status: 'active',
    scheduleHistory: [
      {
        effectiveDate: data.startDate || localToday,
        frequency: data.frequency,
        target: data.target,
      },
    ],
  });

  return habit;
};

export const getUserHabits = async (userId, query = {}, userTimezone = 'UTC') => {
  const { status, category, search } = query;
  const filter = { userId };

  if (status && status !== 'all') {
    filter.status = status;
  }
  if (category && category !== 'all') {
    filter.category = category;
  }
  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  const habits = await Habit.find(filter).sort({ createdAt: -1 });
  const localToday = getLocalDateString(userTimezone);

  // Fetch all logs for these habits to calculate current streaks
  const habitIds = habits.map((h) => h._id);
  const logs = await HabitLog.find({ userId, habitId: { $in: habitIds } });

  const logsByHabit = new Map();
  for (const log of logs) {
    const hid = String(log.habitId);
    if (!logsByHabit.has(hid)) logsByHabit.set(hid, []);
    logsByHabit.get(hid).push(log);
  }

  return habits.map((habit) => {
    const habitLogs = logsByHabit.get(String(habit._id)) || [];
    const streakInfo = calculateHabitStreak(habit, habitLogs, localToday);
    const isScheduledToday = isHabitScheduledOnDate(habit, localToday);

    return {
      ...habit.toObject(),
      currentStreak: streakInfo.currentStreak,
      longestStreak: streakInfo.longestStreak,
      totalCompletions: streakInfo.totalCompletions,
      isScheduledToday,
    };
  });
};

export const getHabitById = async (userId, habitId, userTimezone = 'UTC') => {
  const habit = await Habit.findOne({ _id: habitId, userId });
  if (!habit) throw new ApiError(404, 'Habit not found');

  const localToday = getLocalDateString(userTimezone);
  const logs = await HabitLog.find({ userId, habitId }).sort({ localDate: -1 });

  const streakInfo = calculateHabitStreak(habit, logs, localToday);

  // Calculate completion rate
  let scheduledCount = 0;
  let completedCount = 0;
  for (const log of logs) {
    if (log.status === 'completed' || log.completionType === 'full' || (habit.minimumVersion?.enabled && log.completionType === 'minimum')) {
      completedCount += 1;
    }
  }

  return {
    habit,
    streakInfo,
    logs: logs.slice(0, 50), // Return recent 50 logs for history view
  };
};

export const updateHabit = async (userId, habitId, updates, userTimezone = 'UTC') => {
  const habit = await Habit.findOne({ _id: habitId, userId });
  if (!habit) throw new ApiError(404, 'Habit not found');

  const localToday = getLocalDateString(userTimezone);

  // Check if frequency or target changed: record in scheduleHistory to preserve past analytics
  const frequencyChanged = updates.frequency && JSON.stringify(updates.frequency) !== JSON.stringify(habit.frequency);
  const targetChanged = updates.target && JSON.stringify(updates.target) !== JSON.stringify(habit.target);

  if (frequencyChanged || targetChanged) {
    habit.scheduleHistory.push({
      effectiveDate: localToday,
      frequency: updates.frequency || habit.frequency,
      target: updates.target || habit.target,
    });
  }

  Object.assign(habit, updates);
  await habit.save();
  return habit;
};

export const pauseHabit = async (userId, habitId, userTimezone = 'UTC') => {
  const habit = await Habit.findOne({ _id: habitId, userId });
  if (!habit) throw new ApiError(404, 'Habit not found');

  if (habit.status === 'paused') {
    throw new ApiError(400, 'Habit is already paused');
  }

  const localToday = getLocalDateString(userTimezone);
  habit.status = 'paused';
  habit.pauseHistory.push({
    pausedAt: localToday,
    resumedAt: null,
  });

  await habit.save();
  return habit;
};

export const resumeHabit = async (userId, habitId, userTimezone = 'UTC') => {
  const habit = await Habit.findOne({ _id: habitId, userId });
  if (!habit) throw new ApiError(404, 'Habit not found');

  if (habit.status !== 'paused') {
    throw new ApiError(400, 'Habit is not currently paused');
  }

  const localToday = getLocalDateString(userTimezone);
  habit.status = 'active';

  // Close the active pause interval
  const lastPause = habit.pauseHistory[habit.pauseHistory.length - 1];
  if (lastPause && !lastPause.resumedAt) {
    lastPause.resumedAt = localToday;
  }

  await habit.save();
  return habit;
};

export const archiveHabit = async (userId, habitId) => {
  const habit = await Habit.findOne({ _id: habitId, userId });
  if (!habit) throw new ApiError(404, 'Habit not found');

  habit.status = 'archived';
  await habit.save();
  return habit;
};

export const deleteHabit = async (userId, habitId) => {
  const habit = await Habit.findOne({ _id: habitId, userId });
  if (!habit) throw new ApiError(404, 'Habit not found');

  // Cascade delete associated logs
  await HabitLog.deleteMany({ userId, habitId });
  await Habit.findByIdAndDelete(habitId);

  return { success: true };
};

export const getTodayHabits = async (userId, userTimezone = 'UTC', requestedDate = null) => {
  const localDate = requestedDate || getLocalDateString(userTimezone);

  // Fetch active habits (paused habits don't count for today's scheduled list)
  const habits = await Habit.find({ userId, status: { $ne: 'archived' } });
  const scheduledHabits = habits.filter((habit) =>
    habit.status === 'active' && isHabitScheduledOnDate(habit, localDate)
  );

  // Fetch logs for this date
  const habitIds = scheduledHabits.map((h) => h._id);
  const logs = await HabitLog.find({ userId, habitId: { $in: habitIds }, localDate });
  const logMap = new Map(logs.map((l) => [String(l.habitId), l]));

  // Also fetch all habit logs for streak calculations
  const allLogs = await HabitLog.find({ userId, habitId: { $in: habitIds } });
  const logsByHabit = new Map();
  for (const l of allLogs) {
    const hid = String(l.habitId);
    if (!logsByHabit.has(hid)) logsByHabit.set(hid, []);
    logsByHabit.get(hid).push(l);
  }

  const result = scheduledHabits.map((habit) => {
    const habitLogs = logsByHabit.get(String(habit._id)) || [];
    const streakInfo = calculateHabitStreak(habit, habitLogs, localDate);
    const log = logMap.get(String(habit._id)) || null;

    return {
      habit,
      log,
      currentStreak: streakInfo.currentStreak,
      isCompleted: log ? (log.status === 'completed' || log.completionType === 'full' || (habit.minimumVersion?.enabled && log.completionType === 'minimum')) : false,
      isPartial: log ? (log.status === 'partial' || log.completionType === 'partial') : false,
      isSkipped: log ? (log.status === 'skipped' || log.completionType === 'skip') : false,
    };
  });

  return {
    date: localDate,
    habits: result,
  };
};

export const getTodaySummary = async (userId, userTimezone = 'UTC', requestedDate = null) => {
  const { date, habits } = await getTodayHabits(userId, userTimezone, requestedDate);

  const totalScheduled = habits.length;
  const completed = habits.filter((h) => h.isCompleted).length;
  const partial = habits.filter((h) => h.isPartial).length;
  const skipped = habits.filter((h) => h.isSkipped).length;
  const remaining = Math.max(0, totalScheduled - (completed + partial + skipped));

  const completionRate = totalScheduled > 0 ? Math.round((completed / totalScheduled) * 100) : 0;
  const score = totalScheduled > 0 ? Math.round(((completed + partial * 0.5) / totalScheduled) * 100) : 0;

  return {
    date,
    totalScheduled,
    completed,
    partial,
    skipped,
    remaining,
    completionRate,
    score,
  };
};
