import { Router } from 'express';
import * as authController from './auth.controller.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authRateLimiter } from '../../middleware/rateLimiter.js';
import { registerSchema, loginSchema } from './auth.validation.js';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  validateRequest(registerSchema),
  authController.register
);

router.post(
  '/login',
  authRateLimiter,
  validateRequest(loginSchema),
  authController.login
);

router.post('/logout', authController.logout);

router.get('/me', authenticate, authController.getMe);

export default router;
