// services/openAIQuizService.js
// ES Module style service for generating AI-powered quiz questions

import OpenAI from 'openai';

// Initialize OpenAI client with API key from environment
if (!process.env.OPENAI_API_KEY) {
  console.error('[OpenAIQuizService] Missing OPENAI_API_KEY in environment');
  throw new Error('OPENAI_API_KEY not configured');
}
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate multiple-choice quiz questions for a given topic and difficulty.
 * @param {string} topic - The subject/topic to generate questions about.
 * @param {"easy"|"medium"|"hard"} [difficulty='medium'] - Difficulty level.
 * @returns {Promise<Object>} - Parsed JSON with structure { questions: [{ question, options, correctAnswer }] }
 * @throws {Error} - Throws if API call fails or response parsing fails.
 */
export async function generateQuizQuestions(topic, difficulty = 'medium') {
  console.log('[OpenAIQuizService] Requesting quiz questions', { topic, difficulty });

  // Build the user prompt for the model
  const prompt = `Generate 5 ${difficulty} difficulty multiple-choice questions about ${topic} with 4 options each and mark the correct answer. Format as JSON:\n` +
                 `{
  "questions": [
    {
      "question": "",
      "options": ["", "", "", ""],
      "correctAnswer": 0
    }
  ]
}`;

  try {
    // Call OpenAI chat completion endpoint
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [ { role: 'user', content: prompt } ],
      temperature: 0.7 // moderate creativity
    });

    const rawContent = response.choices?.[0]?.message?.content;
    if (!rawContent) {
      console.error('[OpenAIQuizService] Empty response content', response);
      throw new Error('Empty response from AI model');
    }

    let result;
    try {
      // Parse JSON from model output
      result = JSON.parse(rawContent);
    } catch (parseError) {
      console.error('[OpenAIQuizService] Failed to parse JSON:', parseError, 'Raw content:', rawContent);
      throw new Error('Invalid JSON format in AI response');
    }

    // Validate structure
    if (!result.questions || !Array.isArray(result.questions)) {
      console.error('[OpenAIQuizService] Unexpected response structure:', result);
      throw new Error('AI response missing "questions" array');
    }

    console.log('[OpenAIQuizService] Successfully generated questions');
    return result;
  } catch (error) {
    console.error('[OpenAIQuizService] Error generating quiz questions:', error);
    throw new Error('Failed to generate quiz questions');
  }
}
