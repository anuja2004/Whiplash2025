// models/Course.js
import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true,
    unique: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
  isPrivate: {
    type: Boolean,
    default: true
  },
  accessList: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    accessLevel: {
      type: String,
      enum: ['view', 'edit', 'admin'],
      default: 'view'
    }
  }],
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
    order: Number,
    resources: [{
      resourceId: String,
      type: {
        type: String,
        enum: ['video', 'article', 'quiz', 'exercise', 'note', 'assignment']
      },
      url: String,
      title: String,
      description: String,
      content: String,
      duration: Number,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
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

// Create an index for fast lookup by owner
CourseSchema.index({ owner: 1 });
// Create an index for the accessList to optimize permission checks
CourseSchema.index({ "accessList.user": 1 });

export default mongoose.model('Course', CourseSchema);