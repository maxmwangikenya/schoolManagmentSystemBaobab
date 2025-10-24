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

// Employee Routes
router.post('/', authMiddleware, applyLeave);
router.get('/balance/:employeeId', authMiddleware, getLeaveBalance);
router.get('/employee/:employeeId', authMiddleware, getEmployeeLeaves);
router.delete('/cancel/:id', authMiddleware, cancelLeave);

// Admin Routes
router.get('/', authMiddleware, getAllLeaves);
router.get('/stats/summary', authMiddleware, getLeaveStats);
router.put('/:id/review', authMiddleware, reviewLeave);
router.get('/:id', authMiddleware, getLeaveById);

export default router;