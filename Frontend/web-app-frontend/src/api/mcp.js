// src/api/mcp.js
import axios from 'axios';
import axiosInstance from './axiosConfig';

// Send syllabus data to MCP server to generate learning path
export const generateLearningPath = async ({ manualTopics, targetDays, dailyHours, startDate }) => {
  try {
    const response = await axios.post('http://localhost:5001/generate_plan', {
      topic_name: manualTopics, // string, comma separated
      no_of_days: targetDays,  // number
      daily_hours: dailyHours, // number
      start_date: startDate    // string (YYYY-MM-DD)
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Failed to generate learning path';
  }
};
