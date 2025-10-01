// routes/auth.js
import express from 'express';
import { verifyUser, adminMiddleware } from '../middleware/authMiddleware.js';
import passwordController from '../controllers/passwordController.js';

const router = express.Router();

// Password Management Routes
router.put('/change-password', verifyUser, passwordController.changePassword);
router.put('/reset-employee-password', verifyUser, adminMiddleware, passwordController.resetEmployeePassword);
router.post('/bulk-password-reset', verifyUser, adminMiddleware, passwordController.bulkPasswordReset);

// Password Information Routes
router.get('/password-history', verifyUser, passwordController.getPasswordHistory);
router.get('/password-policy', verifyUser, passwordController.getPasswordPolicy);
router.get('/check-password-expiry', verifyUser, passwordController.checkPasswordExpiry);

// Password Policy Management (Admin only)
router.put('/password-policy', verifyUser, adminMiddleware, passwordController.updatePasswordPolicy);

// Password Validation
router.post('/validate-strength', passwordController.validatePasswordStrength);

export default router;