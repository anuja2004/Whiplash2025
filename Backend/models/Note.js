// models/Note.js
// --------------
// Defines the Note schema and model for user notes

import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Define the schema for a Note
const NoteSchema = new Schema({
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
  topic: {
    type: Schema.Types.ObjectId,
    ref: 'Topic'
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Please add content']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Note = model('Note', NoteSchema);

export default Note;
