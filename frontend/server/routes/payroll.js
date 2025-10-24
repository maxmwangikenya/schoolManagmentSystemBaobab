// routes/payrollRoutes.js
import express from 'express';
import { verifyUser } from '../middleware/authMiddleware.js';
import { generatePayroll, getAllPayrolls,getPayrollByPeriod, getPayrollPeriods, getEmployeePayslips, getPayslipById } from '../controllers/payrollController.js';


const router = express.Router();

// POST /api/payroll/generate → generate payroll for all employees
router.post('/generate', verifyUser, generatePayroll);

// GET /api/payroll → list all payroll records
router.get('/', verifyUser, getAllPayrolls);

router.get('/by-periods', verifyUser, getPayrollByPeriod);

router.get('/periods', verifyUser, getPayrollPeriods)

// Get all payslips for an employee
router.get('/employee/:employeeId', verifyUser, getEmployeePayslips);

// Get a single payslip by payroll ID
router.get('/:payrollId', verifyUser, getPayslipById);

export default router;