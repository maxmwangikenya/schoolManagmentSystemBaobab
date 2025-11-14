import express from 'express';
import { verifyUser } from '../middleware/authMiddleware.js';
import {
  clockIn,
  clockOut,
  getMyTodayAttendance,
  getMyAttendanceHistory,
} from '../controllers/attendanceController.js';

const router = express.Router();

// Employee self-service routes
router.post('/clock-in', verifyUser, clockIn);
router.post('/clock-out', verifyUser, clockOut);
router.get('/me/today', verifyUser, getMyTodayAttendance);
router.get('/me/history', verifyUser, getMyAttendanceHistory);


export default router;
