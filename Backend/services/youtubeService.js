// services/openAIQuizService.js
// ES Module style service for generating AI-powered quiz questions with improved error logging and comments

import OpenAI from 'openai';

// Ensure API key exists
if (!process.env.OPENAI_API_KEY) {
  console.error('[OpenAIQuizService] ❌ Missing OPENAI_API_KEY in environment');
  throw new Error('OPENAI_API_KEY not configured');
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generates multiple-choice quiz questions using OpenAI
 * @param {string} topic - The topic for which to generate quiz questions.
 * @param {"easy"|"medium"|"hard"} [difficulty='medium'] - Difficulty level of questions.
 * @returns {Promise<Object>} - An object containing an array of quiz questions.
 * @throws Will throw an error if OpenAI request or response parsing fails.
 */
export async function generateQuizQuestions(topic, difficulty = 'medium') {
  console.log('[OpenAIQuizService] 🧠 Generating questions for:', { topic, difficulty });

  // Prompt template instructing OpenAI to format JSON properly
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
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [ { role: 'user', content: prompt } ],
      temperature: 0.7 // adjust for creativity
    });

    const rawContent = response.choices?.[0]?.message?.content;
    if (!rawContent) {
      console.error('[OpenAIQuizService] ❌ Empty content returned by OpenAI', response);
      throw new Error('Empty content in OpenAI response');
    }

    let result;
    try {
      result = JSON.parse(rawContent);
    } catch (parseError) {
      console.error('[OpenAIQuizService] ❌ JSON parsing failed:', parseError);
      console.debug('[OpenAIQuizService] 📝 Raw OpenAI output:', rawContent);
      throw new Error('Invalid JSON format in OpenAI response');
    }

    // Validate expected structure
    if (!result.questions || !Array.isArray(result.questions)) {
      console.error('[OpenAIQuizService] ❌ Invalid structure in AI response:', result);
      throw new Error('AI response does not include "questions" array');
    }

    console.log('[OpenAIQuizService] ✅ Questions successfully generated');
    return result;
  } catch (error) {
    console.error('[OpenAIQuizService] ❌ Error while generating quiz questions:', error);
    throw new Error('Failed to generate quiz questions');
  }
}
