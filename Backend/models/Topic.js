// models/Topic.js
// ---------------
// Defines the Topic schema and model for course topics

import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Define the schema for a Topic
const TopicSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Please add a topic title'],
    trim: true
  },
  description: {
    type: String
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Topic',
    default: null
  },
  videoId: {
    type: String
  },
  resources: [
    {
      type: {
        type: String,
        enum: ['video', 'document', 'link', 'exercise']
      },
      title: String,
      url: String,
      description: String
    }
  ],
  order: {
    type: Number,
    required: true
  }
});

const Topic = model('Topic', TopicSchema);

export default Topic;
