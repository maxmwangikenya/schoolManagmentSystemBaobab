// routes/salary.js
import express from 'express';
import salaryController from '../controllers/salaryController.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Adjust path as needed

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET /api/salary - Get all salaries
router.get('/', salaryController.getAllSalaries);

// POST /api/salary/add - Add new salary
router.post('/add', salaryController.addSalary);

// GET /api/salary/:id - Get single salary
router.get('/:id', salaryController.getSalaryById);

// PUT /api/salary/:id - Update salary
router.put('/:id', salaryController.updateSalary);

// DELETE /api/salary/:id - Delete salary
router.delete('/:id', salaryController.deleteSalary);

export default router;