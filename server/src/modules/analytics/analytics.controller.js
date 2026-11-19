import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import * as analyticsService from './analytics.service.js';

export const getOverview = asyncHandler(async (req, res) => {
  const data = await analyticsService.getOverview(req.user._id, req.user.timezone, req.query);
  return new ApiResponse(200, data, 'Analytics overview retrieved successfully').send(res);
});

export const getHeatmap = asyncHandler(async (req, res) => {
  const months = req.query.months ? Number(req.query.months) : 6;
  const data = await analyticsService.getHeatmap(req.user._id, req.user.timezone, months);
  return new ApiResponse(200, data, 'Heatmap data retrieved successfully').send(res);
});

export const getHabitAnalytics = asyncHandler(async (req, res) => {
  const data = await analyticsService.getHabitAnalytics(req.user._id, req.params.habitId, req.user.timezone, req.query);
  return new ApiResponse(200, data, 'Habit analytics retrieved successfully').send(res);
});

export const getWeekday = asyncHandler(async (req, res) => {
  const data = await analyticsService.getOverview(req.user._id, req.user.timezone, req.query);
  return new ApiResponse(200, { weekdayPerformance: data.weekdayPerformance }, 'Weekday analytics retrieved successfully').send(res);
});

export const getCategory = asyncHandler(async (req, res) => {
  const data = await analyticsService.getOverview(req.user._id, req.user.timezone, req.query);
  return new ApiResponse(200, { categoryBreakdown: data.categoryBreakdown }, 'Category analytics retrieved successfully').send(res);
});

export const getTrends = asyncHandler(async (req, res) => {
  const data = await analyticsService.getOverview(req.user._id, req.user.timezone, req.query);
  return new ApiResponse(200, { trendData: data.trendData }, 'Trend data retrieved successfully').send(res);
});

export const getInsights = asyncHandler(async (req, res) => {
  const insights = await analyticsService.getInsights(req.user._id, req.user.timezone);
  return new ApiResponse(200, { insights }, 'Insights generated successfully').send(res);
});
