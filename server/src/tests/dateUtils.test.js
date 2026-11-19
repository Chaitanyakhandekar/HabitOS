import { describe, it, expect } from 'vitest';
import {
  isValidDateString,
  getLocalDateString,
  getDayOfWeek,
  getDayName,
  addDays,
  daysDifference,
  getDateRangeArray,
  getWeekBounds,
} from '../utils/dateUtils.js';

describe('Date Utilities', () => {
  it('validates YYYY-MM-DD correctly', () => {
    expect(isValidDateString('2026-11-19')).toBe(true);
    expect(isValidDateString('2026-02-29')).toBe(false); // Non-leap year
    expect(isValidDateString('19-11-2026')).toBe(false);
    expect(isValidDateString('invalid')).toBe(false);
  });

  it('calculates correct day of week', () => {
    // 2026-11-19 is a Thursday (4)
    expect(getDayOfWeek('2026-11-19')).toBe(4);
    expect(getDayName(4)).toBe('Thu');
  });

  it('adds and subtracts days reliably without UTC drift', () => {
    expect(addDays('2026-11-19', 1)).toBe('2026-11-20');
    expect(addDays('2026-11-19', -5)).toBe('2026-11-14');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('computes days difference accurately', () => {
    expect(daysDifference('2026-11-10', '2026-11-19')).toBe(9);
    expect(daysDifference('2026-11-19', '2026-11-10')).toBe(-9);
  });

  it('generates date range array inclusive of start and end', () => {
    const range = getDateRangeArray('2026-11-01', '2026-11-03');
    expect(range).toEqual(['2026-11-01', '2026-11-02', '2026-11-03']);
  });

  it('computes week boundaries correctly (Monday to Sunday)', () => {
    // 2026-11-19 is Thursday
    const bounds = getWeekBounds('2026-11-19', 'monday');
    expect(bounds.startOfWeek).toBe('2026-11-16'); // Monday
    expect(bounds.endOfWeek).toBe('2026-11-22');   // Sunday
  });
});
