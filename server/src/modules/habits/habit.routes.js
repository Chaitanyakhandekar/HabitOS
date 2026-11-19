import { Router } from 'express';
import * as habitController from './habit.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { createHabitSchema, updateHabitSchema } from './habit.validation.js';

const router = Router();

router.use(authenticate);

// Today endpoints must come before :id route
router.get('/today', habitController.getTodayHabits);
router.get('/today/summary', habitController.getTodaySummary);

router.get('/', habitController.getHabits);
router.post('/', validateRequest(createHabitSchema), habitController.createHabit);
router.get('/:id', habitController.getHabitById);
router.patch('/:id', validateRequest(updateHabitSchema), habitController.updateHabit);
router.delete('/:id', habitController.deleteHabit);

router.patch('/:id/pause', habitController.pauseHabit);
router.patch('/:id/resume', habitController.resumeHabit);
router.patch('/:id/archive', habitController.archiveHabit);

export default router;
