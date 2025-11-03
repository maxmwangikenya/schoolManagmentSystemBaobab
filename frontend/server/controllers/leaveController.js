// controllers/leaveController.js
import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';
import Department from '../models/Department.js';

/**
 * Normalize an allocation object so we always have the 3 keys.
 * Anything missing becomes 0.
 */
const normalizeAllocation = (alloc = {}) => ({
  casual: Number(alloc.casual || 0),
  sick: Number(alloc.sick || 0),
  annual: Number(alloc.annual || 0),
});

/**
 * Get base leave allocation for an employee, without hard-coding numbers.
 * Priority:
 * 1. employee.leaveAllocation / employee.leaveEntitlement (whichever you add to schema)
 * 2. department.leaveAllocation (if your Department schema has it)
 * 3. fallback: all zeros
 */
const getBaseAllocationForEmployee = async (employee) => {
  // 1) check employee-level
  if (employee?.leaveAllocation) {
    return normalizeAllocation(employee.leaveAllocation);
  }
  if (employee?.leaveEntitlement) {
    return normalizeAllocation(employee.leaveEntitlement);
  }

  // 2) check department-level (you stored department as a name/string in employee)
  if (employee?.department) {
    const dep = await Department.findOne({ dep_name: employee.department }).lean();
    if (dep?.leaveAllocation) {
      return normalizeAllocation(dep.leaveAllocation);
    }
  }

  // 3) fallback – no hard-coded 12/10 here
  return normalizeAllocation();
};

/**
 * Count days inclusive
 */
const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end - start;
  if (Number.isNaN(diff)) return 0;
  // +1 to make it inclusive
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
};

/**
 * Core balance calculator
 * - pulls employee
 * - gets that employee's base allocation (from employee or department)
 * - subtracts approved + pending
 */
const calculateLeaveBalance = async (employeeId) => {
  // we need the employee to know which allocation to use
  const employee = await Employee.findById(employeeId).lean();
  if (!employee) {
    // if employee doesn't exist, return empty structure
    return {
      totalLeaves: normalizeAllocation(),
      usedLeaves: normalizeAllocation(),
      pendingLeaves: normalizeAllocation(),
      remainingLeaves: normalizeAllocation(),
    };
  }

  // get the base allocation (no magic numbers)
  const BASE = await getBaseAllocationForEmployee(employee); // {casual,sick,annual}

  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);
  const endOfYear = new Date(`${currentYear}-12-31T23:59:59.999Z`);

  // approved this year
  const approvedLeaves = await Leave.find({
    employeeId,
    status: 'approved',
    startDate: { $gte: startOfYear, $lte: endOfYear },
  }).lean();

  // pending this year
  const pendingLeaves = await Leave.find({
    employeeId,
    status: 'pending',
    startDate: { $gte: startOfYear, $lte: endOfYear },
  }).lean();

  // build used/pending by type
  const usedLeaves = normalizeAllocation();
  approvedLeaves.forEach((l) => {
    const key = l.leaveType;
    if (key && usedLeaves[key] !== undefined) {
      usedLeaves[key] += Number(l.days || 0);
    }
  });

  const pendingByType = normalizeAllocation();
  pendingLeaves.forEach((l) => {
    const key = l.leaveType;
    if (key && pendingByType[key] !== undefined) {
      pendingByType[key] += Number(l.days || 0);
    }
  });

  // remaining = base - used - pending (never below 0)
  const remainingLeaves = {
    casual: Math.max(0, BASE.casual - usedLeaves.casual - pendingByType.casual),
    sick: Math.max(0, BASE.sick - usedLeaves.sick - pendingByType.sick),
    annual: Math.max(0, BASE.annual - usedLeaves.annual - pendingByType.annual),
  };

  return {
    totalLeaves: BASE,
    usedLeaves,
    pendingLeaves: pendingByType,
    remainingLeaves,
  };
};

// ======================
// EMPLOYEE ENDPOINTS
// ======================

// POST /api/leaves
export const applyLeave = async (req, res) => {
  try {
    const { employeeId, leaveType, startDate, endDate, reason, days } = req.body;

    // basic checks
    if (!employeeId || !leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    // find employee
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    // how many days is this leave
    const leaveDays = days || calculateDays(startDate, endDate);
    if (leaveDays <= 0) {
      return res.status(400).json({ success: false, error: 'End date must be on or after start date' });
    }

    // get current balance (dynamic)
    const leaveBalance = await calculateLeaveBalance(employeeId);
    const availableForType = leaveBalance.remainingLeaves[leaveType] ?? 0;

    // no negative balances
    if (leaveDays > availableForType) {
      return res.status(400).json({
        success: false,
        error: `Insufficient ${leaveType} leave balance. Available: ${availableForType} day(s), requested: ${leaveDays} day(s)`,
      });
    }

    // check for overlaps (pending or approved)
    const overlapping = await Leave.findOne({
      employeeId,
      status: { $in: ['pending', 'approved'] },
      startDate: { $lte: new Date(endDate) },
      endDate: { $gte: new Date(startDate) },
    }).lean();

    if (overlapping) {
      return res.status(400).json({
        success: false,
        error: 'You already have a leave application overlapping these dates',
      });
    }

    // create
    const leave = new Leave({
      employeeId,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      days: leaveDays,
      status: 'pending',
      appliedDate: new Date(),
    });

    await leave.save();

    return res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      leave,
    });
  } catch (error) {
    console.error('Error applying leave:', error);
    // surface mongoose validation error (like reason < 10 chars)
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to submit leave application',
    });
  }
};

