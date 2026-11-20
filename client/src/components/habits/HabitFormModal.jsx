import React, { useEffect, useState } from 'react';
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
import {
  Bell,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
  MoreVertical,
  ArrowLeft,
  Flame,
  Music,
  BookOpen,
  Footprints,
  Moon,
  Palette,
  Bike,
  LayoutGrid,
  Droplets,
  Dumbbell,
  Code2,
  Heart,
  Coffee,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '../../utils/cn.js';

const habitSchema = z.object({
  name: z.string().min(1, 'Habit name is required').max(120),
  description: z.string().max(500).optional(),
  category: z.string().default('personal'),
  icon: z.string().default('Yoga'),
  color: z.string().default('#FF6B4A'),
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

// Reference screenshot habit icons
const ICON_CHOICES = [
  { id: 'Yoga', label: 'Yoga', icon: Heart, bg: 'bg-[#FFF0E8] text-[#FF6B4A]' },
  { id: 'Singing', label: 'Singing', icon: Music, bg: 'bg-[#F2EEFF] text-[#8B5CF6]' },
  { id: 'Reading', label: 'Reading', icon: BookOpen, bg: 'bg-[#EBF8F2] text-[#10B981]' },
  { id: 'Running', label: 'Running', icon: Footprints, bg: 'bg-[#FFF7E6] text-[#F59E0B]' },
  { id: 'Sleeping', label: 'Sleeping', icon: Moon, bg: 'bg-[#EEF4FF] text-[#3B82F6]' },
  { id: 'Drawing', label: 'Drawing', icon: Palette, bg: 'bg-[#FFF0F4] text-[#EC4899]' },
  { id: 'Cycling', label: 'Cycling', icon: Bike, bg: 'bg-[#E6FAF7] text-[#06B6D4]' },
  { id: 'All In', label: 'All In', icon: LayoutGrid, bg: 'bg-[#F5F2ED] text-[#64748B]' },
  { id: 'Water', label: 'Hydration', icon: Droplets, bg: 'bg-[#E8F2FF] text-[#0284C7]' },
  { id: 'Gym', label: 'Fitness', icon: Dumbbell, bg: 'bg-[#FFF0EB] text-[#EA580C]' },
  { id: 'Code', label: 'Coding', icon: Code2, bg: 'bg-[#F3EFFC] text-[#7C3AED]' },
  { id: 'Coffee', label: 'Routine', icon: Coffee, bg: 'bg-[#FFF8E7] text-[#D97706]' },
];

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
  const [showAdvanced, setShowAdvanced] = useState(false);

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
      icon: 'Yoga',
      color: '#FF6B4A',
      trackingType: 'binary',
      targetValue: 1,
      targetUnit: 'times',
      frequencyType: 'everyday',
      frequencyDays: [0, 1, 2, 3, 4, 5, 6],
      targetPerWeek: 7,
      startDate: defaultDate,
      endDate: '',
      preferredTime: 'anytime',
      reminderTime: '08:00',
      minVersionEnabled: false,
      minVersionDescription: '',
      minVersionTarget: 1,
      difficulty: 'medium',
    },
  });

  const selectedIcon = watch('icon');
  const selectedFrequencyType = watch('frequencyType');
  const selectedFrequencyDays = watch('frequencyDays');
  const trackingType = watch('trackingType');
  const minVersionEnabled = watch('minVersionEnabled');

  useEffect(() => {
    if (habitToEdit) {
      reset({
        name: habitToEdit.name || '',
        description: habitToEdit.description || '',
        category: habitToEdit.category || 'personal',
        icon: habitToEdit.icon || 'Yoga',
        color: habitToEdit.color || '#FF6B4A',
        trackingType: habitToEdit.trackingType || 'binary',
        targetValue: habitToEdit.target?.value || 1,
        targetUnit: habitToEdit.target?.unit || 'times',
        frequencyType: habitToEdit.frequency?.type || 'everyday',
        frequencyDays: habitToEdit.frequency?.days || [0, 1, 2, 3, 4, 5, 6],
        targetPerWeek: habitToEdit.frequency?.targetPerWeek || 7,
        startDate: habitToEdit.startDate?.slice(0, 10) || defaultDate,
        endDate: habitToEdit.endDate ? habitToEdit.endDate.slice(0, 10) : '',
        preferredTime: habitToEdit.preferredTime || 'anytime',
        reminderTime: habitToEdit.reminderTime || '',
        minVersionEnabled: habitToEdit.minVersion?.enabled || false,
        minVersionDescription: habitToEdit.minVersion?.description || '',
        minVersionTarget: habitToEdit.minVersion?.target || 1,
        difficulty: habitToEdit.difficulty || 'medium',
      });
    } else {
      reset({
        name: '',
        description: '',
        category: 'personal',
        icon: 'Yoga',
        color: '#FF6B4A',
        trackingType: 'binary',
        targetValue: 1,
        targetUnit: 'times',
        frequencyType: 'everyday',
        frequencyDays: [0, 1, 2, 3, 4, 5, 6],
        targetPerWeek: 7,
        startDate: defaultDate,
        endDate: '',
        preferredTime: 'anytime',
        reminderTime: '08:00',
        minVersionEnabled: false,
        minVersionDescription: '',
        minVersionTarget: 1,
        difficulty: 'medium',
      });
    }
  }, [habitToEdit, defaultDate, reset]);

  const toggleDay = (dayNum) => {
    const current = [...selectedFrequencyDays];
    const idx = current.indexOf(dayNum);
    if (idx > -1) {
      if (current.length > 1) {
        current.splice(idx, 1);
        setValue('frequencyDays', current);
      }
    } else {
      current.push(dayNum);
      setValue('frequencyDays', current);
    }
  };

  const handleFrequencySelect = (type) => {
    setValue('frequencyType', type);
    if (type === 'everyday') {
      setValue('frequencyDays', [0, 1, 2, 3, 4, 5, 6]);
    } else if (type === 'weekdays') {
      setValue('frequencyDays', [1, 2, 3, 4, 5]);
    } else if (type === 'specific_days') {
      setValue('frequencyDays', [0, 6]); // weekends as default for custom
    }
  };

  const onSubmit = async (values) => {
    try {
      const payload = {
        name: values.name,
        description: values.description,
        category: values.category,
        icon: values.icon,
        color: values.color,
        trackingType: values.trackingType,
        target: {
          value: Number(values.targetValue),
          unit: values.targetUnit,
        },
        frequency: {
          type: values.frequencyType,
          days: values.frequencyDays,
          targetPerWeek: Number(values.targetPerWeek),
        },
        startDate: values.startDate,
        endDate: values.endDate || undefined,
        preferredTime: values.preferredTime,
        reminderTime: values.reminderTime || undefined,
        minVersion: {
          enabled: values.minVersionEnabled,
          description: values.minVersionDescription,
          target: Number(values.minVersionTarget),
        },
        difficulty: values.difficulty,
      };

      if (isEditing) {
        await habitsApi.update(habitToEdit._id, payload);
        toast.success('Habit updated successfully');
      } else {
        await habitsApi.create(payload);
        toast.success('Habit created successfully');
      }

      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['todayHabits'] });
      queryClient.invalidateQueries({ queryKey: ['todaySummary'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save habit');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Habit' : 'New Habit'}
      description="Design your habit with routines, targets and reminders"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 1. Habit Name (Screen 1 Pill Input) */}
        <div>
          <label className="block text-sm font-bold text-warm-900 dark:text-warm-100 mb-2">
            Habit Name
          </label>
          <input
            {...register('name')}
            placeholder="e.g., Morning Meditation"
            className={cn(
              'w-full px-5 py-3.5 text-sm rounded-full bg-warm-100 dark:bg-surface-700/60 border border-warm-200/70 dark:border-surface-600 text-warm-900 dark:text-warm-100 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-coral/25 focus:border-coral transition-all duration-150',
              errors.name && 'border-red-500 focus:ring-red-500/25'
            )}
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1 font-medium px-2">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* 2. Choose Icon (Screen 1 4-Column Grid) */}
        <div>
          <label className="block text-sm font-bold text-warm-900 dark:text-warm-100 mb-2.5">
            Choose Icon
          </label>
          <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
            {ICON_CHOICES.map((choice) => {
              const IconComp = choice.icon;
              const isSelected = selectedIcon === choice.id;
              return (
                <button
                  type="button"
                  key={choice.id}
                  onClick={() => setValue('icon', choice.id)}
                  className={cn(
                    'flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-150 text-center select-none group',
                    isSelected
                      ? 'bg-peach-light/60 dark:bg-coral-950/40 border-coral shadow-xs scale-102 ring-2 ring-coral/20'
                      : 'bg-white dark:bg-surface-700/50 border-warm-200/70 dark:border-surface-600 hover:border-warm-300 dark:hover:border-surface-500 hover:bg-warm-50 dark:hover:bg-surface-700'
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-2xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105',
                      choice.bg
                    )}
                  >
                    <IconComp className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span
                    className={cn(
                      'text-xs font-semibold tracking-tight transition-colors',
                      isSelected
                        ? 'text-coral font-bold'
                        : 'text-warm-700 dark:text-warm-300'
                    )}
                  >
                    {choice.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Frequency Pills (Screen 1 Segmented Control) */}
        <div>
          <label className="block text-sm font-bold text-warm-900 dark:text-warm-100 mb-2.5">
            Frequency & Schedule
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-warm-100 dark:bg-surface-700/60 rounded-2xl border border-warm-200/60 dark:border-surface-600">
            {[
              { id: 'everyday', label: 'Daily' },
              { id: 'weekdays', label: 'Weekdays' },
              { id: 'specific_days', label: 'Weekends' },
              { id: 'weekly_target', label: 'Custom' },
            ].map((freq) => {
              const isSelected = selectedFrequencyType === freq.id;
              return (
                <button
                  type="button"
                  key={freq.id}
                  onClick={() => handleFrequencySelect(freq.id)}
                  className={cn(
                    'py-2.5 px-3 rounded-full text-xs font-bold transition-all duration-150 text-center select-none',
                    isSelected
                      ? 'bg-coral text-white shadow-sm shadow-coral/30'
                      : 'text-warm-600 dark:text-warm-300 hover:text-warm-900 dark:hover:text-warm-100 hover:bg-white/60 dark:hover:bg-surface-600/60'
                  )}
                >
                  {freq.label}
                </button>
              );
            })}
          </div>

          {/* Weekday Selector Pills when Specific Days selected */}
          {(selectedFrequencyType === 'specific_days' || selectedFrequencyType === 'weekly_target') && (
            <div className="mt-3 p-3.5 bg-warm-50 dark:bg-surface-700/40 rounded-2xl border border-warm-200/60 dark:border-surface-600 space-y-2">
              <span className="text-xs font-semibold text-warm-600 dark:text-warm-300 block">
                Active Weekdays:
              </span>
              <div className="flex items-center justify-between gap-1">
                {WEEKDAYS.map((wd) => {
                  const isDayActive = selectedFrequencyDays.includes(wd.day);
                  return (
                    <button
                      type="button"
                      key={wd.day}
                      onClick={() => toggleDay(wd.day)}
                      className={cn(
                        'w-9 h-9 rounded-full text-xs font-bold transition-all duration-150 flex items-center justify-center',
                        isDayActive
                          ? 'bg-coral text-white shadow-xs'
                          : 'bg-warm-100 dark:bg-surface-600 text-warm-500 dark:text-warm-400 hover:bg-warm-200'
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

        {/* 4. Reminder Time (Screen 1 Pill Input) */}
        <div>
          <label className="block text-sm font-bold text-warm-900 dark:text-warm-100 mb-2">
            Reminder Time
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-4 text-warm-400 dark:text-warm-500 pointer-events-none">
              <Bell className="w-4 h-4" />
            </div>
            <input
              type="time"
              {...register('reminderTime')}
              className="w-full pl-11 pr-11 py-3 text-sm rounded-full bg-warm-100 dark:bg-surface-700/60 border border-warm-200/70 dark:border-surface-600 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-coral/25 focus:border-coral transition-all"
            />
            <div className="absolute right-4 text-warm-400 dark:text-warm-500 pointer-events-none">
              <Clock className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* 5. Progressive Disclosure: Advanced Settings */}
        <div className="border-t border-warm-100 dark:border-surface-700/80 pt-3">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between py-2 text-xs font-bold text-coral hover:text-coral-600 transition-colors"
          >
            <span>{showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options (Target, Category, Minimum Version)'}</span>
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4 animate-slide-down">
              {/* Category & Preferred Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Category"
                  {...register('category')}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Time of Day"
                  {...register('preferredTime')}
                >
                  <option value="anytime">Anytime</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                </Select>
              </div>

              {/* Tracking Type & Target */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select
                  label="Tracking Type"
                  {...register('trackingType')}
                >
                  <option value="binary">Yes / No (Done)</option>
                  <option value="quantity">Quantity (e.g., 8 glasses)</option>
                  <option value="duration">Duration (e.g., 30 mins)</option>
                </Select>

                <Input
                  label="Target Value"
                  type="number"
                  step="any"
                  {...register('targetValue', { valueAsNumber: true })}
                />

                <Input
                  label="Unit"
                  placeholder="e.g. times, mins, pages"
                  {...register('targetUnit')}
                />
              </div>

              {/* Minimum Version Strategy (Two-Minute Rule) */}
              <div className="p-4 rounded-2xl bg-peach-light/40 dark:bg-surface-700/40 border border-coral/15 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-warm-900 dark:text-warm-100 block">
                      Minimum Version (Never Miss Twice)
                    </span>
                    <span className="text-[11px] text-warm-500 dark:text-warm-400">
                      Fallback goal when busy or exhausted
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    {...register('minVersionEnabled')}
                    className="w-5 h-5 accent-coral rounded-md cursor-pointer"
                  />
                </div>

                {minVersionEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <Input
                      label="Emergency Minimum Target"
                      type="number"
                      step="any"
                      {...register('minVersionTarget', { valueAsNumber: true })}
                    />
                    <Input
                      label="Minimum Description"
                      placeholder="e.g. Read 2 pages instead of 30"
                      {...register('minVersionDescription')}
                    />
                  </div>
                )}
              </div>

              {/* Start Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Start Date"
                  type="date"
                  {...register('startDate')}
                />
                <Select
                  label="Difficulty"
                  {...register('difficulty')}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </Select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-warm-800 dark:text-warm-200 mb-1.5">
                  Habit Description / Motivation
                </label>
                <textarea
                  {...register('description')}
                  rows={2}
                  placeholder="Why this habit matters to your wellness..."
                  className="w-full px-4 py-2.5 text-sm rounded-2xl bg-warm-100 dark:bg-surface-700/60 border border-warm-200/70 dark:border-surface-600 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-coral/25 focus:border-coral transition-all"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-warm-100 dark:border-surface-700/80">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="px-7"
          >
            {isEditing ? 'Save Changes' : 'Create Habit'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default HabitFormModal;
