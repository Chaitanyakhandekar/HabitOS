import { Router } from 'express';
import * as analyticsController from './analytics.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/overview', analyticsController.getOverview);
router.get('/trends', analyticsController.getTrends);
router.get('/heatmap', analyticsController.getHeatmap);
router.get('/habit/:habitId', analyticsController.getHabitAnalytics);
router.get('/weekday', analyticsController.getWeekday);
router.get('/category', analyticsController.getCategory);
router.get('/insights', analyticsController.getInsights);

export default router;
