import { Router } from 'express';
import * as achievementController from './achievement.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/', achievementController.getAchievements);
router.get('/progress', achievementController.getProgress);

export default router;
