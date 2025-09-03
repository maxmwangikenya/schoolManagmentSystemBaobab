import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const verifyUser = async (req, res, next) => {
    try {
        // Check if authorization header exists
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                error: "Access denied. No token provided." 
            });
        }

        // Extract token
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                error: "Access denied. Invalid token format." 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
        
        // Find user in database
        const user = await User.findById(decoded._id).select('-password');
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                error: "Token is no longer valid. User not found." 
            });
        }

        // Attach user to request object
        req.user = user;
        next();

    } catch (error) {
        console.error('Auth middleware error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                error: "Invalid token." 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                error: "Token has expired." 
            });
        }

        res.status(500).json({ 
            success: false, 
            error: "Server error during authentication." 
        });
    }
};

// Optional: Middleware to check specific roles
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                error: "Authentication required." 
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                error: `Access denied. Required role: ${roles.join(', ')}` 
            });
        }

        next();
    };
};

export { verifyUser, requireRole };