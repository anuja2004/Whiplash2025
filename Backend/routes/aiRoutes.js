// routes/aiRoutes.js
// ------------------
// Handles AI-related routes: recommendations, quiz generation, and progress analytics

import express from 'express';
import {
  getRecommendations,
  generateQuiz,
  getProgressAnalytics
} from '../controllers/aiController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/ai/recommendation
 * @desc    Get AI-based course recommendations for the authenticated user
 * @access  Protected
 */
router.post('/recommendation', protect, async (req, res, next) => {
  try {
    console.log('[AIRoutes] POST /api/ai/recommendation - User ID:', req.user.id);
    await getRecommendations(req, res, next);
  } catch (error) {
    console.error('[AIRoutes] Error in getRecommendations:', error);
    next(error);
  }
});

/**
 * @route   POST /api/ai/quiz-generator
 * @desc    Generate a quiz based on provided topic and difficulty
 * @access  Protected (Instructor/Admin)
 */
router.post('/quiz-generator', protect, authorize('instructor', 'admin'), async (req, res, next) => {
  try {
    console.log('[AIRoutes] POST /api/ai/quiz-generator - User ID:', req.user.id, 'Payload:', req.body);
    await generateQuiz(req, res, next);
  } catch (error) {
    console.error('[AIRoutes] Error in generateQuiz:', error);
    next(error);
  }
});

/**
 * @route   GET /api/ai/analytics/progress
 * @desc    Retrieve progress analytics for the authenticated user
 * @access  Protected
 */
router.get('/analytics/progress', protect, async (req, res, next) => {
  try {
    console.log('[AIRoutes] GET /api/ai/analytics/progress - User ID:', req.user.id);
    await getProgressAnalytics(req, res, next);
  } catch (error) {
    console.error('[AIRoutes] Error in getProgressAnalytics:', error);
    next(error);
  }
});

export default router;
