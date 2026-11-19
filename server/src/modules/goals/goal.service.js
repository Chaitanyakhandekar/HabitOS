import { Goal } from '../../models/Goal.js';
import { ApiError } from '../../utils/ApiError.js';

export const createGoal = async (userId, data) => {
  const goal = await Goal.create({
    ...data,
    userId,
    status: 'active',
  });
  return goal;
};

export const getGoals = async (userId, query = {}) => {
  const { status } = query;
  const filter = { userId };
  if (status && status !== 'all') {
    filter.status = status;
  }
  return Goal.find(filter).populate('habitId', 'name category color icon').sort({ deadline: 1 });
};

export const getGoalById = async (userId, goalId) => {
  const goal = await Goal.findOne({ _id: goalId, userId }).populate('habitId', 'name category color icon');
  if (!goal) throw new ApiError(404, 'Goal not found');
  return goal;
};

export const updateGoal = async (userId, goalId, updates) => {
  const goal = await Goal.findOne({ _id: goalId, userId });
  if (!goal) throw new ApiError(404, 'Goal not found');

  // Auto-complete goal if progress reaches target
  if (typeof updates.progress === 'number' && updates.progress >= (updates.target || goal.target)) {
    updates.status = 'completed';
  }

  Object.assign(goal, updates);
  await goal.save();
  return goal;
};

export const deleteGoal = async (userId, goalId) => {
  const goal = await Goal.findOne({ _id: goalId, userId });
  if (!goal) throw new ApiError(404, 'Goal not found');

  await Goal.findByIdAndDelete(goalId);
  return { success: true };
};
