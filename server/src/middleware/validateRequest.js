import { ApiError } from '../utils/ApiError.js';

/**
 * Express middleware to validate request payload against a Zod schema
 * @param {import('zod').ZodSchema} schema 
 * @param {'body'|'query'|'params'} source
 */
export const validateRequest = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const errorMessages = err.errors.map(
          (e) => `${e.path.join('.')}: ${e.message}`
        );
        return next(new ApiError(400, errorMessages[0] || 'Validation failed', errorMessages));
      }
      return next(new ApiError(400, err.message));
    }
  };
};

export default validateRequest;
