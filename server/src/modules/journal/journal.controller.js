import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import * as journalService from './journal.service.js';

export const saveJournal = asyncHandler(async (req, res) => {
  const entry = await journalService.saveJournalEntry(req.user._id, req.body);
  return new ApiResponse(200, { entry }, 'Journal reflection saved successfully').send(res);
});

export const getJournalEntries = asyncHandler(async (req, res) => {
  const entries = await journalService.getJournalEntries(req.user._id, req.query);
  return new ApiResponse(200, { entries }, 'Journal entries retrieved successfully').send(res);
});

export const getWeeklyReview = asyncHandler(async (req, res) => {
  const review = await journalService.getWeeklyReview(req.user._id, req.user.timezone, req.query.date);
  return new ApiResponse(200, { review }, 'Weekly review retrieved successfully').send(res);
});

export const getJournalEntryByDate = asyncHandler(async (req, res) => {
  const entry = await journalService.getJournalEntryByDate(req.user._id, req.params.date);
  return new ApiResponse(200, { entry }, 'Journal entry retrieved successfully').send(res);
});

export const updateJournalEntry = asyncHandler(async (req, res) => {
  const entry = await journalService.updateJournalEntry(req.user._id, req.params.id, req.body);
  return new ApiResponse(200, { entry }, 'Journal entry updated successfully').send(res);
});

export const deleteJournalEntry = asyncHandler(async (req, res) => {
  await journalService.deleteJournalEntry(req.user._id, req.params.id);
  return new ApiResponse(200, {}, 'Journal entry deleted successfully').send(res);
});
