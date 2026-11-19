import { Achievement } from '../models/Achievement.js';

export const ACHIEVEMENT_DEFINITIONS = [
  {
    type: 'FIRST_HABIT_LOG',
    title: 'First Step',
    description: 'Completed your very first habit check-in on HabitOS.',
    category: 'special',
    icon: 'Sparkles',
    target: 1,
  },
  {
    type: 'STREAK_3',
    title: 'Spark of Consistency',
    description: 'Achieved an active 3-day streak.',
    category: 'streak',
    icon: 'Flame',
    target: 3,
  },
  {
    type: 'STREAK_7',
    title: 'One Week Wonder',
    description: 'Maintained a flawless 7-day streak.',
    category: 'streak',
    icon: 'Flame',
    target: 7,
  },
  {
    type: 'STREAK_14',
    title: 'Two Weeks Strong',
    description: 'Held your streak steady for 14 scheduled days.',
    category: 'streak',
    icon: 'Zap',
    target: 14,
  },
  {
    type: 'STREAK_30',
    title: 'Monthly Mastery',
    description: 'Crushed a 30-day streak.',
    category: 'streak',
    icon: 'Award',
    target: 30,
  },
  {
    type: 'STREAK_50',
    title: 'Half Century',
    description: 'Logged 50 consecutive scheduled habit days.',
    category: 'streak',
    icon: 'ShieldCheck',
    target: 50,
  },
  {
    type: 'STREAK_100',
    title: 'Centurion',
    description: 'Achieved a legendary 100-day streak.',
    category: 'streak',
    icon: 'Crown',
    target: 100,
  },
  {
    type: 'COMPLETIONS_10',
    title: 'Getting Started',
    description: 'Completed 10 total habit sessions.',
    category: 'completions',
    icon: 'CheckCircle2',
    target: 10,
  },
  {
    type: 'COMPLETIONS_50',
    title: 'Building Momentum',
    description: 'Reached 50 total habit completions.',
    category: 'completions',
    icon: 'Target',
    target: 50,
  },
  {
    type: 'COMPLETIONS_100',
    title: 'Centennial Club',
    description: 'Achieved 100 total habit completions.',
    category: 'completions',
    icon: 'Medal',
    target: 100,
  },
  {
    type: 'COMPLETIONS_500',
    title: 'Unstoppable Routine',
    description: 'Logged 500 total habit completions.',
    category: 'completions',
    icon: 'Trophy',
    target: 500,
  },
  {
    type: 'CONSISTENCY_80_30',
    title: 'Solid Rhythm',
    description: 'Maintained at least 80% consistency over 30 days.',
    category: 'consistency',
    icon: 'TrendingUp',
    target: 80,
  },
  {
    type: 'RECOVERY_MASTER',
    title: 'Resilient Comeback',
    description: 'Returned and completed a habit after missing 2 or more scheduled days.',
    category: 'recovery',
    icon: 'RefreshCw',
    target: 1,
  },
];

/**
 * Checks and awards achievements for a user based on their current stats
 * 
 * @param {string} userId 
 * @param {{ totalCompletions: number, maxStreak: number, consistency30d: number, hasRecovery: boolean }} stats 
 * @returns {Promise<Array<Object>>} Newly unlocked achievements
 */
export const checkAndAwardAchievements = async (userId, stats) => {
  const existing = await Achievement.find({ userId }).select('type');
  const existingTypes = new Set(existing.map((a) => a.type));

  const toAward = [];

  const maybeAward = (def, condition) => {
    if (condition && !existingTypes.has(def.type)) {
      toAward.push({
        userId,
        type: def.type,
        title: def.title,
        description: def.description,
        icon: def.icon,
        category: def.category,
        unlockedAt: new Date(),
      });
      existingTypes.add(def.type);
    }
  };

  if (stats.totalCompletions >= 1) {
    maybeAward(ACHIEVEMENT_DEFINITIONS[0], true); // FIRST_HABIT_LOG
  }
  if (stats.maxStreak >= 3) maybeAward(ACHIEVEMENT_DEFINITIONS[1], true);
  if (stats.maxStreak >= 7) maybeAward(ACHIEVEMENT_DEFINITIONS[2], true);
  if (stats.maxStreak >= 14) maybeAward(ACHIEVEMENT_DEFINITIONS[3], true);
  if (stats.maxStreak >= 30) maybeAward(ACHIEVEMENT_DEFINITIONS[4], true);
  if (stats.maxStreak >= 50) maybeAward(ACHIEVEMENT_DEFINITIONS[5], true);
  if (stats.maxStreak >= 100) maybeAward(ACHIEVEMENT_DEFINITIONS[6], true);

  if (stats.totalCompletions >= 10) maybeAward(ACHIEVEMENT_DEFINITIONS[7], true);
  if (stats.totalCompletions >= 50) maybeAward(ACHIEVEMENT_DEFINITIONS[8], true);
  if (stats.totalCompletions >= 100) maybeAward(ACHIEVEMENT_DEFINITIONS[9], true);
  if (stats.totalCompletions >= 500) maybeAward(ACHIEVEMENT_DEFINITIONS[10], true);

  if (stats.consistency30d >= 80) maybeAward(ACHIEVEMENT_DEFINITIONS[11], true);
  if (stats.hasRecovery) maybeAward(ACHIEVEMENT_DEFINITIONS[12], true);

  if (toAward.length > 0) {
    // Insert with duplicate ignore safety
    try {
      await Achievement.insertMany(toAward, { ordered: false });
    } catch {
      // Ignore duplicates if race condition occurred
    }
  }

  return toAward;
};

/**
 * Returns all achievements for a user along with progress for locked ones
 * 
 * @param {string} userId 
 * @param {{ totalCompletions: number, maxStreak: number, consistency30d: number }} stats 
 * @returns {Promise<Array<Object>>}
 */
export const getUserAchievementsWithProgress = async (userId, stats = {}) => {
  const unlocked = await Achievement.find({ userId }).sort({ unlockedAt: -1 });
  const unlockedMap = new Map(unlocked.map((a) => [a.type, a]));

  const totalCompletions = stats.totalCompletions || 0;
  const maxStreak = stats.maxStreak || 0;
  const consistency30d = stats.consistency30d || 0;

  return ACHIEVEMENT_DEFINITIONS.map((def) => {
    const isUnlocked = unlockedMap.has(def.type);
    let current = 0;

    if (def.category === 'streak') {
      current = maxStreak;
    } else if (def.category === 'completions' || def.type === 'FIRST_HABIT_LOG') {
      current = totalCompletions;
    } else if (def.category === 'consistency') {
      current = consistency30d;
    } else if (def.category === 'recovery') {
      current = isUnlocked ? 1 : 0;
    }

    const progress = Math.min(100, Math.round((current / def.target) * 100));

    return {
      ...def,
      isUnlocked,
      unlockedAt: isUnlocked ? unlockedMap.get(def.type).unlockedAt : null,
      current,
      progress,
    };
  });
};
