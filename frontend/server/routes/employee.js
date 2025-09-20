import express from 'express';
import middleware from '../middleware/authMiddleware.js';
import {addEmployee, uploadSingle} from '../controllers/employeeController.js';

const router = express.Router();

router.post('/add', middleware, uploadSingle, addEmployee);

export default router;