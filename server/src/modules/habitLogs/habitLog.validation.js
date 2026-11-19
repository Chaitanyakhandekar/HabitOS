import { z } from 'zod';
import { LOG_STATUSES, COMPLETION_TYPES } from '../../models/HabitLog.js';

export const logHabitSchema = z.object({
  habitId: z.string().min(1, 'Habit ID is required'),
  localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  status: z.enum(LOG_STATUSES).optional().default('completed'),
  value: z.number().min(0).optional().default(1),
  completionType: z.enum(COMPLETION_TYPES).optional().default('full'),
  note: z.string().max(1000).optional().default(''),
});

export const updateLogSchema = z.object({
  status: z.enum(LOG_STATUSES).optional(),
  value: z.number().min(0).optional(),
  completionType: z.enum(COMPLETION_TYPES).optional(),
  note: z.string().max(1000).optional(),
});
