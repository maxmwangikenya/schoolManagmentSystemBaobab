// controllers/leaveController.js

import Leave from '../models/leave.js';
import Employee from '../models/Employee.js';

// Helper function to calculate available leaves based on join date
const calculateAvailableLeaves = (joinDate) => {
  if (!joinDate) return { casual: 0, sick: 0 };
  
  const joined = new Date(joinDate);
  const today = new Date();
  const monthsWorked = (today.getFullYear() - joined.getFullYear()) * 12 + 
                       (today.getMonth() - joined.getMonth());
  
  const casualLeaves = Math.max(0, Math.floor(monthsWorked * 1.5));
  const sickLeaves = Math.max(0, Math.floor(monthsWorked * 1));
  
  return {
    casual: casualLeaves,
    sick: sickLeaves
  };
};

// Helper function to calculate used leaves
const calculateUsedLeaves = async (employeeId) => {
  const approvedLeaves = await Leave.find({
    employeeId,
    status: 'approved'
  });

  const usedLeaves = {
    casual: 0,
    sick: 0
  };

  approvedLeaves.forEach(leave => {
    if (leave.leaveType === 'casual') {
      usedLeaves.casual += leave.days;
    } else if (leave.leaveType === 'sick') {
      usedLeaves.sick += leave.days;
    }
  });

  return usedLeaves;
};

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

    const totalLeaves = calculateAvailableLeaves(employee.createdAt);
    const usedLeaves = await calculateUsedLeaves(employeeId);

    const pendingLeaves = await Leave.find({
      employeeId,
      status: 'pending'
    });

    const pendingLeaveDays = {
      casual: 0,
      sick: 0
    };

    pendingLeaves.forEach(leave => {
      if (leave.leaveType === 'casual') {
        pendingLeaveDays.casual += leave.days;
      } else if (leave.leaveType === 'sick') {
        pendingLeaveDays.sick += leave.days;
      }
    });

    const remainingLeaves = {
      casual: totalLeaves.casual - usedLeaves.casual,
      sick: totalLeaves.sick - usedLeaves.sick
    };

    res.json({
      success: true,
      data: {
        totalLeaves,
        usedLeaves,
        pendingLeaves: pendingLeaveDays,
        remainingLeaves,
        employeeName: employee.name,
        joinDate: employee.createdAt
      }
    });

  } catch (error) {
    console.error('Error getting leave balance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get leave balance'
    });
  }
};

export const applyLeave = async (req, res) => {
  try {
    const { employeeId, leaveType, startDate, endDate, reason, days } = req.body;

    if (!employeeId || !leaveType || !startDate || !endDate || !reason || !days) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return res.status(400).json({
        success: false,
        error: 'End date must be after or equal to start date'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      return res.status(400).json({
        success: false,
        error: 'Cannot apply for leave in the past'
      });
    }

    const totalLeaves = calculateAvailableLeaves(employee.createdAt);
    const usedLeaves = await calculateUsedLeaves(employeeId);
    
    const availableBalance = leaveType === 'casual' 
      ? totalLeaves.casual - usedLeaves.casual 
      : totalLeaves.sick - usedLeaves.sick;

    if (days > availableBalance) {
      return res.status(400).json({
        success: false,
        error: `Insufficient ${leaveType} leave balance. Available: ${availableBalance} days, Requested: ${days} days`
      });
    }

    const overlappingLeave = await Leave.findOne({
      employeeId,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (overlappingLeave) {
      return res.status(400).json({
        success: false,
        error: 'You already have a leave application for overlapping dates'
      });
    }

    const newLeave = new Leave({
      employeeId,
      leaveType,
      startDate,
      endDate,
      reason,
      days,
      status: 'pending',
      appliedDate: new Date()
    });

    await newLeave.save();

    const populatedLeave = await Leave.findById(newLeave._id)
      .populate('employeeId', 'name email department designation');

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully. Waiting for admin approval.',
      leave: populatedLeave
    });

  } catch (error) {
    console.error('Error applying for leave:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to apply for leave'
    });
  }
};

export const getEmployeeLeaves = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { status, leaveType } = req.query;

    const query = { employeeId };
    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;

    const leaves = await Leave.find(query)
      .populate('employeeId', 'name email department designation')
      .populate('reviewedBy', 'name email')
      .sort({ appliedDate: -1 });

    res.json({
      success: true,
      leaves: leaves
    });

  } catch (error) {
    console.error('Error getting employee leaves:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get employee leaves'
    });
  }
};

