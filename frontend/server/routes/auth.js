import { Router } from 'express';
import { login, register, logout, checkEmail, verifyToken } from '../controllers/authController.js';
import { verifyUser, adminMiddleware } from '../middleware/authMiddleware.js';
import passwordController from '../controllers/passwordController.js';

const router = Router();

router.get('/test', (req, res) => {
    console.log('Auth routes test endpoint hit');
    res.json({ success: true, message: 'Auth routes are working' });
});

// Authentication
router.post('/login', (req, res, next) => {
    console.log(' Login attempt:', {
        email: req.body?.email,
        hasPassword: !!req.body?.password,
        body: Object.keys(req.body || {})
    });
    next();
}, login);

router.post('/register', (req, res, next) => {
    console.log('Registration attempt:', {
        email: req.body?.email,
        body: Object.keys(req.body || {})
    });
    next();
}, register);

router.post('/check-email', checkEmail);

// Password validation (public utility)
router.post('/validate-strength', passwordController.validatePasswordStrength);

// Password policy information (public)
router.get('/password-policy', passwordController.getPasswordPolicy);

// Token verification
router.get('/verify', (req, res, next) => {
    console.log('🔍 Token verification attempt:', {
        hasAuthHeader: !!req.headers.authorization,
        authHeader: req.headers.authorization ? 'Present' : 'Missing'
    });
    next();
}, verifyUser, verifyToken);

// Logout
router.post('/logout', verifyUser, logout);

// User's own password management
router.put('/change-password', verifyUser, passwordController.changePassword);

// User's password information
router.get('/password-history', verifyUser, passwordController.getPasswordHistory);
router.get('/check-password-expiry', verifyUser, passwordController.checkPasswordExpiry);

// ============= ADMIN ROUTES (Admin authentication required) =============

// ✅ NEW: Admin changes any employee's password
router.put('/admin-change-password/:employeeId', 
    verifyUser, 
    adminMiddleware, 
    passwordController.adminChangeEmployeePassword
);

// Employee password management (existing routes)
router.put('/reset-employee-password', verifyUser, adminMiddleware, passwordController.resetEmployeePassword);
router.post('/bulk-password-reset', verifyUser, adminMiddleware, passwordController.bulkPasswordReset);

// Password policy management
router.put('/password-policy', verifyUser, adminMiddleware, passwordController.updatePasswordPolicy);

console.log('Auth & Password routes registered');

export default router;