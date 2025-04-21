// routes/authRoutes.js
// --------------------
// Handles user authentication routes: register, login, and get current user info

import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { protect }from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res, next) => {
  try {
    console.log('[AuthRoutes] POST /api/auth/register - Registering user with data:', req.body);
    await register(req, res, next);
  } catch (error) {
    console.error('[AuthRoutes] Error during registration:', error);
    next(error);
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return token
 * @access  Public
 */
router.post('/login', async (req, res, next) => {
  try {
    console.log('[AuthRoutes] POST /api/auth/login - Logging in user with data:', req.body);
    await login(req, res, next);
  } catch (error) {
    console.error('[AuthRoutes] Error during login:', error);
    next(error);
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user's information
 * @access  Private
 */
router.get('/me', protect, async (req, res, next) => {
  try {
    console.log('[AuthRoutes] GET /api/auth/me - Fetching current user info for user ID:', req.user.id);
    await getMe(req, res, next);
  } catch (error) {
    console.error('[AuthRoutes] Error fetching current user info:', error);
    next(error);
  }
});

export default router;
