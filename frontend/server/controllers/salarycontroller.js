// controllers/salaryController.js
import Salary from '../models/Salary.js';
import Employee from '../models/Employee.js';
import Department from '../models/Department.js';

const salaryController = {
  // Get all salaries
  getAllSalaries: async (req, res) => {
    try {
      const salaries = await Salary.find()
        .populate('employeeId', 'firstName lastName employeeId position')
        .populate('departmentId', 'dep_name')
        .sort({ payDate: -1 });
      
      res.status(200).json({
        success: true,
        salaries
      });
    } catch (error) {
      console.error('Error fetching salaries:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch salaries'
      });
    }
  },

  // Get single salary by ID
  getSalaryById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const salary = await Salary.findById(id)
        .populate('employeeId', 'firstName lastName employeeId position')
        .populate('departmentId', 'dep_name');
      
      if (!salary) {
        return res.status(404).json({
          success: false,
          error: 'Salary record not found'
        });
      }

      res.status(200).json({
        success: true,
        salary
      });
    } catch (error) {
      console.error('Error fetching salary:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch salary'
      });
    }
  },

  // Add new salary
  addSalary: async (req, res) => {
    try {
      const {
        employeeId,
        departmentId,
        basicSalary,
        allowances,
        deductions,
        netSalary,
        payDate
      } = req.body;

      // Validation
      if (!employeeId || !departmentId || !basicSalary || !payDate) {
        return res.status(400).json({
          success: false,
          error: 'Please provide all required fields: employeeId, departmentId, basicSalary, and payDate'
        });
      }

      if (basicSalary <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Basic salary must be greater than 0'
        });
      }

      // Check if employee exists
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return res.status(400).json({
          success: false,
          error: 'Employee not found'
        });
      }

      // Check if department exists
      const department = await Department.findById(departmentId);
      if (!department) {
        return res.status(400).json({
          success: false,
          error: 'Department not found'
        });
      }

      // Create new salary record
      const newSalary = new Salary({
        employeeId,
        departmentId,
        basicSalary: parseFloat(basicSalary),
        allowances: parseFloat(allowances) || 0,
        deductions: parseFloat(deductions) || 0,
        netSalary: parseFloat(netSalary),
        payDate: new Date(payDate),
        createdBy: req.user.id // assuming you have user info in req.user from auth middleware
      });

      const savedSalary = await newSalary.save();

      // Populate the response
      await savedSalary.populate('employeeId', 'firstName lastName employeeId position');
      await savedSalary.populate('departmentId', 'dep_name');

      res.status(201).json({
        success: true,
        message: 'Salary added successfully',
        salary: savedSalary
      });

    } catch (error) {
      console.error('Error adding salary:', error);
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: validationErrors
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to add salary'
      });
    }
  },

  // Update salary
  updateSalary: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        employeeId,
        departmentId,
        basicSalary,
        allowances,
        deductions,
        netSalary,
        payDate
      } = req.body;

      // Check if salary record exists
      const existingSalary = await Salary.findById(id);
      if (!existingSalary) {
        return res.status(404).json({
          success: false,
          error: 'Salary record not found'
        });
      }

      // Update salary record
      const updatedSalary = await Salary.findByIdAndUpdate(
        id,
        {
          employeeId,
          departmentId,
          basicSalary: parseFloat(basicSalary),
          allowances: parseFloat(allowances) || 0,
          deductions: parseFloat(deductions) || 0,
          netSalary: parseFloat(netSalary),
          payDate: new Date(payDate),
          updatedBy: req.user.id,
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      ).populate('employeeId', 'firstName lastName employeeId position')
       .populate('departmentId', 'dep_name');

      res.status(200).json({
        success: true,
        message: 'Salary updated successfully',
        salary: updatedSalary
      });

    } catch (error) {
      console.error('Error updating salary:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update salary'
      });
    }
  },

  // Delete salary
  deleteSalary: async (req, res) => {
    try {
      const { id } = req.params;
      
      const salary = await Salary.findByIdAndDelete(id);
      
      if (!salary) {
        return res.status(404).json({
          success: false,
          error: 'Salary record not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Salary deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting salary:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete salary'
      });
    }
  }
};

export default salaryController;