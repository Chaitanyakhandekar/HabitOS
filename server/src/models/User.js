import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Don't return password by default
    },
    timezone: {
      type: String,
      default: 'UTC',
      trim: true,
    },
    settings: {
      theme: {
        type: String,
        enum: ['dark', 'light', 'system'],
        default: 'dark',
      },
      weekStartsOn: {
        type: String,
        enum: ['monday', 'sunday'],
        default: 'monday',
      },
    },
    notifications: {
      enabled: {
        type: Boolean,
        default: true,
      },
      reminderTime: {
        type: String,
        default: '09:00',
      },
      quietHoursStart: {
        type: String,
        default: '22:00',
      },
      quietHoursEnd: {
        type: String,
        default: '07:00',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, timezone: this.timezone },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.EXPIRES_IN_ACCESS_TOKEN }
  );
};

export const User = mongoose.model('User', userSchema);
export default User;
