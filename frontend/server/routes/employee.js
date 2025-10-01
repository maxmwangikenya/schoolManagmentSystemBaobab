import express from 'express';
import { verifyUser } from '../middleware/authMiddleware.js';
import {
  addEmployee, 
  getAllEmployees, 
  getEmployeeById, 
  updateEmployee, 
  deleteEmployee, 
  uploadSingle
} from '../controllers/employeeController.js';

const router = express.Router();

// GET all employees
router.get('/', verifyUser, getAllEmployees);

// GET single employee by ID
router.get('/:id', verifyUser, getEmployeeById);

// POST add new employee
router.post('/add', verifyUser, uploadSingle, addEmployee);

// PUT update employee
router.put('/:id', verifyUser, uploadSingle, updateEmployee);

// DELETE employee
router.delete('/:id', verifyUser, deleteEmployee);

export default router;