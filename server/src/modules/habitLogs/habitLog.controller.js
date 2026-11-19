import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import * as habitLogService from './habitLog.service.js';

export const logHabit = asyncHandler(async (req, res) => {
  const log = await habitLogService.logHabit(req.user._id, req.body, req.user.timezone);
  return new ApiResponse(200, { log }, 'Habit logged successfully').send(res);
});

export const getLogs = asyncHandler(async (req, res) => {
  const logs = await habitLogService.getUserLogs(req.user._id, req.query);
  return new ApiResponse(200, { logs }, 'Habit logs retrieved successfully').send(res);
});

export const updateLog = asyncHandler(async (req, res) => {
  const log = await habitLogService.updateLog(req.user._id, req.params.id, req.body);
  return new ApiResponse(200, { log }, 'Habit log updated successfully').send(res);
});

export const deleteLog = asyncHandler(async (req, res) => {
  await habitLogService.deleteLog(req.user._id, req.params.id);
  return new ApiResponse(200, {}, 'Habit log deleted successfully').send(res);
});
