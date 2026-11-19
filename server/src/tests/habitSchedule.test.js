import { describe, it, expect } from 'vitest';
import { isHabitScheduledOnDate } from '../services/habitSchedule.service.js';

describe('Habit Schedule Service', () => {
  const baseHabit = {
    startDate: '2026-11-01',
    endDate: '2026-11-30',
    frequency: {
      type: 'everyday',
      days: [0, 1, 2, 3, 4, 5, 6],
    },
    status: 'active',
    pauseHistory: [],
  };

  it('respects startDate and endDate bounds', () => {
    expect(isHabitScheduledOnDate(baseHabit, '2026-10-31')).toBe(false);
    expect(isHabitScheduledOnDate(baseHabit, '2026-11-01')).toBe(true);
    expect(isHabitScheduledOnDate(baseHabit, '2026-11-30')).toBe(true);
    expect(isHabitScheduledOnDate(baseHabit, '2026-12-01')).toBe(false);
  });

  it('handles weekday frequency (Monday to Friday only)', () => {
    const weekdayHabit = {
      ...baseHabit,
      frequency: { type: 'weekdays' },
    };
    // 2026-11-19 is Thursday (weekday)
    expect(isHabitScheduledOnDate(weekdayHabit, '2026-11-19')).toBe(true);
    // 2026-11-20 is Friday (weekday)
    expect(isHabitScheduledOnDate(weekdayHabit, '2026-11-20')).toBe(true);
    // 2026-11-21 is Saturday (weekend)
    expect(isHabitScheduledOnDate(weekdayHabit, '2026-11-21')).toBe(false);
    // 2026-11-22 is Sunday (weekend)
    expect(isHabitScheduledOnDate(weekdayHabit, '2026-11-22')).toBe(false);
  });

  it('handles specific days frequency (e.g. Mon, Wed, Fri)', () => {
    const specificHabit = {
      ...baseHabit,
      frequency: {
        type: 'specific_days',
        days: [1, 3, 5], // Mon, Wed, Fri
      },
    };
    // 2026-11-16 is Monday
    expect(isHabitScheduledOnDate(specificHabit, '2026-11-16')).toBe(true);
    // 2026-11-17 is Tuesday
    expect(isHabitScheduledOnDate(specificHabit, '2026-11-17')).toBe(false);
    // 2026-11-18 is Wednesday
    expect(isHabitScheduledOnDate(specificHabit, '2026-11-18')).toBe(true);
  });

  it('handles paused intervals properly', () => {
    const pausedHabit = {
      ...baseHabit,
      pauseHistory: [
        { pausedAt: '2026-11-10', resumedAt: '2026-11-15' },
      ],
    };
    expect(isHabitScheduledOnDate(pausedHabit, '2026-11-09')).toBe(true);
    expect(isHabitScheduledOnDate(pausedHabit, '2026-11-10')).toBe(false);
    expect(isHabitScheduledOnDate(pausedHabit, '2026-11-14')).toBe(false);
    expect(isHabitScheduledOnDate(pausedHabit, '2026-11-15')).toBe(true); // Resumed
  });
});
