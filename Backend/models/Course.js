// models/Course.js
import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  description: String,
  syllabus: {
    nodes: [{
      id: String,
      data: {
        label: String,
        description: String
      }
    }],
    edges: [{
      source: String,
      target: String,
      data: {
        label: String
      }
    }]
  },
  topics: [{
    topicId: String,
    name: String,
    description: String,
    resources: [{
      resourceId: String,
      type: {
        type: String,
        enum: ['video', 'article', 'quiz', 'exercise']
      },
      url: String,
      title: String,
      description: String,
      duration: Number
    }]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Course', CourseSchema);