import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { Habit } from '../../models/Habit.js';
import { HabitLog } from '../../models/HabitLog.js';
import {
  getUserAchievementsWithProgress,
  checkAndAwardAchievements,
} from '../../services/achievement.service.js';
import { calculateHabitStreak, calculateOverallStreak } from '../../services/streak.service.js';
import { getLocalDateString } from '../../utils/dateUtils.js';

export const getAchievements = asyncHandler(async (req, res) => {
  const localToday = getLocalDateString(req.user.timezone);
  const habits = await Habit.find({ userId: req.user._id });
  const logs = await HabitLog.find({ userId: req.user._id });

  const totalCompletions = logs.filter(
    (l) => l.status === 'completed' || l.completionType === 'full' || l.completionType === 'minimum'
  ).length;

  const { longestStreak: maxOverallStreak } = calculateOverallStreak(habits, logs, localToday);

  let maxHabitStreak = 0;
  for (const h of habits) {
    const hLogs = logs.filter((l) => String(l.habitId) === String(h._id));
    const s = calculateHabitStreak(h, hLogs, localToday);
    if (s.longestStreak > maxHabitStreak) maxHabitStreak = s.longestStreak;
  }

  const maxStreak = Math.max(maxOverallStreak, maxHabitStreak);

  // Sync check awards first
  await checkAndAwardAchievements(req.user._id, {
    totalCompletions,
    maxStreak,
    consistency30d: 0,
    hasRecovery: false,
  });

  const achievements = await getUserAchievementsWithProgress(req.user._id, {
    totalCompletions,
    maxStreak,
    consistency30d: 0,
  });

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  return new ApiResponse(
    200,
    {
      achievements,
      unlockedCount,
      totalCount: achievements.length,
    },
    'Achievements retrieved successfully'
  ).send(res);
});

export const getProgress = asyncHandler(async (req, res) => {
  return getAchievements(req, res);
});
