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
        console.error('Email check error:', error);
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
        
        console.log('\n===== LOGIN ATTEMPT =====');
        console.log('Email:', email);
        console.log('Password length:', password?.length);
        console.log('Request body keys:', Object.keys(req.body));
        
        // Validate input
        if (!email || !password) {
            console.log('ERROR: Missing email or password');
            return res.status(400).json({ 
                success: false, 
                error: "Email and password are required" 
            });
        }
        
        // Find user with password field
        console.log('Searching for user in database...');
        const user = await User.findOne({ 
            email: email.toLowerCase().trim() 
        }).select('+password');
        
        if (!user) {
            console.log('ERROR: User not found in database:', email);
            return res.status(401).json({ 
                success: false, 
                error: "Invalid credentials" 
            });
        }

        console.log('SUCCESS: User found:', {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            hasPassword: !!user.password,
            passwordLength: user.password?.length
        });

        // Check if account is locked
        if (user.isAccountLocked && user.isAccountLocked()) {
            console.log('LOCKED: Account is locked');
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
        console.log('Generating JWT token...');
        const token = jwt.sign(
            { 
                _id: user._id, 
                role: user.role,
                email: user.email
            },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: "7d" }
        );

        console.log('SUCCESS: Login successful');
        console.log('===== LOGIN COMPLETE =====\n');

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
        console.error('ERROR: LOGIN FAILED:', error);
        console.error('Error stack:', error.stack);
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

        console.log('\n===== REGISTRATION START =====');
        console.log('Timestamp:', new Date().toISOString());
        console.log('Request body keys:', Object.keys(req.body));
        console.log('Data received:', { 
            name: name || 'MISSING', 
            email: email || 'MISSING', 
            role: role || 'MISSING',
            passwordLength: password?.length || 'MISSING',
            hasPassword: !!password
        });

        // Validate required fields
        if (!name || !email || !password || !role) {
            console.log('ERROR: Missing required fields');
            const missing = [];
            if (!name) missing.push('name');
            if (!email) missing.push('email');
            if (!password) missing.push('password');
            if (!role) missing.push('role');
            console.log('Missing fields:', missing);
            
            return res.status(400).json({
                success: false,
                error: "All fields are required",
                missing: missing
            });
        }

        // Validate role
        if (!['admin', 'employee'].includes(role.toLowerCase())) {
            console.log('ERROR: Invalid role:', role);
            return res.status(400).json({
                success: false,
                error: "Role must be either 'admin' or 'employee'"
            });
        }

        console.log('SUCCESS: All required fields present');

        // Check if user already exists FIRST
        console.log('Checking if user exists...');
        const existingUser = await User.findOne({ 
            email: email.toLowerCase().trim() 
        });
        
        if (existingUser) {
            console.log('ERROR: User already exists:', email);
            console.log('Existing user details:', {
                id: existingUser._id,
                name: existingUser.name,
                role: existingUser.role,
                createdAt: existingUser.createdAt
            });
            return res.status(409).json({
                success: false,
                error: "User with this email already exists"
            });
        }

        console.log('SUCCESS: Email is available');

        // Validate password against policy
        console.log('Validating password against policy...');
        let validation;
        try {
            validation = await User.validatePasswordAgainstPolicy(password);
            console.log('Policy validation result:', validation);
        } catch (policyError) {
            console.warn('WARNING: Policy validation error:', policyError.message);
            // Use basic validation
            validation = {
                isValid: password.length >= 6,
                errors: password.length >= 6 ? [] : ['Password must be at least 6 characters']
            };
        }
        
        if (!validation.isValid) {
            console.log('ERROR: Password validation failed:', validation.errors);
            return res.status(400).json({
                success: false,
                error: validation.errors.join('. '),
                validationDetails: validation
            });
        }

        console.log('SUCCESS: Password meets policy requirements');

        // CRITICAL: DO NOT HASH PASSWORD HERE
        // Let the User model's pre-save hook handle hashing
        console.log('Creating user document...');
        console.log('Password will be hashed by User model pre-save hook');
        
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
        
        console.log('SUCCESS: User saved to database');
        console.log('User ID:', newUser._id);
        console.log('User role:', newUser.role);

        // Verify the user was saved with hashed password
        const savedUser = await User.findById(newUser._id).select('+password');
        console.log('Verified saved user:', {
            id: savedUser._id,
            email: savedUser.email,
            role: savedUser.role,
            hasPassword: !!savedUser.password,
            passwordIsHashed: savedUser.password?.startsWith('$2'),
            passwordLength: savedUser.password?.length
        });

        // Log password creation in history
        try {
            console.log('Logging password history...');
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

        console.log('SUCCESS: JWT token generated');
        console.log('SUCCESS: Registration complete');
        console.log('===== REGISTRATION COMPLETE =====\n');

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
        console.error('ERROR: REGISTRATION FAILED:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        if (error.code === 11000) {
            console.log('Duplicate key error - user already exists');
            return res.status(409).json({
                success: false,
                error: "User with this email already exists"
            });
        }

        if (error.name === 'ValidationError') {
            console.log('Mongoose validation error:', error.errors);
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
        console.error('Logout error:', error);
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