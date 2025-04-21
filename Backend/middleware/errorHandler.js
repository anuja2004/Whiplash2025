// middleware/errorHandler.js
// --------------------------
// Custom error-handling middleware for Express.js

const errorHandler = (err, req, res, next) => {
    // Log the error stack trace for debugging
    console.error('[ErrorHandler] Error stack:', err.stack);
  
    // Determine the status code
    const statusCode = err.statusCode || 500;
  
    // Send the error response
    res.status(statusCode).json({
      success: false,
      error: err.message || 'Server Error'
    });
  };
  
  export default errorHandler;
  