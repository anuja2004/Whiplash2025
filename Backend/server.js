// server.js - Main Entry Point (ES Module)
// --------------------------
// Uses ES module syntax, detailed comments, and enhanced error logging
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file
import express from 'express';                           // HTTP server framework
import cors from 'cors';                                 // Cross-origin requests
import morgan from 'morgan';                             // HTTP request logger
import colors from 'colors';                             // ANSI colors in console
import mongoose from 'mongoose';                         // MongoDB ODM

// Database connection utility
import connectDB from './config/db.js';
// Centralized configuration values
import config from './config/config.js';
// Global error-handling middleware (uncomment when implemented)
import errorHandler from './middleware/errorHandler.js';

// Route modules
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

// Initialize Express application
const app = express();

// --------------------------
// 1. Logging Middleware Setup
// --------------------------
// Custom request logger using morgan and colors
debugger; const requestLogger = morgan((tokens, req, res) => [
  // Timestamp of the request
  colors.cyan('[' + new Date().toISOString() + ']'),
  // HTTP method and URL path
  colors.yellow(tokens.method(req, res)),
  tokens.url(req, res),
  // Response status code and response time
  colors.cyan(tokens.status(req, res)),
  colors.yellow(tokens['response-time'](req, res) + ' ms'),
  '@', tokens['remote-addr'](req, res),
  'HTTP/' + tokens['http-version'](req, res)
].join(' '));

app.use(requestLogger);

// --------------------------
// 2. CORS & Body Parsers
// --------------------------
app.use(cors({
  origin: config.FRONTEND_URL,       // Whitelisted front-end origin
  credentials: true                  // Allow cookies
}));
app.use(express.json());              // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// --------------------------
// 3. Route Definitions
// --------------------------
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/ai', aiRoutes);

// --------------------------
// 4. Health Check Endpoint
// --------------------------
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const uptime = process.uptime();
  const timestamp = new Date().toISOString();

  const healthData = {
    status: 'OK',
    timestamp,
    uptime,
    database: dbState
  };

  res.format({
    'application/json': () => {
      res.status(200).json(healthData);
    },
    'text/html': () => {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Health Check</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #2c3e50; }
              p { font-size: 1.1em; }
            </style>
          </head>
          <body>
            <h1>Health Check</h1>
            <p><strong>Status:</strong> ${healthData.status}</p>
            <p><strong>Timestamp:</strong> ${healthData.timestamp}</p>
            <p><strong>Uptime:</strong> ${healthData.uptime.toFixed(2)} seconds</p>
            <p><strong>Database:</strong> ${healthData.database}</p>
          </body>
        </html>
      `);
    },
    'default': () => {
      res.status(406).send('Not Acceptable');
    }
  });
});

// --------------------------
// 5. Global Error Handler
// --------------------------
// Make sure to define `errorHandler` in ./middleware/errorHandler.js\app.use(errorHandler);

// --------------------------
// 6. Uncaught Errors & Graceful Shutdown
// --------------------------
// Unhandled Promise Rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error(colors.red('[UnhandledRejection]'), reason);
  // Optionally: close server before exit
  process.exit(1);
});
// Uncaught Exceptions
process.on('uncaughtException', (err) => {
  console.error(colors.red('[UncaughtException]'), err);
  process.exit(1);
});
// SIGTERM & SIGINT signals
['SIGTERM','SIGINT'].forEach(sig =>
  process.on(sig, () => {
    console.info(colors.cyan(`[${sig}] Shutdown initiated`));
    mongoose.connection.close(false, () => {
      console.info(colors.cyan('MongoDB connection closed')); process.exit(0);
    });
  })
);

// --------------------------
// 7. Database Initialization & Server Start
// --------------------------
async function initializeDatabase() {
  try {
    console.log(colors.cyan('[DB] Connecting to database...'));
    await connectDB();
    console.log(colors.green('[DB] Connection successful'));
  } catch (error) {
    console.error(colors.red('[DB] Connection error:'), error);
    throw error;
  }
}

async function startServer() {
  try {
    // 1. Connect to DB
    await initializeDatabase();

    // 2. Launch HTTP server
    const server = app.listen(config.PORT, () => {
      console.log(colors.blue(`🚀 Server running in ${config.NODE_ENV} mode on port ${config.PORT}`));
      console.log(colors.green(`🔗 MongoDB host: ${mongoose.connection.host}`));
    });

    return server;
  } catch (error) {
    console.error(colors.red('[Server] Startup error:'), error);
    process.exit(1);
  }
}

// Start the application
startServer();
