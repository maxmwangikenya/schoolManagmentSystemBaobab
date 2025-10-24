// routes/reportRoutes.js
import express from 'express';
import {
  getAllLeaves,
  getLeaveStatistics,
  getDepartmentLeaveSummary,
  getEmployeeLeaveReport
} from '../controllers/reportController.js';
import { verifyUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all leaves with employee and department details
router.get('/leaves', verifyUser, getAllLeaves);

// Get leave statistics
router.get('/leaves/statistics', verifyUser, getLeaveStatistics);

// Get department-wise leave summary
router.get('/leaves/department-summary', verifyUser, getDepartmentLeaveSummary);

// Get specific employee leave report
router.get('/leaves/employee/:employeeId', verifyUser, getEmployeeLeaveReport);

export default router;