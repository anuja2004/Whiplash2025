// models/Question.js
// ------------------
// Defines the Question schema and model for quiz questions

import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Define the schema for a Question
const QuestionSchema = new Schema({
  text: {
    type: String,
    required: [true, 'Please add question text']
  },
  type: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'short-answer'],
    default: 'multiple-choice'
  },
  options: [
    {
      text: {
        type: String,
        required: function() {
          return this.type === 'multiple-choice';
        }
      },
      isCorrect: {
        type: Boolean,
        default: false
      }
    }
  ],
  correctAnswer: {
    type: String,
    required: function() {
      return this.type === 'short-answer' || this.type === 'true-false';
    }
  },
  points: {
    type: Number,
    default: 1
  },
  explanation: {
    type: String
  }
});

const Question = model('Question', QuestionSchema);

export default Question;
