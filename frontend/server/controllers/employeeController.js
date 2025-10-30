// controllers/employeeController.js
import Employee from '../models/Employee.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcrypt';
import {
  calculateCompleteSalary,
  formatPhoneNumber,
  validateNationalId,
  validatePhoneNumber,
} from '../utils/salaryCalculations.js';

// =========================
// Multer (single image)
// =========================
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
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only image files are allowed!'));
  },
});

export const uploadSingle = upload.single('image');

// =========================
// Employees
// =========================

// GET /api/employees
export const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, employees });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch employees' });
  }
};

// GET /api/employees/:id
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('user', 'name email');
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch employee' });
  }
};

// =========================
// Salaries (from Employees)
// =========================

// GET /api/employees/salaries
// Returns a FLAT array your UI can consume easily
export const getAllEmployeeSalaries = async (req, res) => {
  try {
    const employees = await Employee.find()
      .select('name employeeId designation department salary createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean();

    const salaries = employees.map((e) => {
      const s = e.salary || {};
      const d = s.deductions || {};
      const totalDeductions =
        Number(d.nhif || 0) +
        Number(d.nssf || 0) +
        Number(d.housingLevy || 0) +
        Number(d.paye || 0);

      return {
        employeeId: e.employeeId,
        employeeName: e.name,
        designation: e.designation,
        department: e.department || 'Unassigned', // department is a STRING in your schema
        gross: Number(s.grossSalary || 0),
        net: Number(s.netSalary || 0),
        deductions: Number(totalDeductions || 0),
        paidAt: e.updatedAt || e.createdAt,
        createdAt: e.createdAt,
      };
    });

    res.json({ success: true, count: salaries.length, salaries });
  } catch (error) {
    console.error('Error fetching employee salaries:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch employee salaries' });
  }
};

// GET /api/employees/:id/salary
export const getEmployeeSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id).select(
      'name employeeId designation department salary createdAt updatedAt'
    );

    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    const s = employee.salary || {};
    res.json({
      success: true,
      salary: {
        _id: employee._id,
        employeeId: employee.employeeId,
        name: employee.name,
        designation: employee.designation,
        department: employee.department,
        salary: s,
      },
    });
  } catch (error) {
    console.error('Error fetching employee salary:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch employee salary' });
  }
};

// PUT /api/employees/:id/salary
export const updateEmployeeSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const { basicSalary, allowances } = req.body;

    if (basicSalary == null || Number(basicSalary) < 0) {
      return res.status(400).json({ success: false, error: 'Please provide valid basic salary' });
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    const salaryBreakdown = calculateCompleteSalary({
      basicSalary: parseFloat(basicSalary),
      allowances: allowances || {},
    });

    // Ensure it matches schema keys
    employee.salary = {
      basicSalary: Number(salaryBreakdown.basicSalary ?? basicSalary) || 0,
      allowances: {
        housing: Number(salaryBreakdown.allowances?.housing ?? 0),
        transport: Number(salaryBreakdown.allowances?.transport ?? 0),
        medical: Number(salaryBreakdown.allowances?.medical ?? 0),
        other: Number(salaryBreakdown.allowances?.other ?? 0),
      },
      deductions: {
        nhif: Number(salaryBreakdown.deductions?.nhif ?? 0),
        nssf: Number(salaryBreakdown.deductions?.nssf ?? 0),
        housingLevy: Number(salaryBreakdown.deductions?.housingLevy ?? 0),
        paye: Number(salaryBreakdown.deductions?.paye ?? 0),
      },
      grossSalary: Number(salaryBreakdown.grossSalary ?? 0),
      netSalary: Number(salaryBreakdown.netSalary ?? 0),
    };

    employee.updatedAt = Date.now();
    await employee.save();

    res.json({
      success: true,
      message: 'Salary updated successfully with automatic deductions',
      salary: employee.salary,
      breakdown: employee.salary,
    });
  } catch (error) {
    console.error('Error updating salary:', error);
    res.status(500).json({ success: false, error: 'Failed to update salary' });
  }
};

