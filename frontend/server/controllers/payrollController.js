// controllers/payrollController.js
import Employee from '../models/Employee.js';
import Payroll from '../models/Payroll.js';
import mongoose from 'mongoose';

// Helper: Calculate days between two dates
const getDaysInPeriod = (start, end) => {
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
};

// Helper: Calculate gross pay based on monthly salary and days worked
const calculateGrossPay = (monthlySalary, periodStart, periodEnd) => {
  const periodDays = getDaysInPeriod(periodStart, periodEnd);
  const daysInMonth = new Date(periodEnd.getFullYear(), periodEnd.getMonth() + 1, 0).getDate();
  
  // Prorated daily rate
  const dailyRate = monthlySalary / daysInMonth;
  return parseFloat((dailyRate * periodDays).toFixed(2));
};

export const generatePayroll = async (req, res) => {
  const { periodStart, periodEnd } = req.body;

  // Validate input
  if (!periodStart || !periodEnd) {
    return res.status(400).json({ message: 'periodStart and periodEnd are required' });
  }

  const startDate = new Date(periodStart);
  const endDate = new Date(periodEnd);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return res.status(400).json({ message: 'Invalid date format' });
  }

  if (startDate > endDate) {
    return res.status(400).json({ message: 'periodStart must be before periodEnd' });
  }

  try {
    // Fetch all active employees (you can add status filter if needed)
    const employees = await Employee.find({}).select('name salary');

    if (employees.length === 0) {
      return res.status(404).json({ message: 'No employees found' });
    }

    const payrollRecords = [];

    for (const emp of employees) {
      if (!emp.salary || emp.salary <= 0) {
        console.warn(`Skipping employee ${emp._id}: no valid salary`);
        continue;
      }

      const grossPay = calculateGrossPay(emp.salary, startDate, endDate);
      const netPay = grossPay; // Add tax/deductions logic later

      payrollRecords.push({
        employee: emp._id,
        periodStart: startDate,
        periodEnd: endDate,
        grossPay,
        netPay,
        status: 'DRAFT'
      });
    }

    if (payrollRecords.length === 0) {
      return res.status(400).json({ message: 'No valid employees with salary to process' });
    }

    // Insert all payroll records (use insertMany for efficiency)
    const createdPayrolls = await Payroll.insertMany(payrollRecords);

    res.status(201).json({
      message: 'Payroll generated successfully',
      count: createdPayrolls.length,
      payroll: createdPayrolls
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Payroll already exists for this period and employee(s)' });
    }
    console.error('Payroll generation error:', error);
    res.status(500).json({ message: 'Failed to generate payroll', error: error.message });
  }
};

// Optional: Get all payroll records
export const getAllPayrolls = async (req, res) => {
  try {
    const payrolls = await Payroll.find()
      .populate('employee', 'name')
      .sort({ createdAt: -1 });
    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch payroll records' });
  }
};

// Get all payroll records for a specific period
export const getPayrollByPeriod = async (req, res) => {
  const { periodStart, periodEnd } = req.query;

  if (!periodStart || !periodEnd) {
    return res.status(400).json({ message: 'periodStart and periodEnd are required as query params' });
  }

  try {
    const start = new Date(periodStart);
    const end = new Date(periodEnd);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const payrolls = await Payroll.find({
      periodStart: { $gte: start, $lt: new Date(start.getTime() + 86400000) }, // match date only
      periodEnd: { $gte: end, $lt: new Date(end.getTime() + 86400000) }
    })
    .populate('employee', 'name')
    .sort({ 'employee.name': 1 });

    res.json(payrolls);
  } catch (error) {
    console.error('Error fetching payroll by period:', error);
    res.status(500).json({ message: 'Failed to load payroll for selected period' });
  }
};

// Get high-level overview of payroll periods (no counts, just unique ranges + label)
export const getPayrollPeriods = async (req, res) => {
  try {
    // Get distinct periodStart and periodEnd combinations
    const periods = await Payroll.aggregate([
      {
        $group: {
          _id: {
            periodStart: '$periodStart',
            periodEnd: '$periodEnd'
          }
        }
      },
      {
        $sort: { '_id.periodStart': -1 } // newest first
      },
      {
        $project: {
          _id: 0,
          periodStart: '$_id.periodStart',
          periodEnd: '$_id.periodEnd'
        }
      }
    ]);

    // Format each period with a clean label like "Jan 1 – Jan 31, 2025"
    const formattedPeriods = periods.map(p => {
      const start = new Date(p.periodStart);
      const end = new Date(p.periodEnd);

      // Format start as "Jan 1"
      const startLabel = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      // Format end as "Jan 31, 2025"
      const endLabel = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      // If same month & year, show "Jan 1 – 31, 2025"
      if (
        start.getMonth() === end.getMonth() &&
        start.getFullYear() === end.getFullYear()
      ) {
        const dayEnd = end.getDate();
        const year = end.getFullYear();
        return {
          ...p,
          label: `${startLabel} – ${dayEnd}, ${year}`
        };
      } else {
        // Different months: "Jan 1 – Feb 28, 2025"
        return {
          ...p,
          label: `${startLabel} – ${endLabel}`
        };
      }
    });

    res.json(formattedPeriods);
  } catch (error) {
    console.error('Error fetching payroll periods:', error);
    res.status(500).json({ message: 'Failed to load payroll periods' });
  }
};

// Get all payslips for a specific employee
export const getEmployeePayslips = async (req, res) => {
  const { employeeId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(employeeId)) {
    return res.status(400).json({ message: 'Invalid employee ID' });
  }

  try {
    const payslips = await Payroll.find({ employee: employeeId })
      .sort({ periodEnd: -1 })
      .select('periodStart periodEnd grossPay totalDeductions netPay status createdAt');

    res.json(payslips);
  } catch (error) {
    console.error('Error fetching payslips:', error);
    res.status(500).json({ message: 'Failed to load payslips' });
  }
};

// Generate/download a single payslip (as JSON or PDF-ready data)
export const getPayslipById = async (req, res) => {
  const { payrollId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(payrollId)) {
    return res.status(400).json({ message: 'Invalid payroll ID' });
  }

  try {
    const payslip = await Payroll.findById(payrollId)
      .populate('employee', 'name employeeId department')
      .lean(); // lean() for plain JS object (better for PDF)

    if (!payslip) {
      return res.status(404).json({ message: 'Payslip not found' });
    }

    res.json(payslip);
  } catch (error) {
    console.error('Error fetching payslip:', error);
    res.status(500).json({ message: 'Failed to load payslip' });
  }
};