// routes/attendanceRoutes.js
import express from 'express';
import { verifyUser } from '../middleware/authMiddleware.js';

import {
  clockIn,
  clockOut,
  getMyTodayAttendance,
  getMyAttendanceHistory,
  getMyDailyAttendanceSummary,     // ⬅️ NEW
  getMyMonthlyAttendanceSummary,   // ⬅️ NEW
} from '../controllers/attendanceController.js';

const router = express.Router();

// Employee self-service routes
router.post('/clock-in', verifyUser, clockIn);
router.post('/clock-out', verifyUser, clockOut);
router.get('/me/today', verifyUser, getMyTodayAttendance);
router.get('/me/history', verifyUser, getMyAttendanceHistory);

// 🔹 NEW SUMMARY ROUTES FOR CHARTS
router.get('/me/daily', verifyUser, getMyDailyAttendanceSummary);
router.get('/me/monthly', verifyUser, getMyMonthlyAttendanceSummary);

export default router;
