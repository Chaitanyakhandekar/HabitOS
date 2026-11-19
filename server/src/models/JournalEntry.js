import mongoose from 'mongoose';

const journalEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    localDate: {
      type: String, // 'YYYY-MM-DD'
      required: true,
      index: true,
    },
    mood: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    energy: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    reflection: {
      type: String,
      required: [true, 'Reflection text is required'],
      trim: true,
      maxlength: [4000, 'Reflection cannot exceed 4000 characters'],
    },
    wins: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Wins cannot exceed 1000 characters'],
    },
    challenges: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Challenges cannot exceed 1000 characters'],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// One daily journal entry per user
journalEntrySchema.index({ userId: 1, localDate: 1 }, { unique: true });

export const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);
export default JournalEntry;
