import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import * as habitService from './habit.service.js';

export const createHabit = asyncHandler(async (req, res) => {
  const habit = await habitService.createHabit(req.user._id, req.body, req.user.timezone);
  return new ApiResponse(201, { habit }, 'Habit created successfully').send(res);
});

export const getHabits = asyncHandler(async (req, res) => {
  const habits = await habitService.getUserHabits(req.user._id, req.query, req.user.timezone);
  return new ApiResponse(200, { habits }, 'Habits retrieved successfully').send(res);
});

export const getHabitById = asyncHandler(async (req, res) => {
  const data = await habitService.getHabitById(req.user._id, req.params.id, req.user.timezone);
  return new ApiResponse(200, data, 'Habit details retrieved successfully').send(res);
});

export const updateHabit = asyncHandler(async (req, res) => {
  const habit = await habitService.updateHabit(req.user._id, req.params.id, req.body, req.user.timezone);
  return new ApiResponse(200, { habit }, 'Habit updated successfully').send(res);
});

export const pauseHabit = asyncHandler(async (req, res) => {
  const habit = await habitService.pauseHabit(req.user._id, req.params.id, req.user.timezone);
  return new ApiResponse(200, { habit }, 'Habit paused successfully').send(res);
});

export const resumeHabit = asyncHandler(async (req, res) => {
  const habit = await habitService.resumeHabit(req.user._id, req.params.id, req.user.timezone);
  return new ApiResponse(200, { habit }, 'Habit resumed successfully').send(res);
});

export const archiveHabit = asyncHandler(async (req, res) => {
  const habit = await habitService.archiveHabit(req.user._id, req.params.id);
  return new ApiResponse(200, { habit }, 'Habit archived successfully').send(res);
});

export const deleteHabit = asyncHandler(async (req, res) => {
  await habitService.deleteHabit(req.user._id, req.params.id);
  return new ApiResponse(200, {}, 'Habit deleted successfully').send(res);
});

export const getTodayHabits = asyncHandler(async (req, res) => {
  const date = req.query.date; // optional date param for inspecting any specific day
  const data = await habitService.getTodayHabits(req.user._id, req.user.timezone, date);
  return new ApiResponse(200, data, "Today's habits retrieved successfully").send(res);
});

export const getTodaySummary = asyncHandler(async (req, res) => {
  const date = req.query.date;
  const summary = await habitService.getTodaySummary(req.user._id, req.user.timezone, date);
  return new ApiResponse(200, { summary }, "Today's summary retrieved successfully").send(res);
});
