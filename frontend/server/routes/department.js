import express from 'express';
import verifyUser from '../middleware/authMiddleware.js';
import { addDepartment, getDepartments } from '../controllers/departmentControler.js'; // Fixed typo in filename

const router = express.Router();

router.post('/add', verifyUser, addDepartment);
router.get('/', verifyUser, getDepartments); // Changed to GET method for fetching data

export default router;