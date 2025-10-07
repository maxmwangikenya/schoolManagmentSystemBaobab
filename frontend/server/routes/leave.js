// routes/leaveRoutes.js

import express from 'express';
import {
  applyLeave,
  getEmployeeLeaves,
  getAllLeaves,
  getLeaveById,
  reviewLeave,
  cancelLeave,
  getLeaveBalance,
  getLeaveStats
} from '../controllers/leaveController.js';
import authMiddleware from '../middleware/authMiddleware.js';


const router = express.Router();

// employee

// Apply for leave
router.post('/', authMiddleware, applyLeave);

// Get leave balance for an employee
router.get('/balance/:employeeId', authMiddleware, getLeaveBalance);

// Get all leaves for a specific employee
router.get('/employee/:employeeId', authMiddleware, getEmployeeLeaves);

// Cancel a pending leave
router.delete('/:id', authMiddleware, cancelLeave);

//  Admin

// Get all leave applications (Admin only)
router.get('/', authMiddleware, getAllLeaves);

// Get leave statistics for dashboard (Admin only)
router.get('/stats/summary', authMiddleware, getLeaveStats);

// Review leave - Approve or Reject (Admin only)
router.put('/:id/review', authMiddleware, reviewLeave);

// Get single leave details by ID (Employee and Admin)
router.get('/:id', authMiddleware, getLeaveById);

export default router;