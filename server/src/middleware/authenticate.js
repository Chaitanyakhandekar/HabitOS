import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  let token = null;

  // Check HTTP-only cookie first
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // Check Authorization Bearer header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError(401, 'Authentication required. Please log in.'));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ApiError(401, 'User associated with this token no longer exists.'));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Session expired. Please log in again.'));
    }
    return next(new ApiError(401, 'Invalid authentication token.'));
  }
});

export default authenticate;
