// controllers/reportController.js
import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';
import Department from '../models/Department.js';

// Get all leaves with employee and department details
export const getAllLeaves = async (req, res) => {
  try {
    const { 
      status, 
      department, 
      startDate, 
      endDate, 
      employeeId,
      leaveType 
    } = req.query;

    // Build filter object
    let filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (leaveType) {
      filter.leaveType = leaveType;
    }
    
    if (employeeId) {
      filter.employeeId = employeeId;
    }

    // Date range filter
    if (startDate && endDate) {
      filter.$or = [
        { startDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
        { endDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
        {
          startDate: { $lte: new Date(startDate) },
          endDate: { $gte: new Date(endDate) }
        }
      ];
    }

    const leaves = await Leave.find(filter)
      .populate({
        path: 'employeeId',
        select: 'name email employeeId position phone',
        populate: {
          path: 'department',
          select: 'dep_name description' // ✅ Updated to use dep_name
        }
      })
      .populate({
        path: 'reviewedBy',
        select: 'name'
      })
      .sort({ appliedDate: -1 });

    // Filter by department if specified
    let filteredLeaves = leaves;
    if (department) {
      filteredLeaves = leaves.filter(
        leave => leave.employeeId?.department?._id.toString() === department
      );
    }

    // Format the response
    const formattedLeaves = filteredLeaves.map(leave => ({
      _id: leave._id,
      employeeName: leave.employeeId?.name || 'N/A',
      employeeId: leave.employeeId?.employeeId || 'N/A',
      email: leave.employeeId?.email || 'N/A',
      position: leave.employeeId?.position || 'N/A',
      department: leave.employeeId?.department?.dep_name || 'N/A', // ✅ Updated to use dep_name
      departmentDescription: leave.employeeId?.department?.description || null,
      departmentId: leave.employeeId?.department?._id || null,
      leaveType: leave.leaveType,
      startDate: leave.startDate,
      endDate: leave.endDate,
      reason: leave.reason,
      status: leave.status,
      appliedDate: leave.appliedDate,
      reviewedBy: leave.reviewedBy?.name || null,
      reviewedDate: leave.reviewedDate,
      reviewComment: leave.reviewComment,
      // Calculate leave duration in days
      duration: Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1
    }));

    return res.status(200).json({
      success: true,
      count: formattedLeaves.length,
      data: formattedLeaves
    });

  } catch (error) {
    console.error('Error fetching leaves report:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch leaves report',
      error: error.message
    });
  }
};

// Get leave statistics for dashboard
export const getLeaveStatistics = async (req, res) => {
  try {
    const { year, month, departmentId } = req.query;

    let dateFilter = {};
    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      dateFilter = {
        $or: [
          { startDate: { $gte: startDate, $lte: endDate } },
          { endDate: { $gte: startDate, $lte: endDate } },
          { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
        ]
      };
    }

    const leaves = await Leave.find(dateFilter)
      .populate({
        path: 'employeeId',
        populate: { path: 'department' }
      });

    // Filter by department if specified
    const filteredLeaves = departmentId
      ? leaves.filter(leave => leave.employeeId?.department?._id.toString() === departmentId)
      : leaves;

    // Calculate statistics
    const stats = {
      total: filteredLeaves.length,
      pending: filteredLeaves.filter(l => l.status === 'Pending').length,
      approved: filteredLeaves.filter(l => l.status === 'Approved').length,
      rejected: filteredLeaves.filter(l => l.status === 'Rejected').length,
      byLeaveType: {},
      byDepartment: {}
    };

    // Count by leave type
    filteredLeaves.forEach(leave => {
      stats.byLeaveType[leave.leaveType] = (stats.byLeaveType[leave.leaveType] || 0) + 1;
      
      const deptName = leave.employeeId?.department?.dep_name || 'Unknown'; // ✅ Updated to use dep_name
      stats.byDepartment[deptName] = (stats.byDepartment[deptName] || 0) + 1;
    });

    return res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching leave statistics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch leave statistics',
      error: error.message
    });
  }
};

// Get department-wise leave summary
export const getDepartmentLeaveSummary = async (req, res) => {
  try {
    const departments = await Department.find();
    
    const summary = await Promise.all(
      departments.map(async (dept) => {
        const employees = await Employee.find({ department: dept._id });
        const employeeIds = employees.map(emp => emp._id);

        const leaves = await Leave.find({ 
          employeeId: { $in: employeeIds } 
        });

        return {
          departmentId: dept._id,
          departmentName: dept.dep_name, // ✅ Updated to use dep_name
          departmentDescription: dept.description,
          totalEmployees: employees.length,
          totalLeaves: leaves.length,
          pendingLeaves: leaves.filter(l => l.status === 'Pending').length,
          approvedLeaves: leaves.filter(l => l.status === 'Approved').length,
          rejectedLeaves: leaves.filter(l => l.status === 'Rejected').length
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Error fetching department leave summary:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch department leave summary',
      error: error.message
    });
  }
};

// Get employee leave report (for a specific employee)
export const getEmployeeLeaveReport = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await Employee.findById(employeeId)
      .populate('department', 'dep_name description'); // ✅ Updated to use dep_name

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const leaves = await Leave.find({ employeeId })
      .sort({ appliedDate: -1 });

    const report = {
      employeeInfo: {
        name: employee.name,
        employeeId: employee.employeeId,
        email: employee.email,
        position: employee.position,
        department: employee.department?.dep_name || 'N/A', // ✅ Updated to use dep_name
        departmentDescription: employee.department?.description
      },
      leaveSummary: {
        totalLeaves: leaves.length,
        pending: leaves.filter(l => l.status === 'Pending').length,
        approved: leaves.filter(l => l.status === 'Approved').length,
        rejected: leaves.filter(l => l.status === 'Rejected').length,
        totalDaysOff: leaves
          .filter(l => l.status === 'Approved')
          .reduce((sum, leave) => {
            const duration = Math.ceil(
              (new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)
            ) + 1;
            return sum + duration;
          }, 0)
      },
      leaves: leaves.map(leave => ({
        _id: leave._id,
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
        reason: leave.reason,
        status: leave.status,
        appliedDate: leave.appliedDate,
        duration: Math.ceil(
          (new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)
        ) + 1
      }))
    };

    return res.status(200).json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Error fetching employee leave report:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch employee leave report',
      error: error.message
    });
  }
};