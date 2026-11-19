import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String, // e.g., 'STREAK_3', 'STREAK_7', 'COMPLETIONS_10', 'RECOVERY_1'
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: 'Award',
    },
    category: {
      type: String,
      enum: ['streak', 'completions', 'consistency', 'recovery', 'special'],
      default: 'streak',
    },
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate achievements
achievementSchema.index({ userId: 1, type: 1 }, { unique: true });

export const Achievement = mongoose.model('Achievement', achievementSchema);
export default Achievement;
