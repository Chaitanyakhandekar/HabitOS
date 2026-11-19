import mongoose from 'mongoose';

export const HABIT_CATEGORIES = [
  'health',
  'fitness',
  'learning',
  'career',
  'mindfulness',
  'productivity',
  'finance',
  'social',
  'personal',
  'other',
];

export const TRACKING_TYPES = ['binary', 'quantity', 'duration', 'target'];
export const FREQUENCY_TYPES = ['everyday', 'weekdays', 'specific_days', 'weekly_target'];
export const HABIT_STATUSES = ['active', 'paused', 'archived'];
export const PREFERRED_TIMES = ['morning', 'afternoon', 'evening', 'anytime'];
export const DIFFICULTIES = ['easy', 'medium', 'hard'];

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Habit name is required'],
      trim: true,
      maxlength: [120, 'Habit name cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    category: {
      type: String,
      enum: HABIT_CATEGORIES,
      default: 'personal',
      index: true,
    },
    icon: {
      type: String,
      default: 'CheckCircle2',
    },
    color: {
      type: String,
      default: '#6366f1',
    },
    trackingType: {
      type: String,
      enum: TRACKING_TYPES,
      default: 'binary',
    },
    target: {
      value: {
        type: Number,
        default: 1,
        min: [0.01, 'Target value must be greater than zero'],
      },
      unit: {
        type: String,
        default: 'times',
        trim: true,
      },
    },
    frequency: {
      type: {
        type: String,
        enum: FREQUENCY_TYPES,
        default: 'everyday',
      },
      days: {
        type: [Number], // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        default: [1, 2, 3, 4, 5, 6, 0],
      },
      targetPerWeek: {
        type: Number,
        default: 7,
        min: 1,
        max: 7,
      },
    },
    startDate: {
      type: String, // 'YYYY-MM-DD'
      required: true,
      index: true,
    },
    endDate: {
      type: String, // 'YYYY-MM-DD'
      default: null,
    },
    preferredTime: {
      type: String,
      enum: PREFERRED_TIMES,
      default: 'anytime',
    },
    reminderTime: {
      type: String,
      default: null,
    },
    minimumVersion: {
      enabled: {
        type: Boolean,
        default: false,
      },
      description: {
        type: String,
        default: '',
      },
      targetValue: {
        type: Number,
        default: 1,
      },
    },
    difficulty: {
      type: String,
      enum: DIFFICULTIES,
      default: 'medium',
    },
    status: {
      type: String,
      enum: HABIT_STATUSES,
      default: 'active',
      index: true,
    },
    pauseHistory: [
      {
        pausedAt: { type: String, required: true }, // 'YYYY-MM-DD'
        resumedAt: { type: String, default: null }, // 'YYYY-MM-DD'
      },
    ],
    scheduleHistory: [
      {
        effectiveDate: { type: String, required: true }, // 'YYYY-MM-DD'
        frequency: { type: Object, required: true },
        target: { type: Object, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

habitSchema.index({ userId: 1, status: 1 });

export const Habit = mongoose.model('Habit', habitSchema);
export default Habit;