export const getAllLeaves = async (req, res) => {
  try {
    const { status, leaveType } = req.query;

    const query = {};
    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;

    const leaves = await Leave.find(query)
      .populate('employeeId', 'name email department designation employeeId profileImage')
      .populate('reviewedBy', 'name email')
      .sort({ appliedDate: -1 });

    const pendingCount = await Leave.countDocuments({ status: 'pending' });
    const approvedCount = await Leave.countDocuments({ status: 'approved' });
    const rejectedCount = await Leave.countDocuments({ status: 'rejected' });

    res.json({
      success: true,
      leaves: leaves,
      summary: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: leaves.length
      }
    });

  } catch (error) {
    console.error('Error getting all leaves:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get all leaves'
    });
  }
};

export const getLeaveById = async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findById(id)
      .populate('employeeId', 'name email department designation employeeId profileImage')
      .populate('reviewedBy', 'name email');

    if (!leave) {
      return res.status(404).json({
        success: false,
        error: 'Leave not found'
      });
    }

    res.json({
      success: true,
      leave: leave
    });

  } catch (error) {
    console.error('Error getting leave:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get leave'
    });
  }
};

export const reviewLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewComments } = req.body;
    const reviewerId = req.user._id || req.user.id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be "approved" or "rejected"'
      });
    }

    const leave = await Leave.findById(id)
      .populate('employeeId', 'name email department');
    
    if (!leave) {
      return res.status(404).json({
        success: false,
        error: 'Leave not found'
      });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Leave is already ${leave.status}. Cannot review again.`
      });
    }

    if (status === 'approved') {
      const employee = await Employee.findById(leave.employeeId._id);
      const totalLeaves = calculateAvailableLeaves(employee.createdAt);
      const usedLeaves = await calculateUsedLeaves(leave.employeeId._id);
      
      const availableBalance = leave.leaveType === 'casual' 
        ? totalLeaves.casual - usedLeaves.casual 
        : totalLeaves.sick - usedLeaves.sick;

      if (leave.days > availableBalance) {
        return res.status(400).json({
          success: false,
          error: `Cannot approve. Employee has insufficient leave balance. Available: ${availableBalance} days`
        });
      }
    }

    leave.status = status;
    leave.reviewedBy = reviewerId;
    leave.reviewedDate = new Date();
    if (reviewComments) leave.reviewComments = reviewComments;

    await leave.save();
    await leave.populate('reviewedBy', 'name email');

    res.json({
      success: true,
      message: `Leave ${status} successfully`,
      leave: leave
    });

  } catch (error) {
    console.error('Error reviewing leave:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to review leave'
    });
  }
};

export const cancelLeave = async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        error: 'Leave not found'
      });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Cannot cancel ${leave.status} leave. Only pending leaves can be cancelled.`
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(leave.startDate) < today) {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel leave that has already started'
      });
    }

    await Leave.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Leave cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling leave:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel leave'
    });
  }
};

export const getLeaveStats = async (req, res) => {
  try {
    const pendingCount = await Leave.countDocuments({ status: 'pending' });
    const approvedCount = await Leave.countDocuments({ status: 'approved' });
    const rejectedCount = await Leave.countDocuments({ status: 'rejected' });
    
    const casualCount = await Leave.countDocuments({ leaveType: 'casual', status: 'approved' });
    const sickCount = await Leave.countDocuments({ leaveType: 'sick', status: 'approved' });

    const currentYear = new Date().getFullYear();
    const leavesByMonth = await Leave.aggregate([
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
          count: { $sum: 1 },
          days: { $sum: '$days' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const recentPendingLeaves = await Leave.find({ status: 'pending' })
      .populate('employeeId', 'name department')
      .sort({ appliedDate: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        byStatus: {
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
          total: pendingCount + approvedCount + rejectedCount
        },
        byType: {
          casual: casualCount,
          sick: sickCount
        },
        byMonth: leavesByMonth,
        recentPending: recentPendingLeaves
      }
    });

  } catch (error) {
    console.error('Error getting leave stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get leave statistics'
    });
  }
};