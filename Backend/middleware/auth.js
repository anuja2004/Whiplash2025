// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// --- LOGGING DECORATOR ---
function logFunctionHit(filename, fnName) {
  return function (originalFn) {
    return async function (...args) {
      console.log(`[Backend]/middleware/${filename}/${fnName} HIT`);
      return originalFn.apply(this, args);
    };
  };
}

export const authMiddleware = logFunctionHit('auth.js', 'authMiddleware')(async (req, res, next) => {
  try {
    // Try to get token from header or cookie
    let token = req.header('x-auth-token') || req.headers['authorization'];
    if (token && token.startsWith('Bearer ')) token = token.slice(7);
    if (!token && req.cookies) token = req.cookies['token'];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No authentication token provided. Access denied.'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please log in again.'
      });
    }

    // Attach user
    const user = await User.findById(decoded.user.id).select('_id email role');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found. Access denied.'
      });
    }
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role
    };
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token is not valid or user not found.'
    });
  }
});

// Role-based middleware
export const authorizeRoles = logFunctionHit('auth.js', 'authorizeRoles')(function (...roles) {
  return function (req, res, next) {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user.role}) is not allowed to access this resource`
      });
    }
    next();
  };
});