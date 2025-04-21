// routes/courseRoutes.js
// ----------------------
// Handles course-related routes with authentication and role-based access control

import express from 'express';
import {
  getCourses,
  createCourse,
  getCourseSyllabus,
  enrollCourse
} from '../controllers/courseController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/courses
 * @desc    Retrieve all available courses
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    console.log('[CourseRoutes] GET /api/courses - Fetching all courses');
    await getCourses(req, res, next);
  } catch (error) {
    console.error('[CourseRoutes] Error fetching courses:', error);
    next(error);
  }
});

/**
 * @route   POST /api/courses
 * @desc    Create a new course
 * @access  Protected (Instructor/Admin)
 */
router.post('/', protect, authorize('instructor', 'admin'), async (req, res, next) => {
  try {
    console.log('[CourseRoutes] POST /api/courses - Creating course by user:', req.user.id);
    await createCourse(req, res, next);
  } catch (error) {
    console.error('[CourseRoutes] Error creating course:', error);
    next(error);
  }
});

/**
 * @route   GET /api/courses/:id/syllabus
 * @desc    Get the syllabus for a specific course
 * @access  Protected
 */
router.get('/:id/syllabus', protect, async (req, res, next) => {
  try {
    console.log(`[CourseRoutes] GET /api/courses/${req.params.id}/syllabus - Fetching syllabus`);
    await getCourseSyllabus(req, res, next);
  } catch (error) {
    console.error(`[CourseRoutes] Error fetching syllabus for course ${req.params.id}:`, error);
    next(error);
  }
});

/**
 * @route   POST /api/courses/:id/enroll
 * @desc    Enroll the authenticated student in a course
 * @access  Protected (Student)
 */
router.post('/:id/enroll', protect, authorize('student'), async (req, res, next) => {
  try {
    console.log(`[CourseRoutes] POST /api/courses/${req.params.id}/enroll - Enrolling user:`, req.user.id);
    await enrollCourse(req, res, next);
  } catch (error) {
    console.error(`[CourseRoutes] Error enrolling in course ${req.params.id}:`, error);
    next(error);
  }
});

export default router;
