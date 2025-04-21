// services/aiService.js
// ES Module style AI service implementation with detailed comments and improved error logging

/**
 * Generate personalized learning recommendations based on user activity.
 * @param {Object} userData - Contains topics, quizAttempts, and submissions.
 * @returns {Object} recommendations - weakTopics, nextTopics, suggestedActions
 */
export async function generateRecommendations(userData) {
    try {
      console.log('[generateRecommendations] Starting recommendation generation');
      const { topics, quizAttempts, submissions } = userData;
  
      // 1. Identify weak topics (quiz score < 70%)
      const weakTopics = new Set();
      quizAttempts.forEach(attempt => {
        if (typeof attempt.percentage !== 'number') {
          console.error('[generateRecommendations] Invalid attempt.percentage:', attempt);
          return;
        }
        if (attempt.percentage < 70 && attempt.quiz?.topic) {
          weakTopics.add(attempt.quiz.topic.toString());
        }
      });
  
      // 2. Track completed topics (from quizzes and submissions)
      const completedTopicIds = new Set();
      quizAttempts.forEach(attempt => {
        if (attempt.quiz?.topic) {
          completedTopicIds.add(attempt.quiz.topic.toString());
        }
      });
      submissions.forEach(submission => {
        if (submission.assignment?.topic) {
          completedTopicIds.add(submission.assignment.topic.toString());
        }
      });
  
      // 3. Determine topics not yet completed
      const incompletedTopics = topics.filter(topic => {
        if (!topic?._id) {
          console.warn('[generateRecommendations] Topic missing _id:', topic);
          return false;
        }
        return !completedTopicIds.has(topic._id.toString());
      });
  
      // 4. Build the recommendation structure
      const recommendations = {
        weakTopics: topics.filter(topic => weakTopics.has(topic._id.toString())),
        nextTopics: incompletedTopics.slice(0, 3),
        suggestedActions: []
      };
  
      // 5. Add actionable suggestions based on weakness or next steps
      if (recommendations.weakTopics.length > 0) {
        const topic = recommendations.weakTopics[0];
        recommendations.suggestedActions.push({
          type: 'review',
          description: `Review ${topic.title} - performance below threshold`,
          topicId: topic._id
        });
      }
      if (recommendations.nextTopics.length > 0) {
        const topic = recommendations.nextTopics[0];
        recommendations.suggestedActions.push({
          type: 'study',
          description: `Continue with ${topic.title}`,
          topicId: topic._id
        });
      }
  
      console.log('[generateRecommendations] Completed recommendations:', recommendations);
      return recommendations;
    } catch (error) {
      console.error('[generateRecommendations] Error generating recommendations:', error);
      throw new Error('Failed to generate recommendations');
    }
  }
  
  /**
   * Generate a quiz based on given topics and difficulty.
   * @param {Object} params
   * @param {String} params.course - Course identifier or name
   * @param {Array} params.topics - List of topic objects with title and _id
   * @param {Number} params.questionCount - Number of questions to generate
   * @param {String} params.difficulty - Difficulty level: 'easy', 'medium', 'hard'
   * @returns {Object} quiz - Title, description, and array of questions
   */
  export async function generateQuiz({ course, topics, questionCount, difficulty }) {
    try {
      console.log('[generateQuiz] Starting quiz generation', { course, questionCount, difficulty });
      if (!Array.isArray(topics) || topics.length === 0) {
        throw new Error('Topic list must be a non-empty array');
      }
      if (typeof questionCount !== 'number' || questionCount <= 0) {
        throw new Error('questionCount must be a positive number');
      }
  
      const questions = [];
      const topicTitles = topics.map(topic => topic.title || 'Unknown Topic');
  
      for (let i = 0; i < questionCount; i++) {
        const topicTitle = topicTitles[i % topicTitles.length];
        const isMultipleChoice = Math.random() > 0.3;
  
        if (isMultipleChoice) {
          // Build a multiple-choice question with placeholder options
          questions.push({
            text: `Sample question ${i + 1} about ${topicTitle}?`,
            type: 'multiple-choice',
            options: Array.from({ length: 4 }, (_, idx) => ({
              text: `Option ${idx + 1}`,
              isCorrect: idx === (i % 4)
            })),
            points: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3,
            explanation: `Explanation for question ${i + 1}`
          });
        } else {
          // Build a true/false question
          questions.push({
            text: `True/False: Sample statement ${i + 1} about ${topicTitle}`,
            type: 'true-false',
            correctAnswer: i % 2 === 0 ? 'true' : 'false',
            points: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3,
            explanation: `Explanation for question ${i + 1}`
          });
        }
      }
  
      const quiz = {
        title: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Quiz on ${topicTitles.join(', ')}`,
        description: `This quiz covers the following topics: ${topicTitles.join(', ')}`,
        questions
      };
  
      console.log('[generateQuiz] Completed quiz:', quiz.title);
      return quiz;
    } catch (error) {
      console.error('[generateQuiz] Error generating quiz:', error.message || error);
      throw new Error('Failed to generate quiz');
    }
  }
  