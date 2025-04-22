// controllers/assignmentController.js
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';

// @desc    Get assignments by course
// @route   GET /api/assignments?courseId=xxx
// @access  Private
export const getAssignments = async (req, res, next) => {
  try {
    const { courseId } = req.query;
    
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a courseId'
      });
    }
    
    const assignments = await Assignment.find({ course: courseId })
      .sort({ dueDate: 1 });
    
    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get assignments due on a specific date
// @route   GET /api/assignments/due?date=yyyy-mm-dd
// @access  Private
export const getAssignmentsDueOnDate = async (req, res, next) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a date'
      });
    }
    
    // Find enrolled courses for the user
    const enrollments = await Enrollment.find({ user: req.user.id })
      .select('course');
    
    const courseIds = enrollments.map(enrollment => enrollment.course);
    
    // Create date range for the specified date
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    // Find assignments due on that date for enrolled courses
    const assignments = await Assignment.find({
      course: { $in: courseIds },
      dueDate: { $gte: startDate, $lte: endDate }
    }).populate('course', 'title');
    
    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Submit an assignment
// @route   POST /api/assignments/:id/submission
// @access  Private (Student)
export const submitAssignment = async (req, res, next) => {
  try {
    const { content, fileUrl } = req.body;
    
    // Check if assignment exists
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }
    
    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      assignment: req.params.id,
      user: req.user.id
    });
    
    if (existingSubmission) {
      // Update existing submission
      existingSubmission.content = content;
      if (fileUrl) existingSubmission.fileUrl = fileUrl;
      existingSubmission.submittedAt = Date.now();
      
      await existingSubmission.save();
      
      return res.status(200).json({
        success: true,
        data: existingSubmission
      });
    }
    
    // Create new submission
    const submission = await Submission.create({
      assignment: req.params.id,
      user: req.user.id,
      content,
      fileUrl
    });
    
    res.status(201).json({
      success: true,
      data: submission
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};
