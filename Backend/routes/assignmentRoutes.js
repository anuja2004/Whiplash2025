// routes/assignmentRoutes.js
// --------------------------
// Handles assignment-related routes with authentication and detailed logging

import express from 'express';
import {
  getAssignments,
  getAssignmentsDueOnDate,
  submitAssignment
} from '../controllers/assignmentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/assignments
 * @desc    Retrieve all assignments for the authenticated user
 * @access  Protected
 */
router.get('/', protect, async (req, res, next) => {
  try {
    console.log('[AssignmentRoutes] GET /api/assignments - Fetching assignments for user ID:', req.user.id);
    await getAssignments(req, res, next);
  } catch (error) {
    console.error('[AssignmentRoutes] Error fetching assignments:', error);
    next(error);
  }
});

/**
 * @route   GET /api/assignments/due
 * @desc    Retrieve assignments due on a specific date
 * @access  Protected
 */
router.get('/due', protect, async (req, res, next) => {
  try {
    console.log('[AssignmentRoutes] GET /api/assignments/due - Fetching assignments due on date:', req.query.date);
    await getAssignmentsDueOnDate(req, res, next);
  } catch (error) {
    console.error('[AssignmentRoutes] Error fetching assignments due on date:', error);
    next(error);
  }
});

/**
 * @route   POST /api/assignments/:id/submission
 * @desc    Submit an assignment by its ID
 * @access  Protected
 */
router.post('/:id/submission', protect, async (req, res, next) => {
  try {
    console.log(`[AssignmentRoutes] POST /api/assignments/${req.params.id}/submission - Submitting assignment with data:`, req.body);
    await submitAssignment(req, res, next);
  } catch (error) {
    console.error(`[AssignmentRoutes] Error submitting assignment ID ${req.params.id}:`, error);
    next(error);
  }
});

export default router;
