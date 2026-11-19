import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  email: z.string().email('Please enter a valid email address').toLowerCase().optional(),
  timezone: z.string().min(1, 'Timezone is required').optional(),
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
    confirmNewPassword: z.string().min(6, 'Confirm password must be at least 6 characters long'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'New passwords do not match',
    path: ['confirmNewPassword'],
  });

export const updateSettingsSchema = z.object({
  theme: z.enum(['dark', 'light', 'system']).optional(),
  weekStartsOn: z.enum(['monday', 'sunday']).optional(),
  timezone: z.string().optional(),
});

export const updateNotificationPreferencesSchema = z.object({
  enabled: z.boolean().optional(),
  reminderTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)').optional(),
  quietHoursStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)').optional(),
  quietHoursEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)').optional(),
});
