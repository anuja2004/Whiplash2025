// controllers/aiController.js
import Course from '../models/Course.js';
import Topic from '../models/Topic.js';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Note from '../models/Note.js';
import Enrollment from '../models/Enrollment.js';
import * as aiService from '../services/aiService.js';


// @desc    Get personalized recommendations
// @route   POST /api/ai/recommendation
// @access  Private
export const getRecommendations = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a courseId'
      });
    }
    
    // Get user's progress and activity in the course
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: courseId
    });
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }
    
    // Get quiz attempts for the course
    const courseQuizzes = await Quiz.find({ course: courseId });
    const quizIds = courseQuizzes.map(quiz => quiz._id);
    
    const quizAttempts = await QuizAttempt.find({
      user: req.user.id,
      quiz: { $in: quizIds }
    }).populate('quiz', 'topic');
    
    // Get assignment submissions
    const courseAssignments = await Assignment.find({ course: courseId });
    const assignmentIds = courseAssignments.map(assignment => assignment._id);
    
    const submissions = await Submission.find({
      user: req.user.id,
      assignment: { $in: assignmentIds }
    }).populate('assignment', 'topic');
    
    // Get course topics
    const topics = await Topic.find({ course: courseId });
    
    // Use AI service to get recommendations
    const recommendations = await aiService.generateRecommendations({
      userId: req.user.id,
      courseId,
      topics,
      quizAttempts,
      submissions,
      enrollment
    });
    
    res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Generate quiz based on topics
// @route   POST /api/ai/quiz-generator
// @access  Private (Instructor, Admin)
export const generateQuiz = async (req, res, next) => {
  try {
    const { courseId, topicIds, questionCount = 5, difficulty = 'medium' } = req.body;
    
    if (!courseId || !topicIds || !Array.isArray(topicIds)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide courseId and topicIds array'
      });
    }
    
    // Get topics
    const topics = await Topic.find({
      _id: { $in: topicIds },
      course: courseId
    });
    
    if (topics.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No valid topics found'
      });
    }
    
    // Get course
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Generate quiz using AI service
    const generatedQuiz = await aiService.generateQuiz({
      course,
      topics,
      questionCount,
      difficulty
    });
    
    // Save questions
    const savedQuestions = [];
    
    for (const questionData of generatedQuiz.questions) {
      const question = await Question.create(questionData);
      savedQuestions.push(question._id);
    }
    
    // Create quiz
    const quiz = await Quiz.create({
      title: generatedQuiz.title,
      description: generatedQuiz.description,
      course: courseId,
      topic: topics.length === 1 ? topics[0]._id : null,
      questions: savedQuestions
    });
    
    res.status(201).json({
      success: true,
      data: quiz
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get learning progress analytics
// @route   GET /api/analytics/progress?userId=xxx
// @access  Private (Self or Instructor)
export const getProgressAnalytics = async (req, res, next) => {
  try {
    const userId = req.query.userId || req.user.id;
    
    // Check if user is authorized to view this data
    if (userId !== req.user.id && req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this data'
      });
    }
    
    // Get enrollments
    const enrollments = await Enrollment.find({ user: userId })
      .populate('course', 'title');
    
    // Get analytics for each course
    const courseAnalytics = [];
    
    for (const enrollment of enrollments) {
      // Get quiz attempts
      const courseQuizzes = await Quiz.find({ course: enrollment.course._id });
      const quizIds = courseQuizzes.map(quiz => quiz._id);
      
      const quizAttempts = await QuizAttempt.find({
        user: userId,
        quiz: { $in: quizIds }
      });
      
      // Get assignment submissions
      const courseAssignments = await Assignment.find({ course: enrollment.course._id });
      const assignmentIds = courseAssignments.map(assignment => assignment._id);
      
      const submissions = await Submission.find({
        user: userId,
        assignment: { $in: assignmentIds }
      });
      
      // Calculate metrics
      const totalQuizzes = courseQuizzes.length;
      const completedQuizzes = quizAttempts.length;
      const quizAverage = quizAttempts.length > 0
        ? quizAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / quizAttempts.length
        : 0;
      
      const totalAssignments = courseAssignments.length;
      const completedAssignments = submissions.length;
      
      const gradedSubmissions = submissions.filter(sub => sub.grade !== undefined);
      const assignmentAverage = gradedSubmissions.length > 0
        ? gradedSubmissions.reduce((sum, sub) => sum + sub.grade, 0) / gradedSubmissions.length
        : 0;
      
      courseAnalytics.push({
        courseId: enrollment.course._id,
        courseTitle: enrollment.course.title,
        enrolledAt: enrollment.enrolledAt,
        lastAccessedAt: enrollment.lastAccessedAt,
        progress: enrollment.progress,
        quizStats: {
          total: totalQuizzes,
          completed: completedQuizzes,
          completionRate: totalQuizzes > 0 ? (completedQuizzes / totalQuizzes) * 100 : 0,
          averageScore: quizAverage
        },
        assignmentStats: {
          total: totalAssignments,
          completed: completedAssignments,
          completionRate: totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0,
          averageGrade: assignmentAverage
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        totalCourses: enrollments.length,
        courseAnalytics
      }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};