import { z } from 'zod';
import { GOAL_STATUSES } from '../../models/Goal.js';

export const createGoalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120),
  description: z.string().max(500).optional().default(''),
  habitId: z.string().nullable().optional(),
  target: z.number().positive('Target must be positive'),
  unit: z.string().optional().default('times'),
  progress: z.number().min(0).optional().default(0),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Deadline must be YYYY-MM-DD'),
});

export const updateGoalSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(500).optional(),
  habitId: z.string().nullable().optional(),
  target: z.number().positive().optional(),
  unit: z.string().optional(),
  progress: z.number().min(0).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(GOAL_STATUSES).optional(),
});
