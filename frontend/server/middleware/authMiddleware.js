// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Employee from '../models/Employee.js';

const verifyUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                error: "Access denied. No token provided." 
            });
        }

        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                error: "Access denied. Invalid token format." 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
        
        // Check both User and Employee collections
        let user = await User.findById(decoded._id).select('-password');
        
        if (!user) {
            user = await Employee.findById(decoded._id).select('-password');
        }
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                error: "Token is no longer valid. User not found." 
            });
        }

        // Attach user with id property (for password controller compatibility)
        req.user = {
            ...user.toObject(),
            id: user._id.toString()
        };
        
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

// Admin middleware
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

// Admin-only middleware
const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            success: false, 
            error: "Authentication required." 
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            success: false, 
            error: "Access denied. Admin privileges required." 
        });
    }

    next();
};

export { verifyUser, requireRole, adminMiddleware };
export default verifyUser;