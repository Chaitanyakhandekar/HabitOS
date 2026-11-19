import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import * as authService from './auth.service.js';
import { env } from '../../config/env.js';

export const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

export const register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.registerUser(req.body);

  res.cookie('token', token, getCookieOptions());

  return new ApiResponse(201, { user, token }, 'User registered successfully').send(res);
});

export const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.loginUser(req.body);

  res.cookie('token', token, getCookieOptions());

  return new ApiResponse(200, { user, token }, 'Logged in successfully').send(res);
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
  });

  return new ApiResponse(200, {}, 'Logged out successfully').send(res);
});

export const getMe = asyncHandler(async (req, res) => {
  const user = {
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    timezone: req.user.timezone,
    settings: req.user.settings,
    notifications: req.user.notifications,
    createdAt: req.user.createdAt,
  };

  return new ApiResponse(200, { user }, 'Current user retrieved successfully').send(res);
});
