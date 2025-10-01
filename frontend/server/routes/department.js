import express from 'express';
import { verifyUser } from '../middleware/authMiddleware.js';
import { addDepartment, getDepartments, updateDepartment, deleteDepartment } from '../controllers/departmentControler.js';

const router = express.Router();

router.post('/add', verifyUser, addDepartment);
router.get('/', verifyUser, getDepartments);              // Changed from '/add' to '/'
router.put('/:id', verifyUser, updateDepartment);         // Changed from PATCH to PUT and fixed route
router.delete('/:id', verifyUser, deleteDepartment);      // Fixed route

export default router;