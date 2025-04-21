// routes/quizRoutes.js (ES Module)
// --------------------------
// Defines routes for quiz-related operations with detailed comments

import express from 'express';                                  // Express framework
import { getQuizzes, getQuiz, submitQuiz } from '../controllers/quizController.js';
import { protect } from '../middleware/auth.js';               // Authentication middleware

const router = express.Router();

/**
 * @route   GET /api/quizzes
 * @desc    Retrieve all quizzes for the authenticated user
 * @access  Protected
 */
router.get('/', protect, async (req, res, next) => {
  try {
    console.log('[QuizRoutes] GET /api/quizzes - Fetching all quizzes for user', req.user.id);
    await getQuizzes(req, res, next);
  } catch (error) {
    console.error('[QuizRoutes] Error in GET /api/quizzes:', error);
    next(error);
  }
});

/**
 * @route   GET /api/quizzes/:id
 * @desc    Retrieve a single quiz by its ID
 * @access  Protected
 */
router.get('/:id', protect, async (req, res, next) => {
  try {
    console.log('[QuizRoutes] GET /api/quizzes/:id - Fetching quiz', req.params.id);
    await getQuiz(req, res, next);
  } catch (error) {
    console.error(`[QuizRoutes] Error in GET /api/quizzes/${req.params.id}:`, error);
    next(error);
  }
});

/**
 * @route   POST /api/quizzes/:id/submit
 * @desc    Submit answers for a quiz and receive results
 * @access  Protected
 */
router.post('/:id/submit', protect, async (req, res, next) => {
  try {
    console.log('[QuizRoutes] POST /api/quizzes/:id/submit - Submitting quiz', req.params.id);
    await submitQuiz(req, res, next);
  } catch (error) {
    console.error(`[QuizRoutes] Error in POST /api/quizzes/${req.params.id}/submit:`, error);
    next(error);
  }
});

export default router;
