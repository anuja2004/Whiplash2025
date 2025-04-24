// routes/studentRoutes.js
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import studentController from '../controllers/studentController.js';

const router = express.Router();

// Apply authentication middleware to all student routes
router.use(authMiddleware);

// Get all courses the student is enrolled in
router.get('/courses', studentController.getEnrolledCourses);

// Get detailed information about a specific course
router.get('/courses/:courseId', studentController.getCourseDetails);

// Get assignments for a specific course
router.get('/courses/:courseId/assignments', studentController.getCourseAssignments);

// Get quizzes for a specific course
router.get('/courses/:courseId/quizzes', studentController.getCourseQuizzes);

// Get student's progress for a specific course
router.get('/courses/:courseId/progress', studentController.getCourseProgress);

// Learning dashboard modules
router.get('/courses/:courseId/modules', studentController.getCourseModules);
router.post('/courses/:courseId/modules/:moduleId/complete', studentController.completeModule);

// Submit an assignment
router.post('/assignments/:assignmentId/submit', studentController.submitAssignment);

// Submit a quiz attempt
router.post('/quizzes/:quizId/submit', studentController.submitQuiz);

// Create a note for a course topic
router.post('/courses/:courseId/topics/:topicId/notes', studentController.createNote);

// Get notes for a course topic
router.get('/courses/:courseId/topics/:topicId/notes', studentController.getNotesByTopic);

export default router;