import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    error = new ApiError(400, `Invalid ${err.path}: ${err.value}`);
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const keys = Object.keys(err.keyPattern || err.keyValue || {});
    error = new ApiError(409, `Duplicate value for field(s): ${keys.join(', ')}`);
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(400, `Validation Error: ${messages.join(', ')}`, messages);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid authentication token');
  }
  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Authentication token expired');
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  const errors = error.errors || [];

  const response = {
    success: false,
    message,
    errors: errors.length > 0 ? errors : undefined,
  };

  if (env.NODE_ENV === 'development' && !(error instanceof ApiError)) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

export default errorHandler;
