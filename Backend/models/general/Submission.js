// models/Submission.js
import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: String,
  attachments: [{
    name: String,
    fileUrl: String,
    fileType: String
  }],
  status: {
    type: String,
    enum: ['draft', 'submitted', 'graded', 'returned'],
    default: 'draft'
  },
  grade: Number,
  feedback: String,
  submittedAt: {
    type: Date
  },
  gradedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for efficient retrieval
SubmissionSchema.index({ assignmentId: 1, userId: 1 });

export default mongoose.model('Submission', SubmissionSchema);