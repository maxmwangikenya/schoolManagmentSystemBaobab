import { Router } from 'express';
import { login, register, logout, checkEmail } from '../controllers/authController.js';
import { verifyUser } from '../middleware/authMiddleware.js';

const router = Router();

// Auth routes
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

export default router;