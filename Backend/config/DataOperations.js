// DataOperations.js
const mongoose = require('mongoose');
const { Types: { ObjectId } } = mongoose;
const chalk = require('chalk');
const { createLogger, format, transports } = require('winston');

// Configure logging
const logger = createLogger({
  level: 'debug',
  format: format.combine(
    format.timestamp(),
    format.printf(({ level, message, timestamp, stack }) => {
      const color = {
        info: chalk.blue,
        error: chalk.red,
        warn: chalk.yellow,
        debug: chalk.magenta,
        success: chalk.green
      }[level] || chalk.white;
      
      return `${chalk.gray(timestamp)} ${color(level.toUpperCase())} ${stack || message}`;
    })
  ),
  transports: [new transports.Console()]
});

class ValidationError extends Error {
  constructor(field, message) {
    super(`Validation failed for ${field}: ${message}`);
    this.name = 'ValidationError';
  }
}

async function transformLearningPathToCourse(learningPath, ownerId) {
  const validationErrors = [];
  const startTime = Date.now();
  
  logger.info('Starting learning path conversion', { 
    requestId: learningPath.request_id,
    topic: learningPath.topic_name 
  });

  try {
    // Validate input structure
    const requiredFields = ['request_id', 'topic_name', 'no_of_days', 'plan'];
    requiredFields.forEach(field => {
      if (!learningPath[field]) {
        throw new ValidationError(field, 'Missing required field');
      }
    });

    // Processing pipeline
    const processingSteps = [
      { name: 'Node Generation', fn: generateNodes },
      { name: 'Edge Generation', fn: generateEdges },
      { name: 'Resource Processing', fn: processResources },
      { name: 'Course Assembly', fn: assembleCourse }
    ];

    let context = { learningPath, ownerId };
    for (const step of processingSteps) {
      try {
        logger.debug(`Starting step: ${step.name}`);
        context = await step.fn(context);
      } catch (error) {
        error.step = step.name;
        throw error;
      }
    }

    logger.success(`Conversion completed in ${Date.now() - startTime}ms`, {
      nodes: context.nodes.length,
      edges: context.edges.length,
      topics: context.topics.length
    });

    return context.course;

  } catch (error) {
    logger.error('Conversion failed', { 
      error: error.stack,
      validationErrors,
      failedStep: error.step || 'Unknown'
    });
    
    throw error;
  }
}

// Processing steps
async function generateNodes({ learningPath, ...context }) {
  const days = Object.keys(learningPath.plan).sort();
  return {
    ...context,
    nodes: days.map((date, index) => {
      const dayData = learningPath.plan[date];
      if (!dayData.subtopic) {
        throw new ValidationError('plan.subtopic', 'Missing subtopic for day');
      }
      
      return {
        id: `day-${index + 1}`,
        data: {
          label: dayData.subtopic,
          description: `Day ${index + 1}: ${dayData.subtopic}`
        }
      };
    })
  };
}

async function generateEdges(context) {
  const edges = [];
  for (let i = 1; i < context.nodes.length; i++) {
    edges.push({
      source: context.nodes[i-1].id,
      target: context.nodes[i].id,
      data: { label: 'Next Day' }
    });
  }
  return { ...context, edges };
}

async function processResources({ learningPath, nodes, ...context }) {
  const topics = nodes.map((node, index) => {
    const date = Object.keys(learningPath.plan).sort()[index];
    const dayData = learningPath.plan[date];
    
    try {
      return {
        topicId: node.id,
        name: dayData.subtopic,
        description: `Day ${index + 1} Content`,
        order: index + 1,
        resources: [
          createVideoResource(dayData, index),
          createNotesResource(dayData, index)
        ].filter(Boolean)
      };
    } catch (error) {
      error.day = date;
      throw error;
    }
  });
  
  return { ...context, topics };
}

function createVideoResource(dayData, index) {
  if (!dayData.youtube_link) return null;
  
  try {
    return {
      resourceId: `video-${index + 1}`,
      type: 'video',
      url: dayData.youtube_link,
      title: `Day ${index + 1} Video`,
      duration: extractDuration(dayData.timestamp),
      createdAt: new Date()
    };
  } catch (error) {
    error.resourceType = 'video';
    throw error;
  }
}

function createNotesResource(dayData, index) {
  if (!dayData.notes) return null;

  try {
    const notes = JSON.parse(dayData.notes);
    return {
      resourceId: `notes-${index + 1}`,
      type: 'note',
      content: notes.notes || notes.study_notes,
      title: `Day ${index + 1} Notes`,
      createdAt: new Date()
    };
  } catch (error) {
    throw new ValidationError('notes', 'Invalid JSON format');
  }
}

async function assembleCourse(context) {
  const { learningPath, ownerId, nodes, edges, topics } = context;
  
  return {
    ...context,
    course: {
      courseId: `LP-${learningPath.request_id}`,
      owner: new ObjectId(ownerId),
      title: `Learning Path: ${learningPath.topic_name}`,
      subject: 'Generated Learning Path',
      description: `${learningPath.no_of_days}-day program on ${learningPath.topic_name}`,
      isPrivate: true,
      syllabus: { nodes, edges },
      topics,
      createdAt: new Date(learningPath.generated_at),
      updatedAt: new Date()
    }
  };
}

// Helpers
function extractDuration(timestamp) {
  if (!timestamp) return 0;
  
  try {
    const [start, end] = timestamp.split('-');
    const [startH, startM, startS] = start.split(':').map(Number);
    const [endH, endM, endS] = end.split(':').map(Number);
    
    return Math.round((
      ((endH - startH) * 3600) + 
      ((endM - startM) * 60) + 
      (endS - startS)
    ) / 60);
  } catch (error) {
    throw new ValidationError('timestamp', 'Invalid format (HH:MM:SS-HH:MM:SS required)');
  }
}

// Enhanced execution with retries
async function executeWithRetry(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      logger.warn(`Retrying after error (attempt ${i+1}/${retries})`, { error });
      await new Promise(res => setTimeout(res, delay));
    }
  }
}

module.exports = {
  transformLearningPathToCourse,
  executeWithRetry,
  logger
};