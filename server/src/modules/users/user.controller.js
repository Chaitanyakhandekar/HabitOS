import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import * as userService from './user.service.js';
import { env } from '../../config/env.js';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getUserProfile(req.user._id);
  return new ApiResponse(200, { user }, 'Profile retrieved successfully').send(res);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateUserProfile(req.user._id, req.body);
  return new ApiResponse(200, { user }, 'Profile updated successfully').send(res);
});

export const updatePassword = asyncHandler(async (req, res) => {
  await userService.changeUserPassword(req.user._id, req.body);
  return new ApiResponse(200, {}, 'Password updated successfully').send(res);
});

export const updateSettings = asyncHandler(async (req, res) => {
  const user = await userService.updateUserSettings(req.user._id, req.body);
  return new ApiResponse(200, { settings: user.settings, timezone: user.timezone }, 'Settings updated successfully').send(res);
});

export const updateNotifications = asyncHandler(async (req, res) => {
  const notifications = await userService.updateNotificationPreferences(req.user._id, req.body);
  return new ApiResponse(200, { notifications }, 'Notification preferences updated successfully').send(res);
});

export const deleteAccount = asyncHandler(async (req, res) => {
  await userService.deleteUserAccount(req.user._id);

  res.clearCookie('token', {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
  });

  return new ApiResponse(200, {}, 'Account and associated data deleted successfully').send(res);
});
