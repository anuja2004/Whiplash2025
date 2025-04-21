// models/Assignment.js
// --------------------
// Defines the Assignment schema and model for course assignments

import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Define the schema for an Assignment
const AssignmentSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
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
    type: Date,
    required: [true, 'Please add a due date']
  },
  points: {
    type: Number,
    default: 100
  }
}, { timestamps: true });

const Assignment = model('Assignment', AssignmentSchema);

export default Assignment;
