import { Router } from 'express';
import * as exportController from './export.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/habits', exportController.exportHabits);
router.get('/logs', exportController.exportLogs);
router.get('/journal', exportController.exportJournal);

export default router;
