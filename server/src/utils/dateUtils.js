/**
 * Date and timezone utilities for HabitOS
 * Uses Intl.DateTimeFormat for reliable IANA timezone conversions
 */

/**
 * Validates if string matches YYYY-MM-DD
 * @param {string} dateStr 
 * @returns {boolean}
 */
export const isValidDateString = (dateStr) => {
  if (typeof dateStr !== 'string') return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
};

/**
 * Gets current local date string (YYYY-MM-DD) for a given timezone
 * @param {string} timezone - e.g. 'Asia/Kolkata', 'America/New_York', 'UTC'
 * @param {Date} [baseDate=new Date()]
 * @returns {string} 'YYYY-MM-DD'
 */
export const getLocalDateString = (timezone = 'UTC', baseDate = new Date()) => {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(baseDate); // en-CA outputs YYYY-MM-DD
  } catch {
    // Fallback if timezone is invalid
    return baseDate.toISOString().slice(0, 10);
  }
};

/**
 * Gets day of week for a YYYY-MM-DD string
 * 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @returns {number} 0-6
 */
export const getDayOfWeek = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCDay();
};

/**
 * Returns weekday short name: 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
 * @param {number} day - 0-6
 * @returns {string}
 */
export const getDayName = (day) => {
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return names[day] || '';
};

/**
 * Adds or subtracts days from a YYYY-MM-DD string
 * @param {string} dateStr 
 * @param {number} days 
 * @returns {string} 'YYYY-MM-DD'
 */
export const addDays = (dateStr, days) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
};

/**
 * Computes difference in calendar days between two YYYY-MM-DD strings (date2 - date1)
 * @param {string} dateStr1 
 * @param {string} dateStr2 
 * @returns {number}
 */
export const daysDifference = (dateStr1, dateStr2) => {
  const [y1, m1, d1] = dateStr1.split('-').map(Number);
  const [y2, m2, d2] = dateStr2.split('-').map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((utc2 - utc1) / msPerDay);
};

/**
 * Generates an array of all YYYY-MM-DD dates between startDate and endDate (inclusive)
 * @param {string} startDate 
 * @param {string} endDate 
 * @returns {string[]}
 */
export const getDateRangeArray = (startDate, endDate) => {
  if (startDate > endDate) return [];
  const dates = [];
  let current = startDate;
  while (current <= endDate) {
    dates.push(current);
    current = addDays(current, 1);
  }
  return dates;
};

/**
 * Gets start and end dates for common analytics periods relative to a local date
 * @param {'7d'|'30d'|'90d'|'6m'|'1y'} period 
 * @param {string} todayStr - YYYY-MM-DD
 * @returns {{ startDate: string, endDate: string }}
 */
export const getDateRangeForPeriod = (period, todayStr) => {
  let days = 30;
  if (period === '7d') days = 7;
  else if (period === '30d') days = 30;
  else if (period === '90d') days = 90;
  else if (period === '6m') days = 180;
  else if (period === '1y') days = 365;

  const startDate = addDays(todayStr, -(days - 1));
  return { startDate, endDate: todayStr };
};

/**
 * Gets start and end of week (Monday to Sunday, or Sunday to Saturday based on weekStartsOn)
 * @param {string} dateStr 
 * @param {'monday'|'sunday'} weekStartsOn 
 * @returns {{ startOfWeek: string, endOfWeek: string }}
 */
export const getWeekBounds = (dateStr, weekStartsOn = 'monday') => {
  const day = getDayOfWeek(dateStr); // 0=Sun, 1=Mon, ..., 6=Sat
  let diffToStart = 0;

  if (weekStartsOn === 'monday') {
    // If Sun(0), Monday was 6 days ago. If Mon(1), Monday is today (0).
    diffToStart = day === 0 ? -6 : 1 - day;
  } else {
    // If Sunday starts week, Sunday is today (0)
    diffToStart = -day;
  }

  const startOfWeek = addDays(dateStr, diffToStart);
  const endOfWeek = addDays(startOfWeek, 6);
  return { startOfWeek, endOfWeek };
};
