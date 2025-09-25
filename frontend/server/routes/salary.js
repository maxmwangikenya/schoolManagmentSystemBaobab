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

// GET /api/salary/history/:employeeId - Get salary history for specific employee
router.get('/history/:employeeId', salaryController.getSalaryHistory);

// GET /api/salary/summary/:employeeId - Get salary summary for specific employee
router.get('/summary/:employeeId', salaryController.getEmployeeSalarySummary);

// GET /api/salary/department/:departmentId/stats - Get department salary statistics
router.get('/department/:departmentId/stats', salaryController.getDepartmentSalaryStats);

// GET /api/salary/:id - Get single salary (keep this after specific routes to avoid conflicts)
router.get('/:id', salaryController.getSalaryById);

// PUT /api/salary/:id - Update salary
router.put('/:id', salaryController.updateSalary);

// DELETE /api/salary/:id - Delete salary
router.delete('/:id', salaryController.deleteSalary);

export default router;