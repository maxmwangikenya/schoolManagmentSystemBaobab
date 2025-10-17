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

  // Get salary history for a specific employee
  getSalaryHistory: async (req, res) => {
    try {
      const { employeeId } = req.params;
      
      // Validate employee exists
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          error: 'Employee not found'
        });
      }

      // Get all salary records for the employee, sorted by payDate (newest first)
      const salaryHistory = await Salary.find({ employeeId })
        .populate('employeeId', 'firstName lastName employeeId position')
        .populate('departmentId', 'dep_name')
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email')
        .sort({ payDate: -1, createdAt: -1 });
      
      // Calculate additional statistics
      const stats = {
        totalRecords: salaryHistory.length,
        averageNetSalary: 0,
        highestSalary: 0,
        lowestSalary: 0,
        totalEarnings: 0
      };

      if (salaryHistory.length > 0) {
        const netSalaries = salaryHistory.map(record => record.netSalary);
        stats.totalEarnings = netSalaries.reduce((sum, salary) => sum + salary, 0);
        stats.averageNetSalary = stats.totalEarnings / salaryHistory.length;
        stats.highestSalary = Math.max(...netSalaries);
        stats.lowestSalary = Math.min(...netSalaries);
      }

      res.status(200).json({
        success: true,
        employee: {
          id: employee._id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          employeeId: employee.employeeId,
          position: employee.position
        },
        salaryHistory,
        statistics: stats
      });

    } catch (error) {
      console.error('Error fetching salary history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch salary history'
      });
    }
  },

  // Get salary summary for an employee (latest salary info)
  getEmployeeSalarySummary: async (req, res) => {
    try {
      const { employeeId } = req.params;
      
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          error: 'Employee not found'
        });
      }

      // Get the latest salary record
      const latestSalary = await Salary.findOne({ employeeId })
        .populate('employeeId', 'firstName lastName employeeId position')
        .populate('departmentId', 'dep_name')
        .sort({ payDate: -1, createdAt: -1 });

      // Get total count of salary records
      const totalRecords = await Salary.countDocuments({ employeeId });

      // Get salary trend (compare last two records if available)
      const lastTwoRecords = await Salary.find({ employeeId })
        .sort({ payDate: -1, createdAt: -1 })
        .limit(2);

      let salaryTrend = 'stable';
      let trendAmount = 0;

      if (lastTwoRecords.length === 2) {
        const difference = lastTwoRecords[0].netSalary - lastTwoRecords[1].netSalary;
        if (difference > 0) {
          salaryTrend = 'increase';
          trendAmount = difference;
        } else if (difference < 0) {
          salaryTrend = 'decrease';
          trendAmount = Math.abs(difference);
        }
      }

      res.status(200).json({
        success: true,
        employee: {
          id: employee._id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          employeeId: employee.employeeId,
          position: employee.position
        },
        latestSalary,
        totalRecords,
        trend: {
          direction: salaryTrend,
          amount: trendAmount
        }
      });

    } catch (error) {
      console.error('Error fetching employee salary summary:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch salary summary'
      });
    }
  },

  // Get single salary by ID
  getSalaryById: async (req, res) => {
    try {
      const { id } = req.params;
      //check ifuser is admin || user Id or passed id is same.
      
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

      // Check for duplicate salary record for the same employee and pay date
      const existingRecord = await Salary.findOne({
        employeeId,
        payDate: {
          $gte: new Date(payDate).setHours(0, 0, 0, 0),
          $lt: new Date(payDate).setHours(23, 59, 59, 999)
        }
      });

      if (existingRecord) {
        return res.status(400).json({
          success: false,
          error: 'A salary record already exists for this employee on this date'
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
  },

  // Get department salary statistics
  getDepartmentSalaryStats: async (req, res) => {
    try {
      const { departmentId } = req.params;

      const department = await Department.findById(departmentId);
      if (!department) {
        return res.status(404).json({
          success: false,
          error: 'Department not found'
        });
      }

      // Get all current salaries for the department (latest for each employee)
      const departmentSalaries = await Salary.aggregate([
        {
          $match: { departmentId: departmentId }
        },
        {
          $sort: { employeeId: 1, payDate: -1 }
        },
        {
          $group: {
            _id: '$employeeId',
            latestSalary: { $first: '$$ROOT' }
          }
        },
        {
          $replaceRoot: { newRoot: '$latestSalary' }
        },
        {
          $lookup: {
            from: 'employees',
            localField: 'employeeId',
            foreignField: '_id',
            as: 'employee'
          }
        }
      ]);

      const stats = {
        totalEmployees: departmentSalaries.length,
        totalSalaryBudget: 0,
        averageSalary: 0,
        highestSalary: 0,
        lowestSalary: 0,
        departmentName: department.dep_name
      };

      if (departmentSalaries.length > 0) {
        const netSalaries = departmentSalaries.map(record => record.netSalary);
        stats.totalSalaryBudget = netSalaries.reduce((sum, salary) => sum + salary, 0);
        stats.averageSalary = stats.totalSalaryBudget / departmentSalaries.length;
        stats.highestSalary = Math.max(...netSalaries);
        stats.lowestSalary = Math.min(...netSalaries);
      }

      res.status(200).json({
        success: true,
        department: {
          id: department._id,
          name: department.dep_name
        },
        statistics: stats,
        salaries: departmentSalaries
      });

    } catch (error) {
      console.error('Error fetching department salary stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch department salary statistics'
      });
    }
  }
};

export default salaryController;