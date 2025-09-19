import express from 'express';
import verifyUser from '../middleware/authMiddleware.js';
import { addDepartment, getDepartments, updateDepartment, deleteDepartment } from '../controllers/departmentControler.js'; // Fixed typo in filename

const router = express.Router();

router.post('/add', verifyUser, addDepartment);
router.get('/add', verifyUser, getDepartments);
router.patch('/add/:id', verifyUser, updateDepartment);
router.delete('/add/:id', verifyUser, deleteDepartment); // Changed to GET method for fetching data

export default router;