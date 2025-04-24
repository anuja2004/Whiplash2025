// Backend/scripts/seedQuizzes.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Quiz from '../models/general/Quiz.js';
import Course from '../models/Course.js';
import quizSeedData from '../config/quizSeedData.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/whiplash';

const quizzes = quizSeedData;

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Find the course and topics (assume a single course for demo)
  const course = await Course.findOne();
  if (!course) {
    console.error('No course found. Please seed courses first.');
    return process.exit(1);
  }
  // Assign courseId and topicIds
  const topics = course.topics;

  // Ensure every topic has a quiz (reuse dummy quizzes if needed)
  const quizzesToInsert = topics.map((topic, i) => {
    const baseQuiz = quizzes[i % quizzes.length];
    // Deep clone baseQuiz to avoid mutating the original
    const quiz = JSON.parse(JSON.stringify(baseQuiz));
    quiz.courseId = course._id;
    quiz.topicId = topic.topicId;
    quiz.title = topic.topicName + ' Quiz';
    // Add questionId and correctAnswer to each question
    quiz.questions.forEach((q, idx) => {
      q.questionId = `q${i + 1}_${idx + 1}`;
      q.correctAnswer = q.options.findIndex(opt => opt.isCorrect);
    });
    return quiz;
  });

  // Remove old quizzes for this course
  await Quiz.deleteMany({ courseId: course._id });
  // Insert new quizzes
  await Quiz.insertMany(quizzesToInsert);
  console.log('Seeded quizzes for all topics!');
  mongoose.disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });
