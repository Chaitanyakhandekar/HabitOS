import { Router } from 'express';
import * as notificationController from './notification.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/preferences', notificationController.getPreferences);
router.patch('/preferences', notificationController.updatePreferences);
router.post('/subscribe', notificationController.subscribe);
router.delete('/subscribe', notificationController.unsubscribe);

export default router;
