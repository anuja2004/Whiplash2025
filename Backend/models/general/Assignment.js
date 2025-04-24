// models/Assignment.js
import mongoose from 'mongoose';

const AssignmentSchema = new mongoose.Schema({
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
  instructions: String,
  dueDate: Date,
  points: {
    type: Number,
    default: 0
  },
  attachments: [{
    name: String,
    fileUrl: String,
    fileType: String
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

export default mongoose.model('Assignment', AssignmentSchema);