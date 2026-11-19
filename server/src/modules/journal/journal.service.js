import { JournalEntry } from '../../models/JournalEntry.js';
import { Habit } from '../../models/Habit.js';
import { HabitLog } from '../../models/HabitLog.js';
import { ApiError } from '../../utils/ApiError.js';
import { isHabitScheduledOnDate } from '../../services/habitSchedule.service.js';
import {
  getLocalDateString,
  getWeekBounds,
  getDateRangeArray,
  getDayOfWeek,
  getDayName,
} from '../../utils/dateUtils.js';

export const saveJournalEntry = async (userId, data) => {
  const { localDate, mood, energy, reflection, wins, challenges, tags } = data;

  const entry = await JournalEntry.findOneAndUpdate(
    { userId, localDate },
    {
      userId,
      localDate,
      mood,
      energy,
      reflection,
      wins: wins || '',
      challenges: challenges || '',
      tags: tags || [],
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return entry;
};

export const getJournalEntries = async (userId, query = {}) => {
  const { search, startDate, endDate, tag } = query;
  const filter = { userId };

  if (search) {
    filter.$or = [
      { reflection: { $regex: search, $options: 'i' } },
      { wins: { $regex: search, $options: 'i' } },
      { challenges: { $regex: search, $options: 'i' } },
    ];
  }

  if (tag) {
    filter.tags = tag;
  }

  if (startDate && endDate) {
    filter.localDate = { $gte: startDate, $lte: endDate };
  } else if (startDate) {
    filter.localDate = { $gte: startDate };
  } else if (endDate) {
    filter.localDate = { $lte: endDate };
  }

  return JournalEntry.find(filter).sort({ localDate: -1 });
};

export const getJournalEntryByDate = async (userId, date) => {
  return JournalEntry.findOne({ userId, localDate: date });
};

export const updateJournalEntry = async (userId, entryId, updates) => {
  const entry = await JournalEntry.findOne({ _id: entryId, userId });
  if (!entry) throw new ApiError(404, 'Journal entry not found');

  Object.assign(entry, updates);
  await entry.save();
  return entry;
};

export const deleteJournalEntry = async (userId, entryId) => {
  const entry = await JournalEntry.findOne({ _id: entryId, userId });
  if (!entry) throw new ApiError(404, 'Journal entry not found');

  await JournalEntry.findByIdAndDelete(entryId);
  return { success: true };
};

export const getWeeklyReview = async (userId, userTimezone = 'UTC', weekDate = null) => {
  const targetDate = weekDate || getLocalDateString(userTimezone);
  const { startOfWeek, endOfWeek } = getWeekBounds(targetDate, 'monday');

  const habits = await Habit.find({ userId });
  const logs = await HabitLog.find({
    userId,
    localDate: { $gte: startOfWeek, $lte: endOfWeek },
  });

  const journalEntries = await JournalEntry.find({
    userId,
    localDate: { $gte: startOfWeek, $lte: endOfWeek },
  }).sort({ localDate: 1 });

  const weekDates = getDateRangeArray(startOfWeek, endOfWeek);
  const logMap = new Map(logs.map((l) => [`${l.localDate}:${String(l.habitId)}`, l]));

  let scheduledCount = 0;
  let completedCount = 0;

  const dayStats = weekDates.map((dateStr) => {
    let daySched = 0;
    let dayComp = 0;

    for (const habit of habits) {
      if (isHabitScheduledOnDate(habit, dateStr)) {
        daySched += 1;
        scheduledCount += 1;
        const log = logMap.get(`${dateStr}:${String(habit._id)}`);
        if (
          log &&
          (log.status === 'completed' ||
            log.completionType === 'full' ||
            (habit.minimumVersion?.enabled && log.completionType === 'minimum'))
        ) {
          dayComp += 1;
          completedCount += 1;
        }
      }
    }

    const dow = getDayOfWeek(dateStr);
    return {
      date: dateStr,
      dayName: getDayName(dow),
      scheduled: daySched,
      completed: dayComp,
      rate: daySched > 0 ? Math.round((dayComp / daySched) * 100) : 0,
    };
  });

  // Calculate best and worst day of the week
  const scheduledDays = dayStats.filter((d) => d.scheduled > 0).sort((a, b) => b.rate - a.rate);
  const bestDay = scheduledDays.length > 0 ? scheduledDays[0] : null;
  const worstDay = scheduledDays.length > 1 ? scheduledDays[scheduledDays.length - 1] : null;

  // Aggregate wins and challenges
  const allWins = journalEntries.map((j) => j.wins).filter(Boolean);
  const allChallenges = journalEntries.map((j) => j.challenges).filter(Boolean);

  const completionRate = scheduledCount > 0 ? Math.round((completedCount / scheduledCount) * 100) : 0;

  return {
    startOfWeek,
    endOfWeek,
    totalScheduled: scheduledCount,
    totalCompleted: completedCount,
    completionRate,
    bestDay,
    worstDay,
    dayStats,
    journalEntries,
    summary: {
      wins: allWins,
      challenges: allChallenges,
    },
  };
};
