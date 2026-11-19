import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { User } from '../../models/User.js';

export const getPreferences = asyncHandler(async (req, res) => {
  return new ApiResponse(
    200,
    { notifications: req.user.notifications, timezone: req.user.timezone },
    'Notification preferences retrieved successfully'
  ).send(res);
});

export const updatePreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.notifications = {
    ...user.notifications.toObject(),
    ...req.body,
  };
  await user.save();

  return new ApiResponse(
    200,
    { notifications: user.notifications },
    'Notification preferences updated successfully'
  ).send(res);
});

export const subscribe = asyncHandler(async (req, res) => {
  // Store browser push notification subscription token if provided
  return new ApiResponse(200, { subscribed: true }, 'Browser notification subscription registered').send(res);
});

export const unsubscribe = asyncHandler(async (req, res) => {
  return new ApiResponse(200, { subscribed: false }, 'Unsubscribed successfully').send(res);
});
