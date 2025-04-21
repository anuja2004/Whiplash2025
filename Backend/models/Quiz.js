// models/Quiz.js
// --------------
// Defines the Quiz schema and model for quizzes

import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Define the schema for a Quiz
const QuizSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  description: {
    type: String
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  topic: {
    type: Schema.Types.ObjectId,
    ref: 'Topic'
  },
  dueDate: {
    type: Date
  },
  timeLimit: {
    type: Number, // in minutes
    default: 30
  },
  questions: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Question'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Quiz = model('Quiz', QuizSchema);

export default Quiz;
