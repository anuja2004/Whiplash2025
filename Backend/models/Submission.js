// models/Submission.js
// --------------------
// Defines the Submission schema and model for assignment submissions

import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Define the schema for a Submission
const SubmissionSchema = new Schema({
  assignment: {
    type: Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Please provide submission content']
  },
  fileUrl: {
    type: String
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  grade: {
    type: Number,
    min: 0
  },
  feedback: {
    type: String
  },
  gradedAt: {
    type: Date
  },
  gradedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

const Submission = model('Submission', SubmissionSchema);

export default Submission;
