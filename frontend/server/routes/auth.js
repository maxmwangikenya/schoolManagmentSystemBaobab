// routes/auth.js
import { Router } from 'express';
import { login, register, logout, checkEmail } from '../controllers/authController.js';
import { verifyUser, adminMiddleware } from '../middleware/authMiddleware.js';
import passwordController from '../controllers/passwordController.js';

const router = Router();

// Existing Auth routes
router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.post('/check-email', checkEmail);
router.post('/verify', verifyUser);

router.get('/verify', verifyUser, (req, res) => {
    res.json({
        success: true,
        message: "Token is valid",
        user: req.user
    });
});

// Password Management Routes
router.put('/change-password', verifyUser, passwordController.changePassword);
router.put('/reset-employee-password', verifyUser, adminMiddleware, passwordController.resetEmployeePassword);
router.post('/bulk-password-reset', verifyUser, adminMiddleware, passwordController.bulkPasswordReset);

// Password Information Routes
router.get('/password-history', verifyUser, passwordController.getPasswordHistory);
router.get('/password-policy', passwordController.getPasswordPolicy);
router.get('/check-password-expiry', verifyUser, passwordController.checkPasswordExpiry);

// Password Policy Management (Admin only)
router.put('/password-policy', verifyUser, adminMiddleware, passwordController.updatePasswordPolicy);

// Password Validation (public route)
router.post('/validate-strength', passwordController.validatePasswordStrength);

console.log('✅ Auth & Password routes registered');

export default router;