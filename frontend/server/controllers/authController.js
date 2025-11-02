// controllers/authController.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import PasswordPolicy from '../models/PasswordPolicy.js';
import PasswordHistory from '../models/PasswordHistory.js';

dotenv.config();

/**
 * POST /api/auth/check-email
 * Body: { email }
 */
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const normalized = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalized });

    return res.json({
      success: true,
      exists: !!user,
      role: user?.role || null
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server error during email check'
    });
  }
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 * - Finds User by email
 * - Compares password
 * - If role === 'employee', finds linked Employee via { user: user._id }
 * - Returns JWT + user payload (with employeeId if applicable)
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const normalized = email.toLowerCase().trim();

    // Include password explicitly
    const user = await User.findOne({ email: normalized }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Optional: account lock checks (only if you’ve implemented these on the model)
    if (user.isAccountLocked && user.isAccountLocked()) {
      const minutesRemaining = Math.ceil((user.accountLockedUntil - Date.now()) / (1000 * 60));
      return res.status(423).json({
        success: false,
        error: `Account is locked. Try again in ${minutesRemaining} minutes.`
      });
    }

    // Verify password using the User model's comparePassword method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Increment failed attempts if you’ve implemented it
      if (user.incrementLoginAttempts) {
        await user.incrementLoginAttempts();
      }
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Reset failed attempts if you’ve implemented it
    if (user.resetLoginAttempts) {
      await user.resetLoginAttempts();
    }

    // Resolve associated employee by reliable link (user._id), not by email
    let employeeId = null;
    if (user.role === 'employee') {
      const employee = await Employee.findOne({ user: user._id }).select('_id');
      // Fallback: if older data doesn’t have link yet, try by email (optional)
      if (!employee) {
        const fallback = await Employee.findOne({ email: normalized }).select('_id');
        employeeId = fallback ? fallback._id : null;
      } else {
        employeeId = employee._id;
      }
    }

    // Generate JWT
    if (!process.env.JWT_SECRET) {
      console.warn('WARNING: JWT_SECRET not set! Using fallback.');
    }

    const token = jwt.sign(
      {
        _id: user._id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Authentication failed. Please try again.'
    });
  }
};

/**
 * POST /api/auth/register
 * Body: { name, email, password, role }
 * - Plain password is passed to the model; model pre-save hook hashes it once
 * - Optional password policy + history logging guarded by try/catch
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedRole = role.toLowerCase();

    // Validate role
    if (!['admin', 'employee'].includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        error: "Role must be either 'admin' or 'employee'"
      });
    }

    // Check if user already exists FIRST
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Validate password against policy (if implemented)
    let validation;
    try {
      if (typeof User.validatePasswordAgainstPolicy === 'function') {
        validation = await User.validatePasswordAgainstPolicy(password);
      } else if (typeof PasswordPolicy?.validate === 'function') {
        validation = await PasswordPolicy.validate(password);
      } else {
        // Basic fallback
        validation = {
          isValid: password.length >= 6,
          errors: password.length >= 6 ? [] : ['Password must be at least 6 characters']
        };
      }
    } catch {
      // Ensure we never block due to policy service error
      validation = {
        isValid: password.length >= 6,
        errors: password.length >= 6 ? [] : ['Password must be at least 6 characters']
      };
    }

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.errors.join('. '),
        validationDetails: validation
      });
    }

    // Create user (model will hash password once in pre-save hook)
    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      password, // plain → pre-save hook hashes once
      role: normalizedRole,
      passwordChangedAt: new Date()
    });

    await newUser.save();

    // Optionally log password creation in history
    try {
      if (typeof PasswordHistory?.logPasswordChange === 'function') {
        // Fetch hashed password to store in history (select +password)
        const savedUser = await User.findById(newUser._id).select('+password');
        await PasswordHistory.logPasswordChange({
          userId: newUser._id,
          userModel: 'User',
          oldPasswordHash: savedUser?.password,
          changeType: 'system_reset',
          reason: 'Initial registration'
        });
      }
    } catch (historyError) {
      console.warn('Password history logging failed:', historyError?.message || historyError);
      // Non-fatal
    }

    // JWT
    const token = jwt.sign(
      {
        _id: newUser._id,
        role: newUser.role,
        email: newUser.email
      },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: Object.values(error.errors).map(e => e.message)
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  try {
    // If you store refresh tokens, you could invalidate them here.
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
};

/**
 * GET /api/auth/verify
 * (Assumes you have auth middleware that sets req.user)
 */
export const verifyToken = async (req, res) => {
  try {
    return res.json({
      success: true,
      message: 'Token is valid',
      user: req.user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Token verification failed'
    });
  }
};

export default {
  checkEmail,
  login,
  register,
  logout,
  verifyToken
};
