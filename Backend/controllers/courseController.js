// controllers/courseController.js
import Course from '../models/Course.js';
import Topic from '../models/Topic.js';
import Enrollment from '../models/Enrollment.js';
import * as youtubeService from '../services/youtubeService.js';

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find().populate({
      path: 'instructor',
      select: 'name'
    });
    
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Create course with YouTube playlist
// @route   POST /api/courses
// @access  Private (Instructor, Admin)
export const createCourse = async (req, res, next) => {
  try {
    req.body.instructor = req.user.id;
    
    const { title, description, youtubePlaylistId } = req.body;
    
    // Create the course first
    const course = await Course.create({
      title,
      description,
      instructor: req.user.id,
      youtubePlaylistId
    });
    
    // If YouTube playlist ID is provided, fetch videos
    if (youtubePlaylistId) {
      const videos = await youtubeService.getPlaylistVideos(youtubePlaylistId);
      
      // Update course with video information
      course.videos = videos;
      await course.save();
      
      // Create topic structure from playlist
      await createTopicsFromVideos(videos, course._id);
    }
    
    res.status(201).json({
      success: true,
      data: course
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get course syllabus (topic tree)
// @route   GET /api/courses/:id/syllabus
// @access  Private
export const getCourseSyllabus = async (req, res, next) => {
  try {
    const topics = await Topic.find({ course: req.params.id })
      .sort('order');
    
    // Create a tree structure
    const topicTree = buildTopicTree(topics);
    
    res.status(200).json({
      success: true,
      data: topicTree
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private (Student)
export const enrollCourse = async (req, res, next) => {
  try {
    // Check if course exists
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.id
    });
    
    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }
    
    // Create enrollment
    const enrollment = await Enrollment.create({
      user: req.user.id,
      course: req.params.id
    });
    
    res.status(201).json({
      success: true,
      data: enrollment
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// Helper function to create topics from YouTube videos
const createTopicsFromVideos = async (videos, courseId) => {
  for (let i = 0; i < videos.length; i++) {
    await Topic.create({
      title: videos[i].title,
      description: videos[i].description,
      course: courseId,
      videoId: videos[i].youtubeVideoId,
      resources: [{
        type: 'video',
        title: videos[i].title,
        url: `https://www.youtube.com/watch?v=${videos[i].youtubeVideoId}`,
        description: videos[i].description
      }],
      order: i + 1
    });
  }
};

// Helper function to build a tree structure from flat topics
const buildTopicTree = (topics) => {
  const topicMap = {};
  const rootTopics = [];
  
  // First pass: Create a map of all topics
  topics.forEach(topic => {
    topicMap[topic._id] = {
      _id: topic._id,
      title: topic.title,
      description: topic.description,
      videoId: topic.videoId,
      resources: topic.resources,
      order: topic.order,
      children: []
    };
  });
  
  // Second pass: Build the tree
  topics.forEach(topic => {
    if (topic.parent) {
      // Add to parent's children
      if (topicMap[topic.parent]) {
        topicMap[topic.parent].children.push(topicMap[topic._id]);
      }
    } else {
      // Root level topic
      rootTopics.push(topicMap[topic._id]);
    }
  });
  
  // Sort root topics by order
  rootTopics.sort((a, b) => a.order - b.order);
  
  return rootTopics;
};