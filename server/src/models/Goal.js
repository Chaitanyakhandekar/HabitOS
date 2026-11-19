import mongoose from 'mongoose';

export const GOAL_STATUSES = ['active', 'completed', 'paused', 'failed'];

const goalSchema = new mongoose.Schema(
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
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    target: {
      type: Number,
      required: [true, 'Target value is required'],
      min: [1, 'Target must be at least 1'],
    },
    unit: {
      type: String,
      default: 'times',
      trim: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
    },
    startDate: {
      type: String, // 'YYYY-MM-DD'
      required: true,
    },
    deadline: {
      type: String, // 'YYYY-MM-DD'
      required: [true, 'Deadline is required'],
    },
    status: {
      type: String,
      enum: GOAL_STATUSES,
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Goal = mongoose.model('Goal', goalSchema);
export default Goal;
