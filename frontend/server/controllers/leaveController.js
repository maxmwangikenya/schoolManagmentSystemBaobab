// controllers/leaveController.js
import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';

// Constants for leave allocation
const LEAVE_ALLOCATION = {
  casual: 12,
  sick: 10
};

// ======================
// EMPLOYEE FUNCTIONS
// ======================

// Apply for Leave
export const applyLeave = async (req, res) => {
  try {
    const { employeeId, leaveType, startDate, endDate, reason, days } = req.body;

    // Validation
    if (!employeeId || !leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    // Verify employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    // Calculate leave balance
    const leaveBalance = await calculateLeaveBalance(employeeId);

    // Check if employee has sufficient balance
    const availableBalance = leaveBalance.remainingLeaves[leaveType];
    if (days > availableBalance) {
      return res.status(400).json({
        success: false,
        error: `Insufficient ${leaveType} leave balance. Available: ${availableBalance} days, Requested: ${days} days`
      });
    }

    // Check for overlapping leaves
    const overlappingLeave = await Leave.findOne({
      employeeId,
      status: { $in: ['pending', 'approved'] },
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) }
        }
      ]
    });

    if (overlappingLeave) {
      return res.status(400).json({
        success: false,
        error: 'You already have a leave application for overlapping dates'
      });
    }

    // Create new leave application
    const leave = new Leave({
      employeeId,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      days: days || calculateDays(startDate, endDate),
      status: 'pending',
      appliedDate: new Date()
    });

    await leave.save();

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      leave
    });
  } catch (error) {
    console.error('Error applying leave:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit leave application'
    });
  }
};

// Get Leave Balance for an Employee
export const getLeaveBalance = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    const leaveBalance = await calculateLeaveBalance(employeeId);

    res.status(200).json({
      success: true,
      data: leaveBalance
    });
  } catch (error) {
    console.error('Error fetching leave balance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leave balance'
    });
  }
};

// Get All Leaves for a Specific Employee
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

    res.status(200).json({
      success: true,
      leaves
    });
  } catch (error) {
    console.error('Error fetching employee leaves:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leave history'
    });
  }
};

// Cancel a Pending Leave
export const cancelLeave = async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({
        success: false,
        error: 'Leave application not found'
      });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Only pending leave applications can be cancelled'
      });
    }

    await Leave.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Leave application cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling leave:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel leave application'
    });
  }
};



// Get All Leave Applications (Admin)
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

    // Calculate remaining balance for each leave
    const leavesWithBalance = await Promise.all(
      leaves.map(async (leave) => {
        const leaveObj = leave.toObject();
        if (leave.employeeId) {
          const balance = await calculateLeaveBalance(leave.employeeId._id);
          
          // Calculate balance after this leave is approved
          let remainingBalance = { ...balance.remainingLeaves };
          if (leave.status === 'pending') {
            remainingBalance[leave.leaveType] = Math.max(0, remainingBalance[leave.leaveType] - leave.days);
          }
          
          leaveObj.remainingBalance = remainingBalance;
        }
        return leaveObj;
      })
    );

    res.status(200).json({
      success: true,
      leaves: leavesWithBalance
    });
  } catch (error) {
    console.error('Error fetching all leaves:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leave applications'
    });
  }
};

// Get Leave Statistics (Admin Dashboard)
export const getLeaveStats = async (req, res) => {
  try {
    const totalApplications = await Leave.countDocuments();
    const pendingCount = await Leave.countDocuments({ status: 'pending' });
    const approvedCount = await Leave.countDocuments({ status: 'approved' });
    const rejectedCount = await Leave.countDocuments({ status: 'rejected' });

    // Get monthly statistics (current year)
    const currentYear = new Date().getFullYear();
    const monthlyStats = await Leave.aggregate([
      {
        $match: {
          appliedDate: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$appliedDate' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalApplications,
        pendingCount,
        approvedCount,
        rejectedCount,
        monthlyStats
      }
    });
  } catch (error) {
    console.error('Error fetching leave stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
};

// Review Leave - Approve or Reject (Admin)
export const reviewLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewComments } = req.body;
    const adminId = req.user.id; // From auth middleware

    // Validation
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be "approved" or "rejected"'
      });
    }

    const leave = await Leave.findById(id).populate('employeeId');
    if (!leave) {
      return res.status(404).json({
        success: false,
        error: 'Leave application not found'
      });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'This leave application has already been reviewed'
      });
    }

    // If approving, check balance again
    if (status === 'approved') {
      const leaveBalance = await calculateLeaveBalance(leave.employeeId._id);
      const availableBalance = leaveBalance.remainingLeaves[leave.leaveType];
      
      if (leave.days > availableBalance) {
        return res.status(400).json({
          success: false,
          error: `Cannot approve. Employee has insufficient ${leave.leaveType} leave balance. Available: ${availableBalance} days`
        });
      }
    }

    // Update leave status
    leave.status = status;
    leave.reviewComments = reviewComments || '';
    leave.reviewedBy = adminId;
    leave.reviewedDate = new Date();

    await leave.save();

    res.status(200).json({
      success: true,
      message: `Leave ${status} successfully`,
      leave
    });
  } catch (error) {
    console.error('Error reviewing leave:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to review leave application'
    });
  }
};

// Get Single Leave Details
export const getLeaveById = async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findById(id)
      .populate('employeeId', 'name designation department profileImage')
      .populate('reviewedBy', 'name');

    if (!leave) {
      return res.status(404).json({
        success: false,
        error: 'Leave application not found'
      });
    }

    res.status(200).json({
      success: true,
      leave
    });
  } catch (error) {
    console.error('Error fetching leave:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leave details'
    });
  }
};

// ======================
// HELPER FUNCTIONS
// ======================

// Calculate Leave Balance
const calculateLeaveBalance = async (employeeId) => {
  // Get all approved leaves for the employee (current year)
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(`${currentYear}-01-01`);
  const endOfYear = new Date(`${currentYear}-12-31`);

  const approvedLeaves = await Leave.find({
    employeeId,
    status: 'approved',
    startDate: { $gte: startOfYear, $lte: endOfYear }
  });

  const pendingLeaves = await Leave.find({
    employeeId,
    status: 'pending',
    startDate: { $gte: startOfYear, $lte: endOfYear }
  });

  // Calculate used days by type
  const usedLeaves = {
    casual: 0,
    sick: 0
  };

  const pendingLeavesCount = {
    casual: 0,
    sick: 0
  };

  approvedLeaves.forEach(leave => {
    usedLeaves[leave.leaveType] += leave.days;
  });

  pendingLeaves.forEach(leave => {
    pendingLeavesCount[leave.leaveType] += leave.days;
  });

  // Calculate remaining leaves
  const remainingLeaves = {
    casual: Math.max(0, LEAVE_ALLOCATION.casual - usedLeaves.casual - pendingLeavesCount.casual),
    sick: Math.max(0, LEAVE_ALLOCATION.sick - usedLeaves.sick - pendingLeavesCount.sick)
  };

  return {
    totalLeaves: LEAVE_ALLOCATION,
    usedLeaves,
    pendingLeaves: pendingLeavesCount,
    remainingLeaves
  };
};

// Calculate days between two dates
const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};