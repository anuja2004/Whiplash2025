// controllers/quizController.js
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import QuizAttempt from '../models/QuizAttempt.js';

// @desc Get quizzes by course
// @route GET /api/quizzes?courseId=xxx
// @access Private
export const getQuizzes = async (req, res, next) => {
  try {
    const { courseId, topicId } = req.query;
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a courseId'
      });
    }
    const query = { course: courseId };
    if (topicId) query.topic = topicId;
    
    const quizzes = await Quiz.find(query)
      .select('title description dueDate timeLimit')
      .sort({ dueDate: 1 });
      
    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc Get a single quiz with questions
// @route GET /api/quizzes/:id
// @access Private
export const getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('questions');
      
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    res.status(200).json({
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

// @desc Submit quiz answers
// @route POST /api/quizzes/:id/submit
// @access Private (Student)
export const submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of answers'
      });
    }
    
    const quiz = await Quiz.findById(req.params.id)
      .populate('questions');
      
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    // Calculate score
    let score = 0;
    const results = [];
    
    for (const answer of answers) {
      const question = quiz.questions.find(q => q._id.toString() === answer.questionId);
      if (!question) continue;
      
      let isCorrect = false;
      if (question.type === 'multiple-choice') {
        // Check if selected option is correct
        const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect);
        isCorrect = answer.selectedOption === correctOptionIndex;
      } else if (question.type === 'true-false' || question.type === 'short-answer') {
        // Check if answer matches correct answer (case insensitive)
        isCorrect = answer.answer.toLowerCase() === question.correctAnswer.toLowerCase();
      }
      
      if (isCorrect) {
        score += question.points;
      }
      
      results.push({
        questionId: question._id,
        isCorrect,
        points: isCorrect ? question.points : 0
      });
    }
    
    // Calculate percentage
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = (score / totalPoints) * 100;
    
    // Save quiz attempt
    const attempt = await QuizAttempt.create({
      quiz: req.params.id,
      user: req.user.id,
      answers,
      results,
      score,
      percentage,
      completedAt: Date.now()
    });
    
    res.status(200).json({
      success: true,
      data: {
        score,
        percentage,
        results,
        attemptId: attempt._id
      }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};