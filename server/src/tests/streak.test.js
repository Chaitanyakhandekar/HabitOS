import { describe, it, expect } from 'vitest';
import { calculateHabitStreak } from '../services/streak.service.js';

describe('Streak Calculation Service', () => {
  it('does not penalize unscheduled rest days for specific_days schedule', () => {
    // Habit scheduled on Mon(1), Wed(3), Fri(5)
    // 2026-11-16 (Mon), 2026-11-18 (Wed), 2026-11-20 (Fri)
    const habit = {
      startDate: '2026-11-16',
      frequency: {
        type: 'specific_days',
        days: [1, 3, 5],
      },
      status: 'active',
      pauseHistory: [],
    };

    // User completed Mon (11-16) and Wed (11-18).
    // Today is Thursday 11-19 (not scheduled).
    const logs = [
      { localDate: '2026-11-16', status: 'completed', completionType: 'full' },
      { localDate: '2026-11-18', status: 'completed', completionType: 'full' },
    ];

    const result = calculateHabitStreak(habit, logs, '2026-11-19');

    // Tuesday (11-17) and Thursday (11-19) are not scheduled, so streak should be 2!
    expect(result.currentStreak).toBe(2);
    expect(result.longestStreak).toBe(2);
    expect(result.totalCompletions).toBe(2);
  });

  it('recognizes minimum version completions towards streaks when enabled', () => {
    const habit = {
      startDate: '2026-11-16',
      frequency: { type: 'everyday', days: [0, 1, 2, 3, 4, 5, 6] },
      minimumVersion: { enabled: true, targetValue: 5 },
      status: 'active',
    };

    const logs = [
      { localDate: '2026-11-16', status: 'completed', completionType: 'full' },
      { localDate: '2026-11-17', status: 'completed', completionType: 'minimum' },
      { localDate: '2026-11-18', status: 'completed', completionType: 'full' },
    ];

    const result = calculateHabitStreak(habit, logs, '2026-11-18');
    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(3);
  });

  it('resets current streak when a scheduled opportunity was missed', () => {
    const habit = {
      startDate: '2026-11-15',
      frequency: { type: 'everyday', days: [0, 1, 2, 3, 4, 5, 6] },
      status: 'active',
    };

    // Missed 2026-11-17!
    const logs = [
      { localDate: '2026-11-15', status: 'completed', completionType: 'full' },
      { localDate: '2026-11-16', status: 'completed', completionType: 'full' },
      // 11-17 missed
      { localDate: '2026-11-18', status: 'completed', completionType: 'full' },
    ];

    const result = calculateHabitStreak(habit, logs, '2026-11-18');
    expect(result.currentStreak).toBe(1); // Only 11-18
    expect(result.longestStreak).toBe(2);  // 11-15 and 11-16
  });
});
