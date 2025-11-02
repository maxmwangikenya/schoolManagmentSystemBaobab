// routes/auth.js
import { Router } from 'express';
import {
  login,
  register,
  logout,
  checkEmail,
  verifyToken
} from '../controllers/authController.js';

import {
  verifyUser,
  adminMiddleware
} from '../middleware/authMiddleware.js';

import passwordController from '../controllers/passwordController.js';

const router = Router();

// Simple health/test endpoint for the auth router
router.get('/test', (req, res) => {
  console.log('Auth routes test endpoint hit');
  res.json({ success: true, message: 'Auth routes are working' });
});

// ------------- Auth endpoints -------------

// Login
router.post(
  '/login',
  (req, res, next) => {
    console.log('Login attempt:', {
      email: req.body?.email,
      hasPassword: !!req.body?.password,
      body: Object.keys(req.body || {})
    });
    next();
  },
  login
);

// Register
router.post(
  '/register',
  (req, res, next) => {
    console.log('Registration attempt:', {
      email: req.body?.email,
      body: Object.keys(req.body || {})
    });
    next();
  },
  register
);

// Check if email exists
router.post('/check-email', checkEmail);

// Verify token (requires auth middleware to populate req.user)
router.get(
  '/verify',
  (req, res, next) => {
    console.log('Token verification attempt:', {
      hasAuthHeader: !!req.headers.authorization,
      authHeader: req.headers.authorization ? 'Present' : 'Missing'
    });
    next();
  },
  verifyUser,
  verifyToken
);

// Logout
router.post('/logout', verifyUser, logout);

// ------------- Password utilities (public) -------------

// Validate password strength (public helper)
router.post('/validate-strength', passwordController.validatePasswordStrength);

// Get current password policy (public)
router.get('/password-policy', passwordController.getPasswordPolicy);

// ------------- Password management (user) -------------

// Change current user's password
router.put('/change-password', verifyUser, passwordController.changePassword);

// Get current user's password history
router.get('/password-history', verifyUser, passwordController.getPasswordHistory);

// Check if current user's password is expired/expiring
router.get('/check-password-expiry', verifyUser, passwordController.checkPasswordExpiry);

// ------------- Admin-only password actions -------------

// Admin: change a specific employee's password
router.put(
  '/admin-change-password/:employeeId',
  verifyUser,
  adminMiddleware,
  passwordController.adminChangeEmployeePassword
);

// Admin: reset a single employee's password (legacy route)
router.put(
  '/reset-employee-password',
  verifyUser,
  adminMiddleware,
  passwordController.resetEmployeePassword
);

// Admin: bulk reset
router.post(
  '/bulk-password-reset',
  verifyUser,
  adminMiddleware,
  passwordController.bulkPasswordReset
);

console.log('Auth & Password routes registered');

export default router;