// GET /api/leaves/balance/:employeeId
export const getLeaveBalance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await Employee.findById(employeeId).lean();
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    const balance = await calculateLeaveBalance(employeeId);

    return res.status(200).json({
      success: true,
      data: balance,
    });
  } catch (error) {
    console.error('Error fetching leave balance:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch leave balance' });
  }
};

// GET /api/leaves/employee/:employeeId
export const getEmployeeLeaves = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { status, leaveType } = req.query;

    const query = { employeeId };
    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;

    const leaves = await Leave.find(query)
      .populate('employeeId', 'name designation department profileImage')
      .sort({ appliedDate: -1 });

    return res.status(200).json({
      success: true,
      leaves,
    });
  } catch (error) {
    console.error('Error fetching employee leaves:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch leave history' });
  }
};

// DELETE /api/leaves/:id (cancel pending)
export const cancelLeave = async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({ success: false, error: 'Leave application not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Only pending leave applications can be cancelled' });
    }

    await Leave.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Leave application cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling leave:', error);
    return res.status(500).json({ success: false, error: 'Failed to cancel leave application' });
  }
};

// ======================
// ADMIN ENDPOINTS
// ======================

// GET /api/leaves  (admin)
export const getAllLeaves = async (req, res) => {
  try {
    const { status, leaveType } = req.query;
    const query = {};
    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;

    const leaves = await Leave.find(query)
      .populate('employeeId', 'name designation department profileImage')
      .populate('reviewedBy', 'name')
      .sort({ appliedDate: -1 });

    // attach remaining balance snapshot if needed
    const withBalance = await Promise.all(
      leaves.map(async (leave) => {
        const obj = leave.toObject();
        if (leave.employeeId?._id) {
          const bal = await calculateLeaveBalance(leave.employeeId._id);
          obj.currentBalance = bal.remainingLeaves;
        }
        return obj;
      })
    );

    return res.status(200).json({
      success: true,
      leaves: withBalance,
    });
  } catch (error) {
    console.error('Error fetching all leaves:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch leave applications' });
  }
};

// GET /api/leaves/stats (admin)
export const getLeaveStats = async (req, res) => {
  try {
    const totalApplications = await Leave.countDocuments();
    const pendingCount = await Leave.countDocuments({ status: 'pending' });
    const approvedCount = await Leave.countDocuments({ status: 'approved' });
    const rejectedCount = await Leave.countDocuments({ status: 'rejected' });

    const currentYear = new Date().getFullYear();
    const monthlyStats = await Leave.aggregate([
      {
        $match: {
          appliedDate: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$appliedDate' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalApplications,
        pendingCount,
        approvedCount,
        rejectedCount,
        monthlyStats,
      },
    });
  } catch (error) {
    console.error('Error fetching leave stats:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch statistics' });
  }
};

// PATCH /api/leaves/review/:id  (admin approve / reject)
export const reviewLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewComments } = req.body;
    const adminId = req.user?.id; // from auth middleware

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be "approved" or "rejected"' });
    }

    const leave = await Leave.findById(id).populate('employeeId');
    if (!leave) {
      return res.status(404).json({ success: false, error: 'Leave application not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'This leave application has already been reviewed' });
    }

    // if approving, re-check balance with dynamic policy
    if (status === 'approved') {
      const bal = await calculateLeaveBalance(leave.employeeId._id);
      const available = bal.remainingLeaves[leave.leaveType] ?? 0;
      if (leave.days > available) {
        return res.status(400).json({
          success: false,
          error: `Cannot approve. Employee has insufficient ${leave.leaveType} balance. Available: ${available}, requested: ${leave.days}`,
        });
      }
    }

    leave.status = status;
    leave.reviewComments = reviewComments || '';
    leave.reviewedBy = adminId || null;
    leave.reviewedDate = new Date();

    await leave.save();

    return res.status(200).json({
      success: true,
      message: `Leave ${status} successfully`,
      leave,
    });
  } catch (error) {
    console.error('Error reviewing leave:', error);
    return res.status(500).json({ success: false, error: 'Failed to review leave application' });
  }
};

// GET /api/leaves/:id
export const getLeaveById = async (req, res) => {
  try {
    const { id } = req.params;
    const leave = await Leave.findById(id)
      .populate('employeeId', 'name designation department profileImage')
      .populate('reviewedBy', 'name');

    if (!leave) {
      return res.status(404).json({ success: false, error: 'Leave application not found' });
    }

    return res.status(200).json({
      success: true,
      leave,
    });
  } catch (error) {
    console.error('Error fetching leave:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch leave details' });
  }
};
