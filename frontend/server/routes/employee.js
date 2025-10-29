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
  getAllEmployeeSalaries,

  // NEW
  getEmployeesByDepartmentStats,
  getEmployeesByDepartment
} from '../controllers/employeeController.js';

const router = express.Router();

// ⚠️ specific routes first
router.get('/stats/by-department', verifyUser, getEmployeesByDepartmentStats);
router.get('/by-department/:depName', verifyUser, getEmployeesByDepartment);

// existing
router.get('/', verifyUser, getAllEmployees);
router.get('/salaries', verifyUser, getAllEmployeeSalaries);
router.get('/:id/salary', verifyUser, getEmployeeSalary);
router.put('/:id/salary', verifyUser, updateEmployeeSalary);
router.get('/:id', verifyUser, getEmployeeById);
router.post('/add', verifyUser, uploadSingle, addEmployee);
router.put('/:id', verifyUser, uploadSingle, updateEmployee);
router.delete('/:id', verifyUser, deleteEmployee);

export default router;
