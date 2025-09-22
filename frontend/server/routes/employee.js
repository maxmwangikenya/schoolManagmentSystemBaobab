import express from 'express';
import middleware from '../middleware/authMiddleware.js';
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
router.get('/', middleware, getAllEmployees);

// GET single employee by ID
router.get('/:id', middleware, getEmployeeById);

// POST add new employee
router.post('/add', middleware, uploadSingle, addEmployee);

// PUT update employee
router.put('/:id', middleware, uploadSingle, updateEmployee);

// DELETE employee
router.delete('/:id', middleware, deleteEmployee);

export default router;