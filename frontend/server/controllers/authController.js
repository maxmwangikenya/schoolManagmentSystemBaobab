import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import bcrypt from 'bcrypt';

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 1. Find user
    const user = await User.findOne({ email }).select('+password'); // Explicitly include password
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: "Invalid credentials" // Generic message for security
      });
    }

    // 2. Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        error: "Invalid credentials" // Same message as above
      });
    }

    // 3. Generate JWT
    const token = jwt.sign(
      { 
        _id: user._id, 
        role: user.role,
        email: user.email // Added email for potential frontend use
      },
      process.env.JWT_KEY,
      { expiresIn: "10d" }
    );

    // 4. Send response
    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email, // Added email
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Login error:', error); // Better error logging
    res.status(500).json({ 
      success: false, 
      error: "Authentication failed" 
    });
  }
};

// Add other auth controller functions here
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: "All fields (name, email, password, role) are required"
      });
    }

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid email address"
      });
    }

    // 3. Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long"
      });
    }

    // 4. Validate role
    if (!['admin', 'employee'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: "Role must be either 'admin' or 'employee'"
      });
    }

    // 5. Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "User with this email already exists"
      });
    }

    // 6. Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 7. Create new user
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role.toLowerCase()
    });

    // 8. Save user to database
    await newUser.save();

    // 9. Generate JWT token for automatic login after registration
    const token = jwt.sign(
      {
        _id: newUser._id,
        role: newUser.role,
        email: newUser.email
      },
      process.env.JWT_KEY,
      { expiresIn: "10d" }
    );

    // 10. Send success response (exclude password from response)
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.CreateAt
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate key error (alternative to our manual check)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: "User with this email already exists"
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      error: "Registration failed. Please try again."
    });
  }
};

const logout = async (req, res) => {
  // Logout logic here
};

export { login, register, logout };