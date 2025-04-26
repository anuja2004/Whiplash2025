// controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';

// --- LOGGING DECORATOR ---
function logFunctionHit(filename, fnName) {
  return function (originalFn) {
    return async function (...args) {
      console.log(`[Backend]/controllers/${filename}/${fnName} HIT`);
      return originalFn.apply(this, args);
    };
  };
}

/**
 * Register a new user
 * Creates user account and initial progress record
 */
export const registerUser = logFunctionHit('authController.js', 'registerUser')(async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the email is already in use
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      console.log(`Registration failed: Email ${email} already exists`);
      return res.status(400).json({ 
        success: false, 
        message: 'This email is already registered. Please use a different email or log in.'
      });
    }

    // Hash the password (for security)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user document
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    console.log(`User created: ${newUser.id}`);

    // Create initial progress record for the user
    await UserProgress.create({
      userId: newUser.id,
      courseProgress: [],
      achievements: [],
      totalPoints: 0
    });

    console.log(`Progress tracking initialized for user: ${newUser.id}`);

    // Generate JWT token
    const token = generateToken(newUser);

    // Return the token to the client
    res.status(201).json({ 
      success: true,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Log in an existing user
 * Verifies credentials and returns a JWT token
 */
export const loginUser = logFunctionHit('authController.js', 'loginUser')(async (req, res) => {
  const { email, password } = req.body;
  console.log(`Login attempt for email: ${email}`);
  

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    
    // If user doesn't exist
    if (!user) {
      console.log(`Login failed: No user found with email ${email}`);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email or password.' 
      });
    }

    // Check if password matches
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log(`Login failed: Invalid password for user ${email}`);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email or password.' 
      });
    }

    console.log(`User logged in: ${user.id}`);

    // Generate JWT token
    const token = generateToken(user);

    // Return the token to the client
    res.json({ 
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Get current user's profile
 * Returns user data (without password)
 */
export const getCurrentUser = logFunctionHit('authController.js', 'getCurrentUser')(async (req, res) => {
  try {
    // The user ID comes from the auth middleware (decoded JWT)
    const userId = req.user.id;
    
    // Find user by ID (excluding password field)
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      console.log(`Get user failed: User ${userId} not found`);
      return res.status(404).json({ 
        success: false, 
        message: 'User not found.' 
      });
    }

    res.json({ 
      success: true,
      user
    });
    
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving user data.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Helper function to generate JWT token
 */
const generateToken = (user) => {
  // Create payload with user ID and role
  const payload = {
    user: {
      id: user.id,
      role: user.role
    }
  };

  // Sign the token with our secret
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '24h' } // Token expires in 24 hours
  );
};