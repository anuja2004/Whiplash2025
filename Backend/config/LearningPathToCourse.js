const { transformLearningPathToCourse, logger } = require('./DataOperations');

async function runConversion() {
  try {
    const course = await transformLearningPathToCourse(learningPathData, 'owner123');
    logger.success('Successfully created course', { courseId: course.courseId });
  } catch (error) {
    logger.error('Critical conversion failure', { error });
    process.exit(1);
  }
}

runConversion();