// middleware/auth.js
import jwt from 'jsonwebtoken';
import config from '../config/config.js'; // Assuming config.js is in the parent directory
import User from '../models/User.js';     // Assuming User.js is in the models directory

// Middleware to protect routes by verifying the JWT token in the request header
export const protect = async (req, res, next) => {
  let token;

  // Log the incoming request headers for debugging
  console.log('Protect Middleware - Request Headers:', req.headers);

  // Check if the Authorization header exists and starts with 'Bearer '
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      // Extract the token from the Authorization header
      token = req.headers.authorization.split(' ')[1];
      console.log('Protect Middleware - Token Found:', token);

      // Verify the token using the JWT secret from the config
      const decoded = jwt.verify(token, config.JWT_SECRET);
      console.log('Protect Middleware - Token Decoded:', decoded);

      // Fetch the user from the database using the ID in the decoded token, excluding the password
      req.user = await User.findById(decoded.id).select('-password');

      // Check if the user was found in the database
      if (!req.user) {
        console.log('Protect Middleware - User Not Found for ID:', decoded.id);
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found'
        });
      }

      // Log the authenticated user
      console.log('Protect Middleware - User Authenticated:', req.user);

      // Call the next middleware in the chain
      next();
    } catch (err) {
      // Log the error that occurred during token verification or user lookup
      console.error('Protect Middleware - Error:', err.message);

      // Handle different types of JWT errors for better feedback
      if (err instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, invalid token'
        });
      } else if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, token expired'
        });
      } else {
        // Generic unauthorized error for other issues
        return res.status(401).json({
          success: false,
          message: 'Not authorized to access this route'
        });
      }
    }
  }

  // If no token is found in the header
  if (!token) {
    console.log('Protect Middleware - No Token Found');
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }
};

// Middleware to authorize specific roles to access a route
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Log the user's role and the allowed roles for debugging
    console.log('Authorize Middleware - User Role:', req.user.role);
    console.log('Authorize Middleware - Allowed Roles:', roles);

    // Check if the user's role is included in the allowed roles
    if (!roles.includes(req.user.role)) {
      console.log(
        `Authorize Middleware - User role '${req.user.role}' is not authorized for this route.`
      );
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    // If the user's role is authorized, call the next middleware
    next();
  };
};