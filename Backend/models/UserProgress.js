// models/UserProgress.js
import mongoose from "mongoose";
const UserProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseProgress: [{
    courseId: String,
    completedTopics: [String],
    currentTopic: String,
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

export default mongoose.model('UserProgress', UserProgressSchema);