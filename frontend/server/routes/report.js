// routes/reportRouter.js
import express from 'express';
import {
  getAllReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  getReportStatistics
} from '../controllers/reportController.js';
import { verifyUser } from '../middleware/authMiddleware.js'; // Adjust based on your auth middleware

const router = express.Router();

// ROUTES

// Get report statistics/summary
router.get('/statistics', verifyUser, getReportStatistics);

// Get all reports (with filters)
router.get('/', verifyUser, getAllReports);

// Get single report by ID
router.get('/:id', verifyUser, getReportById);

// Create/Generate new report
router.post('/', verifyUser, createReport);

// Update report
router.put('/:id', verifyUser, updateReport);

// Delete report (soft delete)
router.delete('/:id', verifyUser, deleteReport);

export default router;