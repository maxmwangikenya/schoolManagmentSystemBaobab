import express from 'express';
import { verifyUser } from '../middleware/authMiddleware.js';
import { addDepartment, getDepartments, updateDepartment, deleteDepartment } from '../controllers/departmentControler.js';

const router = express.Router();

router.post('/add', verifyUser, addDepartment);
router.get('/', verifyUser, getDepartments);             
router.put('/:id', verifyUser, updateDepartment);         
router.delete('/:id', verifyUser, deleteDepartment);      

export default router;