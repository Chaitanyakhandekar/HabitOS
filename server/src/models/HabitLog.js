import mongoose from 'mongoose';

export const LOG_STATUSES = ['completed', 'partial', 'skipped'];
export const COMPLETION_TYPES = ['full', 'minimum', 'partial', 'skip'];

const habitLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      required: true,
      index: true,
    },
    localDate: {
      type: String, // 'YYYY-MM-DD'
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: LOG_STATUSES,
      default: 'completed',
    },
    value: {
      type: Number,
      default: 1,
    },
    targetValue: {
      type: Number,
      default: 1,
    },
    completionType: {
      type: String,
      enum: COMPLETION_TYPES,
      default: 'full',
    },
    note: {
      type: String,
      default: '',
      maxlength: [1000, 'Note cannot exceed 1000 characters'],
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Guarantee unique log per habit per local date per user
habitLogSchema.index({ userId: 1, habitId: 1, localDate: 1 }, { unique: true });
habitLogSchema.index({ userId: 1, localDate: 1 });

export const HabitLog = mongoose.model('HabitLog', habitLogSchema);
export default HabitLog;
