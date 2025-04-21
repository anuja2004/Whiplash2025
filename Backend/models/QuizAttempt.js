// models/QuizAttempt.js
// ---------------------
// Defines the QuizAttempt schema and model for tracking quiz attempts

import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Define the schema for a QuizAttempt
const QuizAttemptSchema = new Schema({
  quiz: {
    type: Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [
    {
      questionId: {
        type: Schema.Types.ObjectId,
        ref: 'Question',
        required: true
      },
      selectedOption: Number,
      answer: String
    }
  ],
  results: [
    {
      questionId: {
        type: Schema.Types.ObjectId,
        ref: 'Question'
      },
      isCorrect: Boolean,
      points: Number
    }
  ],
  score: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

const QuizAttempt = model('QuizAttempt', QuizAttemptSchema);

export default QuizAttempt;
