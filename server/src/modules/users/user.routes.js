import { Router } from 'express';
import * as userController from './user.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import {
  updateProfileSchema,
  updatePasswordSchema,
  updateSettingsSchema,
  updateNotificationPreferencesSchema,
} from './user.validation.js';

const router = Router();

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.patch('/profile', validateRequest(updateProfileSchema), userController.updateProfile);
router.patch('/password', validateRequest(updatePasswordSchema), userController.updatePassword);
router.patch('/settings', validateRequest(updateSettingsSchema), userController.updateSettings);
router.patch('/notifications', validateRequest(updateNotificationPreferencesSchema), userController.updateNotifications);
router.delete('/account', userController.deleteAccount);

export default router;
