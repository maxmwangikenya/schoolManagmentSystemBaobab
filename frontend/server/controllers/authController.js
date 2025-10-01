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
        const { email, password } = req.body;
        
        console.log('\n🔐 ===== LOGIN PROCESS START =====');
        console.log('📧 Email received:', email);
        console.log('🔑 Password received:', password ? `Yes (${password.length} chars)` : 'No');
        
        // Validate input
        if (!email || !password) {
            console.log('❌ Missing email or password');
            return res.status(400).json({ 
                success: false, 
                error: "Email and password are required" 
            });
        }
        
        // Find user
        console.log('🔍 Searching for user in database...');
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        
        if (!user) {
            console.log('❌ User not found in database:', email);
            console.log('💡 TIP: Make sure this user exists. Run the createTestUser.js script.');
            return res.status(401).json({ 
                success: false, 
                error: "Invalid credentials" 
            });
        }

        console.log('✅ User found:', {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            hasPassword: !!user.password
        });

        // Verify password
        console.log('🔐 Comparing passwords...');
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            console.log('❌ Password does not match for:', email);
            console.log('💡 TIP: Password in database might be different. Try resetting it.');
            return res.status(401).json({ 
                success: false, 
                error: "Invalid credentials" 
            });
        }

        console.log('✅ Password matches!');

        // Check for JWT_SECRET
        if (!process.env.JWT_SECRET) {
            console.warn('⚠️  WARNING: JWT_SECRET not set in .env file! Using fallback.');
        }

        // Generate JWT
        console.log('🎫 Generating JWT token...');
        const token = jwt.sign(
            { 
                _id: user._id, 
                role: user.role,
                email: user.email
            },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: "10d" }
        );

        console.log('✅ Login successful!');
        console.log('👤 User:', user.name);
        console.log('📧 Email:', user.email);
        console.log('🎭 Role:', user.role);
        console.log('🎫 Token generated (first 20 chars):', token.substring(0, 20) + '...');
        console.log('===== LOGIN PROCESS END =====\n');

        // Send response
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
        console.error('❌ LOGIN ERROR:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            success: false, 
            error: "Authentication failed. Please try again." 
        });
    }
};

// Register controller
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        console.log('\n📝 ===== REGISTRATION PROCESS START =====');
        console.log('Data received:', { 
            name, 
            email, 
            role,
            passwordLength: password?.length 
        });

        // Validate required fields
        if (!name || !email || !password || !role) {
            console.log('❌ Missing required fields');
            return res.status(400).json({
                success: false,
                error: "All fields are required"
            });
        }

        // Validate role
        if (!['admin', 'employee'].includes(role.toLowerCase())) {
            console.log('❌ Invalid role:', role);
            return res.status(400).json({
                success: false,
                error: "Role must be either 'admin' or 'employee'"
            });
        }

        // Check if user already exists
        console.log('🔍 Checking if user exists...');
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            console.log('❌ User already exists:', email);
            return res.status(409).json({
                success: false,
                error: "User with this email already exists"
            });
        }

        console.log('✅ Email is available');

        // Hash password
        console.log('🔐 Hashing password...');
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log('✅ Password hashed');

        // Create new user
        console.log('💾 Creating user in database...');
        const newUser = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: role.toLowerCase()
        });

        // Save user to database
        await newUser.save();
        console.log('✅ User saved to database');

        // Generate JWT token
        console.log('🎫 Generating JWT token...');
        const token = jwt.sign(
            {
                _id: newUser._id,
                role: newUser.role,
                email: newUser.email
            },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: "10d" }
        );

        console.log('✅ Registration successful!');
        console.log('👤 User:', newUser.name);
        console.log('📧 Email:', newUser.email);
        console.log('🎭 Role:', newUser.role);
        console.log('===== REGISTRATION PROCESS END =====\n');

        // Send success response
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
        console.error('❌ REGISTRATION ERROR:', error);
        console.error('Error stack:', error.stack);
        
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
        console.log('👋 User logging out:', req.user?.email);
        
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

// Verify token (GET route)
const verifyToken = async (req, res) => {
    try {
        console.log('🔍 Token verified for:', req.user?.email);
        
        // req.user is already set by verifyUser middleware
        res.json({
            success: true,
            message: "Token is valid",
            user: req.user
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({
            success: false,
            error: "Token verification failed"
        });
    }
};

// Export all functions
export { login, register, logout, checkEmail, verifyToken };