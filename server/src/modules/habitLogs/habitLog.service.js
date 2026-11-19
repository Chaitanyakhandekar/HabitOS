import { Habit } from '../../models/Habit.js';
import { HabitLog } from '../../models/HabitLog.js';
import { Goal } from '../../models/Goal.js';
import { ApiError } from '../../utils/ApiError.js';
import { calculateHabitStreak, calculateOverallStreak } from '../../services/streak.service.js';
import { checkAndAwardAchievements } from '../../services/achievement.service.js';
import { getLocalDateString } from '../../utils/dateUtils.js';

export const logHabit = async (userId, data, userTimezone = 'UTC') => {
  const { habitId, localDate, status, value, completionType, note } = data;

  const habit = await Habit.findOne({ _id: habitId, userId });
  if (!habit) throw new ApiError(404, 'Habit not found or unauthorized');

  const targetValue = habit.target?.value || 1;
  let finalStatus = status || 'completed';
  let finalCompletionType = completionType || 'full';
  let finalValue = typeof value === 'number' ? value : targetValue;

  // Auto-determine status for numeric tracking types if not explicitly set
  if (habit.trackingType !== 'binary' && typeof value === 'number') {
    if (value >= targetValue) {
      finalStatus = 'completed';
      finalCompletionType = 'full';
    } else if (habit.minimumVersion?.enabled && value >= (habit.minimumVersion.targetValue || 1)) {
      finalStatus = 'completed';
      finalCompletionType = 'minimum';
    } else if (value > 0) {
      finalStatus = 'partial';
      finalCompletionType = 'partial';
    } else {
      finalStatus = 'skipped';
      finalCompletionType = 'skip';
    }
  } else if (completionType === 'minimum') {
    finalStatus = 'completed';
    finalCompletionType = 'minimum';
    finalValue = habit.minimumVersion?.targetValue || 1;
  }

  // Atomic upsert to avoid duplicate logs for same habit & date
  const log = await HabitLog.findOneAndUpdate(
    { userId, habitId, localDate },
    {
      userId,
      habitId,
      localDate,
      status: finalStatus,
      value: finalValue,
      targetValue,
      completionType: finalCompletionType,
      note: note || '',
      completedAt: new Date(),
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  // Sync progress with any linked goals
  if (finalStatus === 'completed' || finalCompletionType === 'full') {
    await Goal.updateMany(
      { userId, habitId, status: 'active' },
      { $inc: { progress: finalValue } }
    );
  }

  // Calculate stats and evaluate achievements asynchronously
  try {
    const todayStr = getLocalDateString(userTimezone);
    const allUserHabits = await Habit.find({ userId });
    const allUserLogs = await HabitLog.find({ userId });

    const totalCompletions = allUserLogs.filter(
      (l) => l.status === 'completed' || l.completionType === 'full' || l.completionType === 'minimum'
    ).length;

    const { longestStreak: maxOverallStreak } = calculateOverallStreak(
      allUserHabits,
      allUserLogs,
      todayStr
    );

    let maxHabitStreak = 0;
    for (const h of allUserHabits) {
      const hLogs = allUserLogs.filter((l) => String(l.habitId) === String(h._id));
      const s = calculateHabitStreak(h, hLogs, todayStr);
      if (s.longestStreak > maxHabitStreak) maxHabitStreak = s.longestStreak;
    }

    const maxStreak = Math.max(maxOverallStreak, maxHabitStreak);

    await checkAndAwardAchievements(userId, {
      totalCompletions,
      maxStreak,
      consistency30d: 80, // Checked during full analytics cycle
      hasRecovery: true,
    });
  } catch (err) {
    // Non-fatal logging for achievement background check
    console.error('Achievement check error:', err.message);
  }

  return log;
};

export const getUserLogs = async (userId, query = {}) => {
  const { habitId, localDate, startDate, endDate } = query;
  const filter = { userId };

  if (habitId) filter.habitId = habitId;
  if (localDate) filter.localDate = localDate;
  if (startDate && endDate) {
    filter.localDate = { $gte: startDate, $lte: endDate };
  } else if (startDate) {
    filter.localDate = { $gte: startDate };
  } else if (endDate) {
    filter.localDate = { $lte: endDate };
  }

  return HabitLog.find(filter).sort({ localDate: -1, createdAt: -1 });
};

export const updateLog = async (userId, logId, updates) => {
  const log = await HabitLog.findOne({ _id: logId, userId });
  if (!log) throw new ApiError(404, 'Habit log not found');

  Object.assign(log, updates);
  await log.save();
  return log;
};

export const deleteLog = async (userId, logId) => {
  const log = await HabitLog.findOne({ _id: logId, userId });
  if (!log) throw new ApiError(404, 'Habit log not found');

  // If this log was completed, reverse progress on linked goals
  if (log.status === 'completed' || log.completionType === 'full') {
    await Goal.updateMany(
      { userId, habitId: log.habitId, status: 'active' },
      { $inc: { progress: -log.value } }
    );
  }

  await HabitLog.findByIdAndDelete(logId);
  return { success: true };
};
