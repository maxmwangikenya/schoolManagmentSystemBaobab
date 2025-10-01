// routes/auth.js
import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import passwordController from '../controllers/passwordController.js';

const router = express.Router();

// Import your existing auth controller if you have one
// import authController from '../controllers/authController.js';

// Existing auth routes (uncomment and add your actual auth routes)
// router.post('/login', authController.login);
// router.post('/register', authController.register);
// router.get('/verify', authMiddleware, authController.verify);

// Password Management Routes
router.put('/change-password', authMiddleware, passwordController.changePassword);
router.put('/reset-employee-password', authMiddleware, adminMiddleware, passwordController.resetEmployeePassword);
router.post('/bulk-password-reset', authMiddleware, adminMiddleware, passwordController.bulkPasswordReset);

// Password Information Routes
router.get('/password-history', authMiddleware, passwordController.getPasswordHistory);
router.get('/password-policy', authMiddleware, passwordController.getPasswordPolicy);
router.get('/check-password-expiry', authMiddleware, passwordController.checkPasswordExpiry);

// Password Policy Management (Admin only)
router.put('/password-policy', authMiddleware, adminMiddleware, passwordController.updatePasswordPolicy);

// Password Validation
router.post('/validate-strength', passwordController.validatePasswordStrength);

export default router;