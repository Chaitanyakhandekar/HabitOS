import { Router } from 'express';
import * as goalController from './goal.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { createGoalSchema, updateGoalSchema } from './goal.validation.js';

const router = Router();

router.use(authenticate);

router.get('/', goalController.getGoals);
router.post('/', validateRequest(createGoalSchema), goalController.createGoal);
router.get('/:id', goalController.getGoalById);
router.patch('/:id', validateRequest(updateGoalSchema), goalController.updateGoal);
router.delete('/:id', goalController.deleteGoal);

export default router;
