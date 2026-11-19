import { z } from 'zod';
import {
  HABIT_CATEGORIES,
  TRACKING_TYPES,
  FREQUENCY_TYPES,
  PREFERRED_TIMES,
  DIFFICULTIES,
} from '../../models/Habit.js';

export const createHabitSchema = z.object({
  name: z.string().min(1, 'Habit name is required').max(120),
  description: z.string().max(500).optional().default(''),
  category: z.enum(HABIT_CATEGORIES).optional().default('personal'),
  icon: z.string().optional().default('CheckCircle2'),
  color: z.string().optional().default('#6366f1'),
  trackingType: z.enum(TRACKING_TYPES).optional().default('binary'),
  target: z
    .object({
      value: z.number().positive('Target value must be positive').default(1),
      unit: z.string().optional().default('times'),
    })
    .optional()
    .default({ value: 1, unit: 'times' }),
  frequency: z
    .object({
      type: z.enum(FREQUENCY_TYPES).default('everyday'),
      days: z.array(z.number().int().min(0).max(6)).optional().default([0, 1, 2, 3, 4, 5, 6]),
      targetPerWeek: z.number().int().min(1).max(7).optional().default(7),
    })
    .optional()
    .default({ type: 'everyday', days: [0, 1, 2, 3, 4, 5, 6], targetPerWeek: 7 }),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD').nullable().optional(),
  preferredTime: z.enum(PREFERRED_TIMES).optional().default('anytime'),
  reminderTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)').nullable().optional(),
  minimumVersion: z
    .object({
      enabled: z.boolean().default(false),
      description: z.string().optional().default(''),
      targetValue: z.number().positive().default(1),
    })
    .optional()
    .default({ enabled: false, description: '', targetValue: 1 }),
  difficulty: z.enum(DIFFICULTIES).optional().default('medium'),
});

export const updateHabitSchema = createHabitSchema.partial();
