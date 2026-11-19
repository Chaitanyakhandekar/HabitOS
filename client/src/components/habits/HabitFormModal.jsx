import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../ui/Modal.jsx';
import { Input } from '../ui/Input.jsx';
import { Select } from '../ui/Select.jsx';
import { Button } from '../ui/Button.jsx';
import habitsApi from '../../services/habits.api.js';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '../../utils/cn.js';

const habitSchema = z.object({
  name: z.string().min(1, 'Habit name is required').max(120),
  description: z.string().max(500).optional(),
  category: z.string().default('personal'),
  icon: z.string().default('CheckCircle2'),
  color: z.string().default('#6366f1'),
  trackingType: z.enum(['binary', 'quantity', 'duration', 'target']).default('binary'),
  targetValue: z.number().min(0.01, 'Target must be positive').default(1),
  targetUnit: z.string().default('times'),
  frequencyType: z.enum(['everyday', 'weekdays', 'specific_days', 'weekly_target']).default('everyday'),
  frequencyDays: z.array(z.number()).default([0, 1, 2, 3, 4, 5, 6]),
  targetPerWeek: z.number().min(1).max(7).default(7),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD required'),
  endDate: z.string().optional(),
  preferredTime: z.enum(['morning', 'afternoon', 'evening', 'anytime']).default('anytime'),
  reminderTime: z.string().optional(),
  minVersionEnabled: z.boolean().default(false),
  minVersionDescription: z.string().optional(),
  minVersionTarget: z.number().min(0.01).default(1),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
});

const CATEGORIES = [
  { id: 'health', label: 'Health' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'learning', label: 'Learning' },
  { id: 'career', label: 'Career' },
  { id: 'mindfulness', label: 'Mindfulness' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'finance', label: 'Finance' },
  { id: 'social', label: 'Social' },
  { id: 'personal', label: 'Personal' },
  { id: 'other', label: 'Other' },
];

const COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#64748b', // Slate
];

const WEEKDAYS = [
  { day: 1, label: 'M' },
  { day: 2, label: 'T' },
  { day: 3, label: 'W' },
  { day: 4, label: 'T' },
  { day: 5, label: 'F' },
  { day: 6, label: 'S' },
  { day: 0, label: 'S' },
];

