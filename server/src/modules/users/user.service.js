import { User } from '../../models/User.js';
import { ApiError } from '../../utils/ApiError.js';
import mongoose from 'mongoose';

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

export const updateUserProfile = async (userId, { name, email, timezone }) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  if (email && email !== user.email) {
    const existing = await User.findOne({ email, _id: { $ne: userId } });
    if (existing) {
      throw new ApiError(409, 'An account with this email already exists');
    }
    user.email = email;
  }

  if (name) user.name = name;
  if (timezone) user.timezone = timezone;

  await user.save();
  return user;
};

export const changeUserPassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new ApiError(404, 'User not found');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();
  return { success: true };
};

export const updateUserSettings = async (userId, { theme, weekStartsOn, timezone }) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  if (theme) user.settings.theme = theme;
  if (weekStartsOn) user.settings.weekStartsOn = weekStartsOn;
  if (timezone) user.timezone = timezone;

  await user.save();
  return user;
};

export const updateNotificationPreferences = async (userId, preferences) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  user.notifications = {
    ...user.notifications.toObject(),
    ...preferences,
  };

  await user.save();
  return user.notifications;
};

export const deleteUserAccount = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  // Cascade delete all user-related records
  const db = mongoose.connection;
  await Promise.all([
    db.collection('habits').deleteMany({ userId: user._id }),
    db.collection('habitlogs').deleteMany({ userId: user._id }),
    db.collection('goals').deleteMany({ userId: user._id }),
    db.collection('journalentries').deleteMany({ userId: user._id }),
    db.collection('achievements').deleteMany({ userId: user._id }),
    User.findByIdAndDelete(userId),
  ]);

  return { success: true };
};
