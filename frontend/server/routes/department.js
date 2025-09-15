import express from 'express';
import verifyUser from '../middleware/authMiddleware.js';
import { addDepartment } from '../controllers/departmentControler.js';

const router = express.Router();

router.post('/add', verifyUser, addDepartment);

export default router;