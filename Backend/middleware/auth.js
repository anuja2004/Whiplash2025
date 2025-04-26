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
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No authentication token, access denied' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user from payload
    const user = await User.findById(decoded.user.id);

    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
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
      message: 'Token is not valid' 
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