import { z } from 'zod';

export const createJournalSchema = z.object({
  localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  mood: z.number().int().min(1).max(5),
  energy: z.number().int().min(1).max(5),
  reflection: z.string().min(1, 'Reflection text is required').max(4000),
  wins: z.string().max(1000).optional().default(''),
  challenges: z.string().max(1000).optional().default(''),
  tags: z.array(z.string()).optional().default([]),
});

export const updateJournalSchema = createJournalSchema.partial();
