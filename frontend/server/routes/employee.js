import express from 'express';
import { verifyUser } from '../middleware/authMiddleware.js';
import {
  addEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  uploadSingle,
  getEmployeeSalary,
  updateEmployeeSalary,
  getAllEmployeeSalaries
} from '../controllers/employeeController.js';

const router = express.Router();

// ⚠️ IMPORTANT: Order matters! Specific routes BEFORE dynamic :id routes

// GET all employees
router.get('/', verifyUser, getAllEmployees);

// GET all employee salaries (for salary management page)
router.get('/salaries', verifyUser, getAllEmployeeSalaries);

// GET specific employee salary
router.get('/:id/salary', verifyUser, getEmployeeSalary);

// PUT update specific employee salary
router.put('/:id/salary', verifyUser, updateEmployeeSalary);

// GET single employee by ID
router.get('/:id', verifyUser, getEmployeeById);

// POST add new employee
router.post('/add', verifyUser, uploadSingle, addEmployee);

// PUT update employee (full update, including salary)
router.put('/:id', verifyUser, uploadSingle, updateEmployee);

// DELETE employee
router.delete('/:id', verifyUser, deleteEmployee);

export default router;