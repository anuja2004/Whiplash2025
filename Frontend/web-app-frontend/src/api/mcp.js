// api/mcp.js
import axios from 'axios';

export const generateLearningPath = async (data) => {
  console.log("[generateLearningPath] Original Payload:", data); // Debug log

  // Transform the payload to match the backend's expected structure
  const transformedData = {
    topic_name: data.manualTopics[0], // Assuming the first topic is used
    no_of_days: data.targetDays,
    start_date: data.startDate,
    daily_hours: data.dailyHours,
  };

  console.log("[generateLearningPath] Transformed Payload:", transformedData); // Debug log

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.post('http://localhost:5001/generate_plan', transformedData, {
        timeout: 300000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error("[generateLearningPath] Error:", error); // Debug log
      if (attempt === MAX_RETRIES || error.response?.status !== 429) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * attempt));
    }
  }
};