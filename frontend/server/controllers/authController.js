import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import PasswordPolicy from '../models/PasswordPolicy.js';
import PasswordHistory from '../models/PasswordHistory.js';
import dotenv from "dotenv";
dotenv.config();

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

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        
        res.json({ 
            exists: !!user,
            role: user?.role || null
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Server error during email check' 
        });
    }
};

// Login controller - FIXED VERSION
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        

        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                error: "Email and password are required" 
            });
        }
        
        // Find user with password field
        
        const user = await User.findOne({ 
            email: email.toLowerCase().trim() 
        }).select('+password');
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                error: "Invalid credentials" 
            });
        }



        // Check if account is locked
        if (user.isAccountLocked && user.isAccountLocked()) {
            const minutesRemaining = Math.ceil((user.accountLockedUntil - Date.now()) / (1000 * 60));
            return res.status(423).json({
                success: false,
                error: `Account is locked. Try again in ${minutesRemaining} minutes.`
            });
        }

        // Verify password using the User model's comparePassword method
        console.log('Comparing passwords...');
        const isMatch = await user.comparePassword(password);
        console.log('Password match result:', isMatch);
        
        if (!isMatch) {
            console.log('ERROR: Password does not match');
            
            // Increment failed attempts
            if (user.incrementLoginAttempts) {
                await user.incrementLoginAttempts();
            }
            
            return res.status(401).json({ 
                success: false, 
                error: "Invalid credentials" 
            });
        }

        console.log('SUCCESS: Password matches');

        // Reset failed login attempts on successful login
        if (user.resetLoginAttempts) {
            await user.resetLoginAttempts();
        }

        // Find associated employee if role is employee
        let employeeId = null;
        if (user.role === 'employee') {
            console.log('Finding employee document...');
            const employee = await Employee.findOne({ 
                email: email.toLowerCase().trim() 
            });
            
            if (employee) {
                employeeId = employee._id;
                console.log('SUCCESS: Employee found:', employeeId);
            } else {
                console.log('WARNING: No employee record found');
            }
        }

        // Check for JWT_SECRET
        if (!process.env.JWT_SECRET) {
            console.warn('WARNING: JWT_SECRET not set! Using fallback.');
        }

        // Generate JWT
        
        const token = jwt.sign(
            { 
                _id: user._id, 
                role: user.role,
                email: user.email
            },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: "7d" }
        );

 

        // Send response
        res.status(200).json({
            success: true,
            token,
            user: {
                _id: user._id,           
                name: user.name,
                email: user.email,
                role: user.role,
                employeeId: employeeId   
            }
        });
        
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: "Authentication failed. Please try again." 
        });
    }
};

// Register controller - FIXED VERSION (NO MANUAL HASHING)
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;



        // Validate required fields
        if (!name || !email || !password || !role) {

            
            return res.status(400).json({
                success: false,
                error: "All fields are required",
                missing: missing
            });
        }

        // Validate role
        if (!['admin', 'employee'].includes(role.toLowerCase())) {
            return res.status(400).json({
                success: false,
                error: "Role must be either 'admin' or 'employee'"
            });
        }



        // Check if user already exists FIRST

        const existingUser = await User.findOne({ 
            email: email.toLowerCase().trim() 
        });
        
        if (existingUser) {

            return res.status(409).json({
                success: false,
                error: "User with this email already exists"
            });
        }

        console.log('SUCCESS: Email is available');

        // Validate password against policy
        let validation;
        try {
            validation = await User.validatePasswordAgainstPolicy(password);
        } catch (policyError) {
            // Use basic validation
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


        
        const newUser = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: password,  // Plain password - model will hash it
            role: role.toLowerCase(),
            passwordChangedAt: new Date()
        });

        console.log('User document created (not saved yet)');
        console.log('About to save user to database...');

        // Save user to database (pre-save hook will hash the password automatically)
        await newUser.save();
        


        // Verify the user was saved with hashed password
        const savedUser = await User.findById(newUser._id).select('+password');


        // Log password creation in history
        try {
            await PasswordHistory.logPasswordChange({
                userId: newUser._id,
                userModel: 'User',
                oldPasswordHash: savedUser.password,
                changeType: 'system_reset',
                reason: 'Initial registration'
            });
            console.log('SUCCESS: Password history logged');
        } catch (historyError) {
            console.warn('WARNING: Password history logging failed:', historyError.message);
            // Don't fail registration if history logging fails
        }

        // Generate JWT token
        console.log('Generating JWT token...');
        const token = jwt.sign(
            {
                _id: newUser._id,
                role: newUser.role,
                email: newUser.email
            },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: "7d" } 
        );


        res.status(201).json({
            success: true,
            message: "Registration successful",
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
            console.log('Duplicate key error - user already exists');
            return res.status(409).json({
                success: false,
                error: "User with this email already exists"
            });
        }

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: "Validation failed",
                details: Object.values(error.errors).map(e => e.message)
            });
        }

        res.status(500).json({
            success: false,
            error: "Registration failed. Please try again.",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Logout controller
const logout = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Logout failed"
        });
    }
};

// Verify token
const verifyToken = async (req, res) => {
    try {
        res.json({
            success: true,
            message: "Token is valid",
            user: req.user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Token verification failed"
        });
    }
};

export { login, register, logout, checkEmail, verifyToken };