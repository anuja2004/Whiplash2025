// models/Quiz.js
import mongoose from 'mongoose';

const QuizSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  timeLimit: {
    type: Number,  // in minutes
    default: 0  // 0 means no time limit
  },
  passingScore: {
    type: Number,
    default: 0
  },
  questions: [{
    questionText: String,
    questionType: {
      type: String,
      enum: ['multiple-choice', 'true-false', 'short-answer', 'essay'],
      default: 'multiple-choice'
    },
    options: [{
      text: String,
      isCorrect: Boolean
    }],
    correctAnswer: String,  // For short-answer questions
    points: {
      type: Number,
      default: 1
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Quiz', QuizSchema);