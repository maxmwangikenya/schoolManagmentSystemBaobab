import Employee from '../models/Employee.js';
import User from '../models/User.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcrypt';

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './public/uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

export const uploadSingle = upload.single('profileImage');

// Get all employees
export const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      employees: employees
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch employees'
    });
  }
};

// Get single employee by ID
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('user', 'name email');
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }
    
    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch employee'
    });
  }
};

// ✨ Get all employee salaries (for salary management page)
export const getAllEmployeeSalaries = async (req, res) => {
  try {
    const employees = await Employee.find()
      .select('name employeeId designation department salary')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: employees.length,
      salaries: employees
    });
  } catch (error) {
    console.error('Error fetching employee salaries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch employee salaries'
    });
  }
};

// ✨ Get employee salary by ID
export const getEmployeeSalary = async (req, res) => {
  try {
    const { id } = req.params;
    
    const employee = await Employee.findById(id)
      .select('name employeeId designation department salary');
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }
    
    res.json({
      success: true,
      salary: {
        _id: employee._id,
        employeeId: employee.employeeId,
        name: employee.name,
        designation: employee.designation,
        department: employee.department,
        salary: employee.salary || 0
      }
    });
  } catch (error) {
    console.error('Error fetching employee salary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch employee salary'
    });
  }
};

// ✨ Update employee salary
export const updateEmployeeSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const { salary } = req.body;

    // Validate salary
    if (salary === undefined || salary === null) {
      return res.status(400).json({
        success: false,
        error: 'Please provide salary amount'
      });
    }

    if (salary < 0) {
      return res.status(400).json({
        success: false,
        error: 'Salary cannot be negative'
      });
    }

    const employee = await Employee.findByIdAndUpdate(
      id,
      { salary, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    res.json({
      success: true,
      message: 'Salary updated successfully',
      employee: {
        _id: employee._id,
        employeeId: employee.employeeId,
        name: employee.name,
        designation: employee.designation,
        department: employee.department,
        salary: employee.salary
      }
    });
  } catch (error) {
    console.error('Error updating salary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update salary'
    });
  }
};

// Add new employee
export const addEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      employeeId,
      dob,
      gender,
      maritalStatus,
      designation,
      department,
      salary,
      password
    } = req.body;

    // Validate required fields
    if (!name || !email || !employeeId || !department || !designation) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields (name, email, employeeId, department, designation)'
      });
    }

    // Check if employee with this email already exists
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        error: 'Employee with this email already exists'
      });
    }

    // Check if employeeId already exists
    const existingEmployeeId = await Employee.findOne({ employeeId });
    if (existingEmployeeId) {
      return res.status(400).json({
        success: false,
        error: 'Employee ID already exists'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    let userId;

    if (existingUser) {
      userId = existingUser._id;
    } else {
      // Create user account
      const hashedPassword = await bcrypt.hash(password || 'password123', 10);
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: 'employee'
      });
      await newUser.save();
      userId = newUser._id;
    }

    // Create employee
    const newEmployee = new Employee({
      name,
      email,
      employeeId,
      dob: dob || undefined,
      gender: gender || undefined,
      maritalStatus: maritalStatus || undefined,
      designation,
      department,
      salary: salary || 0,
      profileImage: req.file ? req.file.filename : undefined,
      user: userId
    });

    await newEmployee.save();

    res.status(201).json({
      success: true,
      message: 'Employee added successfully',
      employee: newEmployee
    });
  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add employee'
    });
  }
};

// Update employee
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Add profile image if uploaded
    if (req.file) {
      updateData.profileImage = req.file.filename;
    }

    // Update timestamp
    updateData.updatedAt = Date.now();

    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    res.json({
      success: true,
      message: 'Employee updated successfully',
      employee: updatedEmployee
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update employee'
    });
  }
};

// Delete employee
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    const employee = await Employee.findById(id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    // Delete profile image if exists
    if (employee.profileImage) {
      const imagePath = `./public/uploads/${employee.profileImage}`;
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Employee.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete employee'
    });
  }
};