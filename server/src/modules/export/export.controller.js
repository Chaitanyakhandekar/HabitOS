import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { Habit } from '../../models/Habit.js';
import { HabitLog } from '../../models/HabitLog.js';
import { JournalEntry } from '../../models/JournalEntry.js';

export const exportHabits = asyncHandler(async (req, res) => {
  const habits = await Habit.find({ userId: req.user._id }).lean();
  return new ApiResponse(200, { habits }, 'Habits exported successfully').send(res);
});

export const exportLogs = asyncHandler(async (req, res) => {
  const logs = await HabitLog.find({ userId: req.user._id })
    .populate('habitId', 'name category trackingType')
    .sort({ localDate: -1 })
    .lean();

  const format = req.query.format || 'csv';

  if (format === 'json') {
    return new ApiResponse(200, { logs }, 'Logs exported successfully').send(res);
  }

  // Generate CSV
  const headers = ['Date', 'Habit Name', 'Category', 'Tracking Type', 'Status', 'Completion Type', 'Value', 'Target', 'Note'];
  const rows = logs.map((l) => [
    l.localDate,
    `"${(l.habitId?.name || '').replace(/"/g, '""')}"`,
    l.habitId?.category || '',
    l.habitId?.trackingType || '',
    l.status,
    l.completionType,
    l.value,
    l.targetValue,
    `"${(l.note || '').replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="habitos-logs.csv"');
  return res.status(200).send(csv);
});

export const exportJournal = asyncHandler(async (req, res) => {
  const entries = await JournalEntry.find({ userId: req.user._id })
    .sort({ localDate: -1 })
    .lean();

  const format = req.query.format || 'json';

  if (format === 'csv') {
    const headers = ['Date', 'Mood', 'Energy', 'Reflection', 'Wins', 'Challenges', 'Tags'];
    const rows = entries.map((e) => [
      e.localDate,
      e.mood,
      e.energy,
      `"${(e.reflection || '').replace(/"/g, '""')}"`,
      `"${(e.wins || '').replace(/"/g, '""')}"`,
      `"${(e.challenges || '').replace(/"/g, '""')}"`,
      `"${(e.tags || []).join(';')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="habitos-journal.csv"');
    return res.status(200).send(csv);
  }

  return new ApiResponse(200, { entries }, 'Journal exported successfully').send(res);
});
