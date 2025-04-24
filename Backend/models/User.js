// models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'student',
    enum: ['student', 'admin', 'instructor']
  },
  createdCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('User', UserSchema);