// POST /api/employees/add
export const addEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      employeeId,
      dob,
      gender,
      maritalStatus,
      phone,
      nationalId,
      emergencyContactName,
      emergencyContactRelationship,
      emergencyContactPhone,
      emergencyContactEmail,
      designation,
      department, // this is the Department _id from the client
      basicSalary,
      housingAllowance,
      transportAllowance,
      medicalAllowance,
      otherAllowance,
      kraPIN,
      nssfNumber,
      nhifNumber,
      password,
      role,
    } = req.body;

    // Required fields
    if (!name || !email || !employeeId || !phone || !nationalId || !department || !designation) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields' });
    }

    if (!validateNationalId(nationalId)) {
      return res.status(400).json({ success: false, error: 'Invalid National ID format. Should be 8 digits.' });
    }

    if (!validatePhoneNumber(phone)) {
      return res.status(400).json({ success: false, error: 'Invalid phone number format' });
    }

    if (emergencyContactPhone && !validatePhoneNumber(emergencyContactPhone)) {
      return res.status(400).json({ success: false, error: 'Invalid emergency contact phone number format' });
    }

    // Unique checks
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ success: false, error: 'Employee with this email already exists' });
    }

    const existingEmployeeId = await Employee.findOne({ employeeId });
    if (existingEmployeeId) {
      return res.status(400).json({ success: false, error: 'Employee ID already exists' });
    }

    const existingNationalId = await Employee.findOne({ nationalId });
    if (existingNationalId) {
      return res.status(400).json({ success: false, error: 'National ID already registered' });
    }

    // User
    const existingUser = await User.findOne({ email });
    let userId;
    if (existingUser) {
      userId = existingUser._id;
    } else {
      const hashedPassword = await bcrypt.hash(password || 'password123', 10);
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: role || 'employee',
      });
      await newUser.save();
      userId = newUser._id;
    }

    // Department: store STRING name (as per your schema choice)
    const departmentData = await Department.findById(department).lean();
    if (!departmentData) {
      return res.status(400).json({ success: false, error: 'Invalid department selected' });
    }

    // Salary calc → map to schema keys
    const salaryData = calculateCompleteSalary({
      basicSalary: parseFloat(basicSalary) || 0,
      allowances: {
        housing: parseFloat(housingAllowance) || 0,
        transport: parseFloat(transportAllowance) || 0,
        medical: parseFloat(medicalAllowance) || 0,
        other: parseFloat(otherAllowance) || 0,
      },
    });

    const newEmployee = new Employee({
      name,
      email,
      employeeId,
      dob: dob || undefined,
      gender: gender || undefined,
      maritalStatus: maritalStatus || undefined,
      phone: formatPhoneNumber(phone),
      nationalId,
      emergencyContact: {
        name: emergencyContactName || '',
        relationship: emergencyContactRelationship || '',
        phone: emergencyContactPhone ? formatPhoneNumber(emergencyContactPhone) : '',
        email: emergencyContactEmail || '',
      },
      designation,
      department: departmentData.dep_name, // keep as string consistently
      salary: {
        basicSalary: Number(salaryData.basicSalary ?? 0),
        allowances: {
          housing: Number(salaryData.allowances?.housing ?? 0),
          transport: Number(salaryData.allowances?.transport ?? 0),
          medical: Number(salaryData.allowances?.medical ?? 0),
          other: Number(salaryData.allowances?.other ?? 0),
        },
        deductions: {
          nhif: Number(salaryData.deductions?.nhif ?? 0),
          nssf: Number(salaryData.deductions?.nssf ?? 0),
          housingLevy: Number(salaryData.deductions?.housingLevy ?? 0),
          paye: Number(salaryData.deductions?.paye ?? 0),
        },
        grossSalary: Number(salaryData.grossSalary ?? 0),
        netSalary: Number(salaryData.netSalary ?? 0),
      },
      kraPIN,
      nssfNumber,
      nhifNumber,
      profileImage: req.file ? req.file.filename : undefined,
      user: userId,
    });

    await newEmployee.save();

    res.status(201).json({
      success: true,
      message: 'Employee added successfully with automatic salary calculations',
      employee: newEmployee,
      salaryBreakdown: newEmployee.salary,
    });
  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to add employee' });
  }
};

// GET /api/employees/stats/by-department
export const getEmployeesByDepartmentStats = async (req, res) => {
  try {
    const { q } = req.query;
    const match = {};
    if (q && q.trim()) match.department = { $regex: q.trim(), $options: 'i' };

    const stats = await Employee.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $ifNull: ['$department', 'Unassigned'] },
          count: { $sum: 1 },
          // You can aggregate salary here if needed, using the schema keys
          // totalGross: { $sum: { $ifNull: ['$salary.grossSalary', 0] } },
          // totalNet: { $sum: { $ifNull: ['$salary.netSalary', 0] } },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const result = stats.map((s) => ({
      department: s._id,
      count: s.count,
      // totalGross: s.totalGross,
      // totalNet: s.totalNet,
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('getEmployeesByDepartmentStats error:', error);
    res.status(500).json({ success: false, error: 'Failed to load department stats' });
  }
};

// GET /api/employees/by-department/:depName
export const getEmployeesByDepartment = async (req, res) => {
  try {
    const { depName } = req.params;
    if (!depName) {
      return res.status(400).json({ success: false, error: 'Department name is required' });
    }

    const employees = await Employee.find({ department: depName })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, department: depName, count: employees.length, employees });
  } catch (error) {
    console.error('getEmployeesByDepartment error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch employees by department' });
  }
};

// PUT /api/employees/:id
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.phone && !validatePhoneNumber(updateData.phone)) {
      return res.status(400).json({ success: false, error: 'Invalid phone number format' });
    }
    if (updateData.nationalId && !validateNationalId(updateData.nationalId)) {
      return res.status(400).json({ success: false, error: 'Invalid National ID format' });
    }
    if (updateData.phone) updateData.phone = formatPhoneNumber(updateData.phone);
    if (req.file) updateData.profileImage = req.file.filename;

    updateData.updatedAt = Date.now();

    const updatedEmployee = await Employee.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedEmployee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    res.json({ success: true, message: 'Employee updated successfully', employee: updatedEmployee });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ success: false, error: 'Failed to update employee' });
  }
};

// DELETE /api/employees/:id
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    if (employee.profileImage) {
      const imagePath = `./public/uploads/${employee.profileImage}`;
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Employee.findByIdAndDelete(id);
    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ success: false, error: 'Failed to delete employee' });
  }
};

export default {};
