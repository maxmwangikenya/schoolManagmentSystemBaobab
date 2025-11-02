// controllers/employeeController.js
import Employee from '../models/Employee.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  calculateCompleteSalary,
  formatPhoneNumber,
  validateNationalId,
  validatePhoneNumber,
} from '../utils/salaryCalculations.js';

// Multer (single image)
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
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only image files are allowed!'));
  },
});

export const uploadSingle = upload.single('image');

// GET /api/employees
export const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, employees });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch employees' });
  }
};

// GET /api/employees/:id
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('user', 'name email');
    if (!employee) return res.status(404).json({ success: false, error: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch employee' });
  }
};

// GET /api/employees/salaries
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
        Number(d.nhif || 0) + Number(d.nssf || 0) + Number(d.housingLevy || 0) + Number(d.paye || 0);

      return {
        employeeId: e.employeeId,
        employeeName: e.name,
        designation: e.designation,
        department: e.department || 'Unassigned',
        gross: Number(s.grossSalary || 0),
        net: Number(s.netSalary || 0),
        deductions: Number(totalDeductions || 0),
        paidAt: e.updatedAt || e.createdAt,
        createdAt: e.createdAt,
      };
    });

    res.json({ success: true, count: salaries.length, salaries });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch employee salaries' });
  }
};

// GET /api/employees/:id/salary
export const getEmployeeSalary = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select(
      'name employeeId designation department salary createdAt updatedAt'
    );
    if (!employee) return res.status(404).json({ success: false, error: 'Employee not found' });

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
    if (!employee) return res.status(404).json({ success: false, error: 'Employee not found' });

    const salaryBreakdown = calculateCompleteSalary({
      basicSalary: parseFloat(basicSalary),
      allowances: allowances || {},
    });

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
      department, // Department _id
      basicSalary,
      housingAllowance,
      transportAllowance,
      medicalAllowance,
      otherAllowance,
      kraPIN,
      nssfNumber,
      nhifNumber,
      password, // optional plain password from admin
      role,     // optional; defaults to 'employee'
    } = req.body;

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

    const normalizedEmail = email.toLowerCase().trim();

    const existingEmployee = await Employee.findOne({ email: normalizedEmail });
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

    const dep = await Department.findById(department).lean();
    if (!dep) {
      return res.status(400).json({ success: false, error: 'Invalid department selected' });
    }

    const salaryData = calculateCompleteSalary({
      basicSalary: parseFloat(basicSalary) || 0,
      allowances: {
        housing: parseFloat(housingAllowance) || 0,
        transport: parseFloat(transportAllowance) || 0,
        medical: parseFloat(medicalAllowance) || 0,
        other: parseFloat(otherAllowance) || 0,
      },
    });

    // Ensure a User exists (no controller-side hashing)
    let user = await User.findOne({ email: normalizedEmail }).select('_id name email role');

    let tempPassword = null;
    if (!user) {
      const initialPassword =
        password && password.length >= 6 ? password : 'Temp@' + Math.random().toString(36).slice(2, 8);
      tempPassword = password && password.length >= 6 ? null : initialPassword;

      user = new User({
        name: name.trim(),
        email: normalizedEmail,
        password: initialPassword, // plain; model pre-save hashes once
        role: (role || 'employee').toLowerCase(),
      });
      await user.save();
    } else {
      user.name = name.trim();
      const desiredRole = (role || user.role || 'employee').toLowerCase();
      if (user.role !== 'admin') user.role = desiredRole;
      await user.save();
    }

    const newEmployee = new Employee({
      name,
      email: normalizedEmail,
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
      department: dep.dep_name, // or dep._id if your schema stores ObjectId
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
      user: user._id, // hard-link to User
    });

    await newEmployee.save();

    return res.status(201).json({
      success: true,
      message: 'Employee and User linked successfully. Employee can log in now.',
      email: normalizedEmail,
      tempPassword: tempPassword || undefined,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to add employee' });
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
      { $group: { _id: { $ifNull: ['$department', 'Unassigned'] }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const result = stats.map((s) => ({ department: s._id, count: s.count }));
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to load department stats' });
  }
};

// GET /api/employees/by-department/:depName
export const getEmployeesByDepartment = async (req, res) => {
  try {
    const { depName } = req.params;
    if (!depName) return res.status(400).json({ success: false, error: 'Department name is required' });

    const employees = await Employee.find({ department: depName })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, department: depName, count: employees.length, employees });
  } catch (error) {
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
    res.status(500).json({ success: false, error: 'Failed to update employee' });
  }
};

// DELETE /api/employees/:id
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) return res.status(404).json({ success: false, error: 'Employee not found' });

    if (employee.profileImage) {
      const imagePath = `./public/uploads/${employee.profileImage}`;
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await Employee.findByIdAndDelete(id);
    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete employee' });
  }
};

export default {};
