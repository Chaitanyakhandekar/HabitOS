import { User } from '../../models/User.js';
import { ApiError } from '../../utils/ApiError.js';

export const registerUser = async ({ name, email, password, timezone = 'UTC' }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email address already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    timezone,
  });

  const token = user.generateAuthToken();

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      timezone: user.timezone,
      settings: user.settings,
      notifications: user.notifications,
      createdAt: user.createdAt,
    },
    token,
  };
};

export const loginUser = async ({ email, password }) => {
  // Explicitly select password since it has select: false
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = user.generateAuthToken();

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      timezone: user.timezone,
      settings: user.settings,
      notifications: user.notifications,
      createdAt: user.createdAt,
    },
    token,
  };
};