export const HabitFormModal = ({ isOpen, onClose, habitToEdit = null, todayDateStr }) => {
  const queryClient = useQueryClient();
  const isEditing = !!habitToEdit;

  const defaultDate = todayDateStr || new Date().toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'personal',
      icon: 'CheckCircle2',
      color: '#6366f1',
      trackingType: 'binary',
      targetValue: 1,
      targetUnit: 'times',
      frequencyType: 'everyday',
      frequencyDays: [0, 1, 2, 3, 4, 5, 6],
      targetPerWeek: 7,
      startDate: defaultDate,
      endDate: '',
      preferredTime: 'anytime',
      reminderTime: '',
      minVersionEnabled: false,
      minVersionDescription: '',
      minVersionTarget: 1,
      difficulty: 'medium',
    },
  });

  const trackingType = watch('trackingType');
  const frequencyType = watch('frequencyType');
  const selectedDays = watch('frequencyDays');
  const selectedColor = watch('color');
  const minVersionEnabled = watch('minVersionEnabled');

  useEffect(() => {
    if (habitToEdit) {
      reset({
        name: habitToEdit.name || '',
        description: habitToEdit.description || '',
        category: habitToEdit.category || 'personal',
        icon: habitToEdit.icon || 'CheckCircle2',
        color: habitToEdit.color || '#6366f1',
        trackingType: habitToEdit.trackingType || 'binary',
        targetValue: habitToEdit.target?.value || 1,
        targetUnit: habitToEdit.target?.unit || 'times',
        frequencyType: habitToEdit.frequency?.type || 'everyday',
        frequencyDays: habitToEdit.frequency?.days || [0, 1, 2, 3, 4, 5, 6],
        targetPerWeek: habitToEdit.frequency?.targetPerWeek || 7,
        startDate: habitToEdit.startDate || defaultDate,
        endDate: habitToEdit.endDate || '',
        preferredTime: habitToEdit.preferredTime || 'anytime',
        reminderTime: habitToEdit.reminderTime || '',
        minVersionEnabled: habitToEdit.minimumVersion?.enabled || false,
        minVersionDescription: habitToEdit.minimumVersion?.description || '',
        minVersionTarget: habitToEdit.minimumVersion?.targetValue || 1,
        difficulty: habitToEdit.difficulty || 'medium',
      });
    } else {
      reset({
        name: '',
        description: '',
        category: 'personal',
        icon: 'CheckCircle2',
        color: '#6366f1',
        trackingType: 'binary',
        targetValue: 1,
        targetUnit: 'times',
        frequencyType: 'everyday',
        frequencyDays: [0, 1, 2, 3, 4, 5, 6],
        targetPerWeek: 7,
        startDate: defaultDate,
        endDate: '',
        preferredTime: 'anytime',
        reminderTime: '',
        minVersionEnabled: false,
        minVersionDescription: '',
        minVersionTarget: 1,
        difficulty: 'medium',
      });
    }
  }, [habitToEdit, defaultDate, reset]);

  const toggleDay = (dayNum) => {
    const current = selectedDays || [];
    let updated;
    if (current.includes(dayNum)) {
      if (current.length === 1) return; // Must have at least 1 day
      updated = current.filter((d) => d !== dayNum);
    } else {
      updated = [...current, dayNum];
    }
    setValue('frequencyDays', updated);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        description: data.description,
        category: data.category,
        icon: data.icon,
        color: data.color,
        trackingType: data.trackingType,
        target: {
          value: data.targetValue,
          unit: data.targetUnit,
        },
        frequency: {
          type: data.frequencyType,
          days: data.frequencyType === 'everyday' ? [0, 1, 2, 3, 4, 5, 6] : data.frequencyDays,
          targetPerWeek: data.targetPerWeek,
        },
        startDate: data.startDate,
        endDate: data.endDate || null,
        preferredTime: data.preferredTime,
        reminderTime: data.reminderTime || null,
        minimumVersion: {
          enabled: data.minVersionEnabled,
          description: data.minVersionDescription || '',
          targetValue: data.minVersionTarget,
        },
        difficulty: data.difficulty,
      };

      if (isEditing) {
        await habitsApi.update(habitToEdit._id, payload);
        toast.success('Habit updated successfully');
      } else {
        await habitsApi.create(payload);
        toast.success('Habit created successfully');
      }

      // Invalidate queries to fetch fresh database state
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['todayHabits'] });
      queryClient.invalidateQueries({ queryKey: ['todaySummary'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save habit');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Habit' : 'Create New Habit'}
      description="Define schedules, tracking parameters, and minimum fallback versions."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Habit Name"
            placeholder="e.g. Read 20 Pages"
            error={errors.name?.message}
            {...register('name')}
          />
          <Select label="Category" {...register('category')}>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Description */}
        <Input
          label="Description / Purpose (Optional)"
          placeholder="Why does this habit matter to you?"
          {...register('description')}
        />

        {/* Tracking Type & Target */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select label="Tracking Type" {...register('trackingType')}>
            <option value="binary">Binary (Done / Not Done)</option>
            <option value="quantity">Quantity (e.g. 3 Liters)</option>
            <option value="duration">Duration (e.g. 45 Mins)</option>
            <option value="target">Target Steps / Pages</option>
          </Select>

          {trackingType !== 'binary' ? (
            <>
              <Input
                label="Target Amount"
                type="number"
                step="any"
                error={errors.targetValue?.message}
                {...register('targetValue', { valueAsNumber: true })}
              />
              <Input
                label="Unit"
                placeholder="liters, mins, pages"
                {...register('targetUnit')}
              />
            </>
          ) : (
            <div className="sm:col-span-2 flex items-center pt-6 text-xs text-slate-500 dark:text-text-muted">
              Simple daily check-off without numerical tracking.
            </div>
          )}
        </div>

        {/* Frequency & Scheduling */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-surface-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select label="Frequency Pattern" {...register('frequencyType')}>
              <option value="everyday">Every Day</option>
              <option value="weekdays">Monday to Friday</option>
              <option value="specific_days">Specific Days of Week</option>
              <option value="weekly_target">Weekly Target (X days/week)</option>
            </Select>

            <Select label="Preferred Time of Day" {...register('preferredTime')}>
              <option value="anytime">Anytime</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
            </Select>
          </div>

          {/* Weekday selector for specific_days */}
          {frequencyType === 'specific_days' && (
            <div className="pt-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-text-secondary mb-1.5">
                Scheduled Days
              </label>
              <div className="flex space-x-1.5">
                {WEEKDAYS.map((wd) => {
                  const isSelected = selectedDays?.includes(wd.day);
                  return (
                    <button
                      key={wd.day}
                      type="button"
                      onClick={() => toggleDay(wd.day)}
                      className={cn(
                        'w-9 h-9 rounded-lg text-xs font-bold transition-all',
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-surface-700 text-slate-600 dark:text-text-muted hover:bg-slate-200'
                      )}
                    >
                      {wd.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Minimum Fallback Version (Section 9) */}
        <div className="pt-2 border-t border-slate-100 dark:border-surface-700">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-semibold text-slate-900 dark:text-text-primary">
                Minimum Fallback Version
              </span>
              <p className="text-[11px] text-slate-500 dark:text-text-muted">
                A smaller fallback version (e.g. 5 pushups instead of 50) on busy days.
              </p>
            </div>
            <input
              type="checkbox"
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              {...register('minVersionEnabled')}
            />
          </div>

          {minVersionEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 p-3 rounded-xl bg-slate-50 dark:bg-surface-700/40 border border-slate-200/80 dark:border-surface-600">
              <Input
                label="Fallback Target Value"
                type="number"
                step="any"
                {...register('minVersionTarget', { valueAsNumber: true })}
              />
              <Input
                label="Fallback Description"
                placeholder="e.g. Read 2 pages"
                {...register('minVersionDescription')}
              />
            </div>
          )}
        </div>

        {/* Start Date & Difficulty */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-surface-700">
          <Input
            label="Start Date"
            type="date"
            error={errors.startDate?.message}
            {...register('startDate')}
          />
          <Select label="Difficulty" {...register('difficulty')}>
            <option value="easy">Easy (Low friction)</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard (High effort)</option>
          </Select>
        </div>

        {/* Color Palette Picker */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-text-secondary mb-1.5">
            Accent Color
          </label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => setValue('color', hex)}
                className={cn(
                  'w-7 h-7 rounded-full transition-transform',
                  selectedColor === hex
                    ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110'
                    : 'hover:scale-105'
                )}
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-surface-700">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Create Habit'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default HabitFormModal;
