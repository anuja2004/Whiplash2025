// config/config.js
import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT;
export const MONGO_URI = process.env.MONGO_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
export const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
export const AI_SERVICE_URL = process.env.AI_SERVICE_URL;