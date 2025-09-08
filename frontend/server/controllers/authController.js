import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

// Check if email exists
const checkEmail = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email is required' 
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        
        res.json({ 
            exists: !!user,
            role: user?.role || null
        });
    } catch (error) {
        console.error('Email check error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error during email check' 
        });
    }
};

// Login controller
const login = async (req, res) => {
    try {
        const { email,  } = req.body;
        
        // 1. Find user
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                error: "Invalid credentials" 
            });
        }

        // 2. Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                error: "Invalid credentials" 
            });
        }

        // 3. Generate JWT
        const token = jwt.sign(
            { 
                _id: user._id, 
                role: user.role,
                email: user.email
            },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: "10d" }
        );

        // 4. Send response
        res.status(200).json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            error: "Authentication failed" 
        });
    }
};

// Register controller
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // 1. Validate required fields
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                error: "All fields are required"
            });
        }

        // 2. Validate role
        if (!['admin', 'employee'].includes(role.toLowerCase())) {
            return res.status(400).json({
                success: false,
                error: "Role must be either 'admin' or 'employee'"
            });
        }

        // 3. Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: "User with this email already exists"
            });
        }

        // 4. Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 5. Create new user
        const newUser = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: role.toLowerCase()
        });

        // 6. Save user to database
        await newUser.save();

        // 7. Generate JWT token
        const token = jwt.sign(
            {
                _id: newUser._id,
                role: newUser.role,
                email: newUser.email
            },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: "10d" }
        );

        // 8. Send success response
        res.status(201).json({
            success: true,
            token,
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                error: "User with this email already exists"
            });
        }

        res.status(500).json({
            success: false,
            error: "Registration failed. Please try again."
        });
    }
};

// Logout controller
const logout = async (req, res) => {
    try {
        // Client-side should remove the token
        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: "Logout failed"
        });
    }
};

// Export all functions
export { login, register, logout, checkEmail };