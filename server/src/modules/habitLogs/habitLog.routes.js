import { Router } from 'express';
import * as habitLogController from './habitLog.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { logHabitSchema, updateLogSchema } from './habitLog.validation.js';

const router = Router();

router.use(authenticate);

router.get('/', habitLogController.getLogs);
router.post('/', validateRequest(logHabitSchema), habitLogController.logHabit);
router.patch('/:id', validateRequest(updateLogSchema), habitLogController.updateLog);
router.delete('/:id', habitLogController.deleteLog);

export default router;
