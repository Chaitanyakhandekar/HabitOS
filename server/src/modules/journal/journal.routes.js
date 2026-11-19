import { Router } from 'express';
import * as journalController from './journal.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { createJournalSchema, updateJournalSchema } from './journal.validation.js';

const router = Router();

router.use(authenticate);

// Specific routes before params
router.get('/weekly-review', journalController.getWeeklyReview);
router.get('/', journalController.getJournalEntries);
router.post('/', validateRequest(createJournalSchema), journalController.saveJournal);
router.get('/:date', journalController.getJournalEntryByDate);
router.patch('/:id', validateRequest(updateJournalSchema), journalController.updateJournalEntry);
router.delete('/:id', journalController.deleteJournalEntry);

export default router;
