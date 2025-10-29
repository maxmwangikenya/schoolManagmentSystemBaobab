import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Employee from '../models/Employee.js';

// Verify JWT token middleware - checks both User and Employee models
export const verifyUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        

        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];
        
        if (!token) {

            return res.status(401).json({
                success: false,
                error: 'Invalid token format'
            });
        }

        // Verify token

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
        console.log('SUCCESS: Token verified:', {
            userId: decoded._id || decoded.id,
            role: decoded.role,
            email: decoded.email
        });
        
        // Try to find user in User model first (Admin)

        let user = await User.findById(decoded._id || decoded.id).select('-password');
        
        // If not found in User, try Employee model
        if (!user) {
            user = await Employee.findById(decoded._id || decoded.id).select('-password');
        } 
        
        if (!user) {
            console.log('ERROR: User not found in any model');
            return res.status(401).json({
                success: false,
                error: 'User not found'
            });
        }

        console.log('SUCCESS: User found:', {
            id: user._id,
            name: user.name || `${user.firstName} ${user.lastName}`,
            role: user.role
        });

        // Attach user to request with consistent property names
        req.user = {
            _id: user._id,
            id: user._id,
            email: user.email,
            role: user.role,
            name: user.name || `${user.firstName} ${user.lastName}`,
            firstName: user.firstName,
            lastName: user.lastName
        };


        
        next();
        
    } catch (error) {
        console.error('ERROR: TOKEN VERIFICATION FAILED:', error.message);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Invalid token'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token expired'
            });
        }
        
        return res.status(500).json({
            success: false,
            error: 'Authentication failed'
        });
    }
};

// Admin role check middleware
export const adminMiddleware = (req, res, next) => {
    console.log(' ADMIN ACCESS CHECK ');
    console.log('Admin middleware check:', {
        userId: req.user?._id || req.user?.id,
        userRole: req.user?.role,
        isAdmin: req.user?.role?.toLowerCase() === 'admin'
    });

    if (!req.user) {
        console.log('ERROR: No user in request');
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }

    if (req.user.role?.toLowerCase() !== 'admin') {

        return res.status(403).json({
            success: false,
            error: 'Unauthorized: Admin access required'
        });
    }


    next();
};

// Export as default for backward compatibility
export default verifyUser;