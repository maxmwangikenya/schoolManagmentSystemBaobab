// routes/passwordRoutes.js
import express from 'express';
import passwordController from '../controllers/passwordController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

// Apply auth middleware to all password routes
router.use(authMiddleware);

// Routes
router.put('/change-password', passwordController.changePassword);
router.put('/reset-employee-password', adminMiddleware, passwordController.resetEmployeePassword);
router.get('/password-history', passwordController.getPasswordHistory);
router.put('/password-policy', adminMiddleware, passwordController.updatePasswordPolicy);
router.post('/validate-strength', passwordController.validatePasswordStrength);

export default router;