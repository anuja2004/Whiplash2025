// models/Course.js
// ----------------
// Defines the Course schema and model for course details

import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Define the schema for a Course
const CourseSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Please add a course title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  youtubePlaylistId: {
    type: String
  },
  videos: [
    {
      title: String,
      youtubeVideoId: String,
      duration: String,
      position: Number,
      description: String
    }
  ],
  instructor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Course = model('Course', CourseSchema);

export default Course;
