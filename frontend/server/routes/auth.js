import { Router } from 'express';
import { login, register, logout } from '../controllers/authController.js';

const router = Router();

// Auth routes
router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);

export default router;