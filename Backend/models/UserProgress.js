// models/UserProgress.js
import mongoose from "mongoose";

const UserProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseProgress: [{
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    completedTopics: [String],
    completedVideos: [String], // Track completion at resource/video level
    currentTopic: String,
    completedAssignments: [{
      assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment'
      },
      submittedAt: Date,
      grade: Number,
      feedback: String
    }],
    completedQuizzes: [{
      quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
      },
      score: Number,
      completedAt: Date,
      attempts: Number
    }],
    startDate: {
      type: Date,
      default: Date.now
    },
    lastAccessed: {
      type: Date,
      default: Date.now
    },
    points: {
      type: Number,
      default: 0
    }
  }],
  achievements: [{
    name: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    description: String
  }],
  totalPoints: {
    type: Number,
    default: 0
  }
});

// Create an index for efficient user progress lookups
UserProgressSchema.index({ userId: 1 });

export default mongoose.model('UserProgress', UserProgressSchema);