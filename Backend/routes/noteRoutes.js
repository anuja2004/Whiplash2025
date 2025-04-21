// routes/noteRoutes.js (ES Module)
// --------------------------
// Defines routes for note-related operations with enhanced comments and logging

import express from 'express';
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote
} from '../controllers/noteController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/notes
 * @desc    Retrieve all notes for the authenticated user
 * @access  Protected
 */
router.get('/', protect, async (req, res, next) => {
  try {
    console.log('[NoteRoutes] GET /api/notes - Fetching notes for user', req.user.id);
    await getNotes(req, res, next);
  } catch (error) {
    console.error('[NoteRoutes] Error fetching notes:', error);
    next(error);
  }
});

/**
 * @route   POST /api/notes
 * @desc    Create a new note for the authenticated user
 * @access  Protected
 */
router.post('/', protect, async (req, res, next) => {
  try {
    console.log('[NoteRoutes] POST /api/notes - Creating note for user', req.user.id, 'Payload:', req.body);
    await createNote(req, res, next);
  } catch (error) {
    console.error('[NoteRoutes] Error creating note:', error);
    next(error);
  }
});

/**
 * @route   PUT /api/notes/:id
 * @desc    Update an existing note by its ID
 * @access  Protected
 */
router.put('/:id', protect, async (req, res, next) => {
  try {
    console.log(`[NoteRoutes] PUT /api/notes/${req.params.id} - Updating note`, 'Payload:', req.body);
    await updateNote(req, res, next);
  } catch (error) {
    console.error(`[NoteRoutes] Error updating note ${req.params.id}:`, error);
    next(error);
  }
});

/**
 * @route   DELETE /api/notes/:id
 * @desc    Delete a note by its ID
 * @access  Protected
 */
router.delete('/:id', protect, async (req, res, next) => {
  try {
    console.log(`[NoteRoutes] DELETE /api/notes/${req.params.id} - Deleting note`);
    await deleteNote(req, res, next);
  } catch (error) {
    console.error(`[NoteRoutes] Error deleting note ${req.params.id}:`, error);
    next(error);
  }
});

export default router;
