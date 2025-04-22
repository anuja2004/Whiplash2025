import dotenv from 'dotenv';
// Note: It's generally a best practice to call dotenv.config()
// only once at the very entry point of your application (e.g., server.js)
// before any other modules that use process.env are imported.
// However, calling it here *will* load the variables if config.js is imported early.
dotenv.config();

console.log(
    '[Config] Environment Variables Loaded:',
    {
        PORT: process.env.PORT,
        // Corrected: Access MONGODB_URI from process.env
        MONGO_URI: process.env.MONGODB_URI, // <-- Changed from process.env.MONGO_URI
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_EXPIRE: process.env.JWT_EXPIRE,
        YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
        AI_SERVICE_URL: process.env.AI_SERVICE_URL
    }
);

const config = {
  PORT: process.env.PORT,
  // Corrected: Assign MONGODB_URI from process.env
  MONGO_URI: process.env.MONGODB_URI, // <-- Changed from process.env.MONGO_URI
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
  AI_SERVICE_URL: process.env.AI_SERVICE_URL
};

export default config;