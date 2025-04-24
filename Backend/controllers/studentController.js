// controllers/studentController.js
import User from '../models/User.js';
import Course from '../models/Course.js';
import Assignment from '../models/general/Assignment.js';
import Quiz from '../models/general/Quiz.js';
import Note from '../models/general/Note.js';
import UserProgress from '../models/UserProgress.js';
import Submission from '../models/general/Submission.js';

const studentController = {
  // Get all courses the student is enrolled in
  getEnrolledCourses: async (req, res) => {
    try {
      const userId = req.user.id; // Assuming authMiddleware sets req.user
      
      // Find user and populate enrolled courses
      const user = await User.findById(userId)
        .populate({
          path: 'enrolledCourses',
          select: 'courseId title subject description topics'
        });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      return res.status(200).json({
        success: true,
        courses: user.enrolledCourses
      });
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching enrolled courses' 
      });
    }
  },

  // Get detailed information about a specific course
  getCourseDetails: async (req, res) => {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;
      
      // Find the course
      const course = await Course.findOne({ courseId });
      
      if (!course) {
        return res.status(404).json({ 
          success: false, 
          message: 'Course not found' 
        });
      }
      
      // Check if student is enrolled
      const user = await User.findById(userId);
      if (!user.enrolledCourses.includes(course._id)) {
        return res.status(403).json({ 
          success: false, 
          message: 'You are not enrolled in this course' 
        });
      }
      
      return res.status(200).json({
        success: true,
        course
      });
    } catch (error) {
      console.error('Error fetching course details:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching course details' 
      });
    }
  },

  // Get assignments for a specific course
  getCourseAssignments: async (req, res) => {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;
      
      // Find the course
      const course = await Course.findOne({ courseId });
      
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
      
      // Check if student is enrolled
      const user = await User.findById(userId);
      if (!user.enrolledCourses.includes(course._id)) {
        return res.status(403).json({ 
          success: false, 
          message: 'You are not enrolled in this course' 
        });
      }
      
      // Find assignments for this course
      const assignments = await Assignment.find({ courseId: course._id });
      
      // Find student's submissions for these assignments
      const submissions = await Submission.find({
        userId,
        assignmentId: { $in: assignments.map(a => a._id) }
      });
      
      // Add submission status to each assignment
      const assignmentsWithStatus = assignments.map(assignment => {
        const submission = submissions.find(
          s => s.assignmentId.toString() === assignment._id.toString()
        );
        
        return {
          ...assignment.toObject(),
          submissionStatus: submission ? submission.status : 'not_submitted',
          submissionId: submission ? submission._id : null,
          grade: submission ? submission.grade : null
        };
      });
      
      return res.status(200).json({
        success: true,
        assignments: assignmentsWithStatus
      });
    } catch (error) {
      console.error('Error fetching course assignments:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching assignments' 
      });
    }
  },

  // Get quizzes for a specific course
  getCourseQuizzes: async (req, res) => {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;
      
      // Find the course
      const course = await Course.findOne({ courseId });
      
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
      
      // Check if student is enrolled
      const user = await User.findById(userId);
      if (!user.enrolledCourses.includes(course._id)) {
        return res.status(403).json({ 
          success: false, 
          message: 'You are not enrolled in this course' 
        });
      }
      
      // Find quizzes for this course
      const quizzes = await Quiz.find({ courseId: course._id });
      
      // Find user progress to get quiz attempts
      const userProgress = await UserProgress.findOne({ userId });
      const courseProgress = userProgress?.courseProgress?.find(
        cp => cp.courseId.toString() === course._id.toString()
      );
      
      // Add completion status to each quiz
      const quizzesWithStatus = quizzes.map(quiz => {
        const quizAttempt = courseProgress?.completedQuizzes?.find(
          q => q.quizId.toString() === quiz._id.toString()
        );
        
        return {
          ...quiz.toObject(),
          attempted: !!quizAttempt,
          score: quizAttempt?.score || null,
          attempts: quizAttempt?.attempts || 0,
          passed: quizAttempt?.score >= quiz.passingScore
        };
      });
      
      return res.status(200).json({
        success: true,
        quizzes: quizzesWithStatus
      });
    } catch (error) {
      console.error('Error fetching course quizzes:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching quizzes' 
      });
    }
  },

  // Get student's progress for a specific course
  getCourseProgress: async (req, res) => {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;
      
      // Find the course
      const course = await Course.findOne({ courseId });
      
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
      
      // Check if student is enrolled
      const user = await User.findById(userId);
      if (!user.enrolledCourses.includes(course._id)) {
        return res.status(403).json({ 
          success: false, 
          message: 'You are not enrolled in this course' 
        });
      }
      
      // Find user progress
      const userProgress = await UserProgress.findOne({ userId });
      
      if (!userProgress) {
        return res.status(200).json({
          success: true,
          progress: {
            completedTopics: [],
            currentTopic: null,
            completedAssignments: [],
            completedQuizzes: [],
            startDate: new Date(),
            lastAccessed: new Date(),
            points: 0
          }
        });
      }
      
      // Find this course's progress
      const courseProgress = userProgress.courseProgress.find(
        cp => cp.courseId.toString() === course._id.toString()
      );
      
      if (!courseProgress) {
        return res.status(200).json({
          success: true,
          progress: {
            completedTopics: [],
            currentTopic: null,
            completedAssignments: [],
            completedQuizzes: [],
            startDate: new Date(),
            lastAccessed: new Date(),
            points: 0
          }
        });
      }
      
      return res.status(200).json({
        success: true,
        progress: courseProgress
      });
    } catch (error) {
      console.error('Error fetching course progress:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching progress' 
      });
    }
  },

  // Submit an assignment
  submitAssignment: async (req, res) => {
    try {
      const { assignmentId } = req.params;
      const userId = req.user.id;
      const { content } = req.body;
      
      // Find the assignment
      const assignment = await Assignment.findById(assignmentId);
      
      if (!assignment) {
        return res.status(404).json({ success: false, message: 'Assignment not found' });
      }
      
      // Check if student is enrolled in the course
      const course = await Course.findById(assignment.courseId);
      const user = await User.findById(userId);
      
      if (!user.enrolledCourses.includes(course._id)) {
        return res.status(403).json({ 
          success: false, 
          message: 'You are not enrolled in this course' 
        });
      }
      
      // Check if assignment is already submitted
      const existingSubmission = await Submission.findOne({
        assignmentId,
        userId
      });
      
      if (existingSubmission) {
        // Update existing submission
        existingSubmission.content = content;
        existingSubmission.status = 'submitted';
        existingSubmission.submittedAt = new Date();
        existingSubmission.grade = null;
        existingSubmission.feedback = '';
        existingSubmission.gradedAt = null;
        
        await existingSubmission.save();
        
        return res.status(200).json({
          success: true,
          message: 'Assignment resubmitted successfully',
          submission: existingSubmission
        });
      }
      
      // Create new submission
      const newSubmission = await Submission.create({
        assignmentId,
        userId,
        content,
        status: 'submitted',
        submittedAt: new Date()
      });
      
      return res.status(201).json({
        success: true,
        message: 'Assignment submitted successfully',
        submission: newSubmission
      });
    } catch (error) {
      console.error('Error submitting assignment:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error while submitting assignment' 
      });
    }
  },

  // Submit a quiz attempt
  submitQuiz: async (req, res) => {
    try {
      const { quizId } = req.params;
      const userId = req.user.id;
      const { answers } = req.body;
      
      // Find the quiz
      const quiz = await Quiz.findById(quizId);
      
      if (!quiz) {
        return res.status(404).json({ success: false, message: 'Quiz not found' });
      }
      
      // Check if student is enrolled in the course
      const course = await Course.findById(quiz.courseId);
      const user = await User.findById(userId);
      
      if (!user.enrolledCourses.includes(course._id)) {
        return res.status(403).json({ 
          success: false, 
          message: 'You are not enrolled in this course' 
        });
      }
      
      // Calculate score
      let totalPoints = 0;
      let earnedPoints = 0;
      
      // Verify answers and calculate score
      quiz.questions.forEach((question, index) => {
        totalPoints += question.points;
        
        // For multiple choice
        if (question.questionType === 'multiple-choice') {
          const selectedOption = answers[index];
          const correctOption = question.options.findIndex(opt => opt.isCorrect);
          
          if (selectedOption === correctOption) {
            earnedPoints += question.points;
          }
        }
        // Add more question types handling as needed
      });
      
      const scorePercentage = Math.round((earnedPoints / totalPoints) * 100);
      
      // Update user progress
      let userProgress = await UserProgress.findOne({ userId });
      
      if (!userProgress) {
        userProgress = new UserProgress({
          userId,
          courseProgress: [],
          achievements: [],
          totalPoints: 0
        });
      }
      
      // Find or create course progress
      let courseProgress = userProgress.courseProgress.find(
        cp => cp.courseId.toString() === course._id.toString()
      );
      
      if (!courseProgress) {
        courseProgress = {
          courseId: course._id,
          completedTopics: [],
          currentTopic: course.topics[0]?.topicId || null,
          completedAssignments: [],
          completedQuizzes: [],
          startDate: new Date(),
          lastAccessed: new Date(),
          points: 0
        };
        userProgress.courseProgress.push(courseProgress);
      }
      
      // Find or update quiz attempt
      const quizAttemptIndex = courseProgress.completedQuizzes.findIndex(
        q => q.quizId.toString() === quiz._id.toString()
      );
      
      if (quizAttemptIndex > -1) {
        // Update existing attempt if score is better
        if (scorePercentage > courseProgress.completedQuizzes[quizAttemptIndex].score) {
          courseProgress.completedQuizzes[quizAttemptIndex].score = scorePercentage;
        }
        courseProgress.completedQuizzes[quizAttemptIndex].attempts += 1;
        courseProgress.completedQuizzes[quizAttemptIndex].completedAt = new Date();
      } else {
        // Create new attempt
        courseProgress.completedQuizzes.push({
          quizId: quiz._id,
          score: scorePercentage,
          completedAt: new Date(),
          attempts: 1
        });
        
        // Add points for first completion
        const pointsEarned = Math.round(scorePercentage / 10) * 10; // Round to nearest 10
        courseProgress.points += pointsEarned;
        userProgress.totalPoints += pointsEarned;
        
        // Check for achievements
        if (scorePercentage >= quiz.passingScore) {
          userProgress.achievements.push({
            name: 'Quiz Passed',
            earnedAt: new Date(),
            description: `Passed the "${quiz.title}" quiz with a score of ${scorePercentage}%`
          });
        }
        
        if (scorePercentage >= 90) {
          userProgress.achievements.push({
            name: 'Quiz Excellence',
            earnedAt: new Date(),
            description: `Achieved over 90% on "${quiz.title}" quiz`
          });
        }
      }
      
      await userProgress.save();
      
      return res.status(200).json({
        success: true,
        message: 'Quiz submitted successfully',
        result: {
          score: scorePercentage,
          passed: scorePercentage >= quiz.passingScore,
          totalPoints,
          earnedPoints
        }
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error while submitting quiz' 
      });
    }
  },

  // Create a note for a course topic
  createNote: async (req, res) => {
    try {
      const { courseId, topicId } = req.params;
      const userId = req.user.id;
      const { title, content, tags } = req.body;
      
      // Find the course
      const course = await Course.findOne({ courseId });
      
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
      
      // Check if student is enrolled
      const user = await User.findById(userId);
      if (!user.enrolledCourses.includes(course._id)) {
        return res.status(403).json({ 
          success: false, 
          message: 'You are not enrolled in this course' 
        });
      }
      
      // Verify topic exists in course
      const topicExists = course.topics.some(topic => topic.topicId === topicId);
      
      if (!topicExists) {
        return res.status(404).json({ success: false, message: 'Topic not found in this course' });
      }
      
      // Create the note
      const newNote = await Note.create({
        courseId: course._id,
        topicId,
        userId,
        title,
        content,
        tags: tags || []
      });
      
      return res.status(201).json({
        success: true,
        message: 'Note created successfully',
        note: newNote
      });
    } catch (error) {
      console.error('Error creating note:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error while creating note' 
      });
    }
  },

  // Get notes for a course topic
  getNotesByTopic: async (req, res) => {
    try {
      const { courseId, topicId } = req.params;
      const userId = req.user.id;
      
      // Find the course
      const course = await Course.findOne({ courseId });
      
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
      
      // Check if student is enrolled
      const user = await User.findById(userId);
      if (!user.enrolledCourses.includes(course._id)) {
        return res.status(403).json({ 
          success: false, 
          message: 'You are not enrolled in this course' 
        });
      }
      
      // Find notes for this topic
      const notes = await Note.find({
        courseId: course._id,
        topicId,
        userId
      }).sort({ createdAt: -1 });
      
      return res.status(200).json({
        success: true,
        notes
      });
    } catch (error) {
      console.error('Error fetching notes:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching notes' 
      });
    }
  },

  // Get all modules (videos, quizzes, assignments) for a course
  getCourseModules: async (req, res) => {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;
      const course = await Course.findOne({ courseId });
      if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
      const userProgress = await UserProgress.findOne({ userId });
      const courseProgress = userProgress?.courseProgress?.find(cp => cp.courseId.toString() === course._id.toString());
      // Collect all resources (videos, quizzes, assignments)
      let modules = [];
      course.topics.forEach(topic => {
        topic.resources.forEach(resource => {
          modules.push({
            moduleId: resource.resourceId,
            type: resource.type,
            title: resource.title,
            description: resource.description,
            url: resource.url,
            youtubeId: resource.youtubeId,
            duration: resource.duration,
            topicId: topic.topicId,
            completed: (resource.type === 'video' && courseProgress?.completedVideos?.includes(resource.resourceId)) ||
                      (resource.type === 'quiz' && courseProgress?.completedQuizzes?.some(q => q.quizId.toString() === resource.resourceId)) ||
                      (resource.type === 'assignment' && courseProgress?.completedAssignments?.some(a => a.assignmentId.toString() === resource.resourceId)),
          });
        });
      });
      return res.status(200).json({ success: true, modules });
    } catch (error) {
      console.error('Error fetching course modules:', error);
      return res.status(500).json({ success: false, message: 'Server error while fetching modules' });
    }
  },

  // Mark a module as completed (video, quiz, assignment)
  completeModule: async (req, res) => {
    try {
      const { courseId, moduleId } = req.params;
      const { type } = req.body;
      const userId = req.user.id;
      const userProgress = await UserProgress.findOne({ userId });
      const course = await Course.findOne({ courseId });
      if (!userProgress || !course) return res.status(404).json({ success: false, message: 'Not found' });
      let courseProgress = userProgress.courseProgress.find(cp => cp.courseId.toString() === course._id.toString());
      if (!courseProgress) {
        courseProgress = { courseId: course._id, completedTopics: [], completedVideos: [], completedAssignments: [], completedQuizzes: [], points: 0 };
        userProgress.courseProgress.push(courseProgress);
      }
      let pointsAwarded = 0;
      // Mark as completed and award points
      if (type === 'video') {
        if (!courseProgress.completedVideos.includes(moduleId)) {
          courseProgress.completedVideos.push(moduleId);
          pointsAwarded = 5; // Example: 5 points per video
        }
      } else if (type === 'quiz') {
        if (!courseProgress.completedQuizzes.some(q => q.quizId.toString() === moduleId)) {
          courseProgress.completedQuizzes.push({ quizId: moduleId, completedAt: new Date(), score: 0, attempts: 1 });
          pointsAwarded = 10; // Example: 10 points per quiz
        }
      } else if (type === 'assignment') {
        if (!courseProgress.completedAssignments.some(a => a.assignmentId.toString() === moduleId)) {
          courseProgress.completedAssignments.push({ assignmentId: moduleId, submittedAt: new Date(), grade: 0 });
          pointsAwarded = 15; // Example: 15 points per assignment
        }
      }
      courseProgress.points = (courseProgress.points || 0) + pointsAwarded;
      userProgress.totalPoints = (userProgress.totalPoints || 0) + pointsAwarded;
      // Handle achievements/streaks (simple example)
      let achievement = null;
      if (userProgress.totalPoints >= 100) {
        achievement = { name: 'Century Club', earnedAt: new Date(), description: 'Earned 100 points!' };
        if (!userProgress.achievements.some(a => a.name === achievement.name)) {
          userProgress.achievements.push(achievement);
        }
      }
      await userProgress.save();
      return res.status(200).json({ success: true, pointsAwarded, achievement });
    } catch (error) {
      console.error('Error completing module:', error);
      return res.status(500).json({ success: false, message: 'Server error while completing module' });
    }
  },
};

export default studentController;