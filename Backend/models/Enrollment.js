// models/Enrollment.js
// --------------------
// Defines the Enrollment schema and model for user course enrollments

import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Define the schema for an Enrollment
const EnrollmentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  progress: {
    type: Number,
    default: 0 // Percentage completed
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Prevent duplicate enrollments
EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

const Enrollment = model('Enrollment', EnrollmentSchema);

export default Enrollment;
