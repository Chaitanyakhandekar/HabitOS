import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import * as goalService from './goal.service.js';

export const createGoal = asyncHandler(async (req, res) => {
  const goal = await goalService.createGoal(req.user._id, req.body);
  return new ApiResponse(201, { goal }, 'Goal created successfully').send(res);
});

export const getGoals = asyncHandler(async (req, res) => {
  const goals = await goalService.getGoals(req.user._id, req.query);
  return new ApiResponse(200, { goals }, 'Goals retrieved successfully').send(res);
});

export const getGoalById = asyncHandler(async (req, res) => {
  const goal = await goalService.getGoalById(req.user._id, req.params.id);
  return new ApiResponse(200, { goal }, 'Goal details retrieved successfully').send(res);
});

export const updateGoal = asyncHandler(async (req, res) => {
  const goal = await goalService.updateGoal(req.user._id, req.params.id, req.body);
  return new ApiResponse(200, { goal }, 'Goal updated successfully').send(res);
});

export const deleteGoal = asyncHandler(async (req, res) => {
  await goalService.deleteGoal(req.user._id, req.params.id);
  return new ApiResponse(200, {}, 'Goal deleted successfully').send(res);
});
