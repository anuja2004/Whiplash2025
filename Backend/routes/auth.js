// routes/auth.js
import express from 'express';
import { registerUser, loginUser, getCurrentUser } from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/users/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerUser);

/**
 * @route   POST /api/users/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', loginUser);

/**
 * @route   GET /api/users/me
 * @desc    Get current user's profile
 * @access  Private (requires authentication)
 */
router.get('/me', authMiddleware, getCurrentUser);

export default router;