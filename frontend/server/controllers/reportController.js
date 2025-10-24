// controllers/reportController.js
import Report from '../models/Report.js';
import Employee from '../models/Employee.js';
import Leave from '../models/Leave.js';
import Department from '../models/Department.js';

// GET ALL REPORTS 
export const getAllReports = async (req, res) => {
  try {
    const { 
      reportType, 
      status, 
      startDate, 
      endDate,
      page = 1,
      limit = 50,
      sortBy = 'generatedAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query = { isDeleted: false };
    
    if (reportType && reportType !== 'all') query.reportType = reportType;
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.generatedAt = {};
      if (startDate) query.generatedAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.generatedAt.$lte = end;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const reports = await Report.find(query)
      .populate('generatedBy', 'name email designation profileImage')
      .populate('filters.employeeId', 'name designation department')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      count: reports.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      reports
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reports',
      message: error.message
    });
  }
};

// GET SINGLE REPORT 
export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid report ID format'
      });
    }

    const report = await Report.findById(id)
      .populate('generatedBy', 'name email designation profileImage')
      .populate('filters.employeeId', 'name designation department');

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    res.status(200).json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch report',
      message: error.message
    });
  }
};

// CREATE/GENERATE REPORT 
export const createReport = async (req, res) => {
  try {
    const { reportTitle, reportType, description, filters, tags, format } = req.body;
    const generatedBy = req.user._id; 
    
    if (!reportTitle || !reportType) {
      return res.status(400).json({
        success: false,
        error: 'Report title and type are required'
      });
    }

    const validTypes = ['employee_performance', 'attendance', 'leave_summary', 'department', 'salary', 'custom'];
    if (!validTypes.includes(reportType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid report type'
      });
    }

    // Clean the filters object to handle empty status values
    const cleanedFilters = { ...(filters || {}) };
    if (cleanedFilters.status === '') {
      cleanedFilters.status = null;
    }

    let reportData = {};
    let summary = { totalRecords: 0, metrics: {} };
    let autoDescription = description || '';

    try {
      switch (reportType) {
        case 'employee_performance':
          const performanceData = await generateEmployeePerformanceReport(cleanedFilters);
          reportData = performanceData.data;
          summary = performanceData.summary;
          // Generate auto description if none provided
          if (!autoDescription) {
            autoDescription = generateAutoDescription('employee_performance', cleanedFilters, summary);
          }
          break;

        case 'leave_summary':
          const leaveData = await generateLeaveSummaryReport(cleanedFilters);
          reportData = leaveData.data;
          summary = leaveData.summary;
          if (!autoDescription) {
            autoDescription = generateAutoDescription('leave_summary', cleanedFilters, summary);
          }
          break;

        case 'department':
          const departmentData = await generateDepartmentReport(cleanedFilters);
          reportData = departmentData.data;
          summary = departmentData.summary;
          if (!autoDescription) {
            autoDescription = generateAutoDescription('department', cleanedFilters, summary);
          }
          break;

        case 'salary':
          const salaryData = await generateSalaryReport(cleanedFilters);
          reportData = salaryData.data;
          summary = salaryData.summary;
          if (!autoDescription) {
            autoDescription = generateAutoDescription('salary', cleanedFilters, summary);
          }
          break;

        case 'attendance':
          const attendanceData = await generateAttendanceReport(cleanedFilters);
          reportData = attendanceData.data;
          summary = attendanceData.summary;
          if (!autoDescription) {
            autoDescription = generateAutoDescription('attendance', cleanedFilters, summary);
          }
          break;

        case 'custom':
          reportData = { 
            message: 'Custom report generated',
            filters: cleanedFilters
          };
          summary = { totalRecords: 0, metrics: {} };
          if (!autoDescription) {
            autoDescription = 'Custom report with user-defined parameters';
          }
          break;

        default:
          return res.status(400).json({
            success: false,
            error: 'Unsupported report type'
          });
      }
    } catch (genError) {
      console.error('Error generating report data:', genError);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate report data',
        message: genError.message
      });
    }

    const report = new Report({
      reportTitle,
      reportType,
      description: autoDescription,
      filters: cleanedFilters,
      reportData,
      summary,
      generatedBy,
      status: 'completed',
      format: format || 'json',
      tags: tags || [],
      generatedAt: new Date()
    });

    await report.save();
    await report.populate('generatedBy', 'name email designation');

    res.status(201).json({
      success: true,
      message: 'Report generated successfully',
      report
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate report',
      message: error.message
    });
  }
};

// UPDATE REPORT
export const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { reportTitle, description, tags, isPublic, notes } = req.body;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    if (reportTitle) report.reportTitle = reportTitle;
    if (description !== undefined) report.description = description;
    if (tags) report.tags = tags;
    if (isPublic !== undefined) report.isPublic = isPublic;
    if (notes !== undefined) report.notes = notes;

    await report.save();

    res.status(200).json({
      success: true,
      message: 'Report updated successfully',
      report
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update report',
      message: error.message
    });
  }
};

// DELETE REPORT
export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    await report.softDelete();

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete report',
      message: error.message
    });
  }
};

// GET STATISTICS
export const getReportStatistics = async (req, res) => {
  try {
    const totalReports = await Report.countDocuments({ isDeleted: false });
    
    const reportsByType = await Report.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$reportType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentReports = await Report.countDocuments({
      isDeleted: false,
      generatedAt: { $gte: sevenDaysAgo }
    });

    const reportsByStatus = await Report.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      statistics: {
        totalReports,
        recentReports,
        reportsByType,
        reportsByStatus
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
};

//  HELPER FUNCTION FOR AUTO DESCRIPTION 

const generateAutoDescription = (reportType, filters, summary) => {
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  let description = '';
  const dateRange = filters.startDate && filters.endDate 
    ? `from ${formatDate(filters.startDate)} to ${formatDate(filters.endDate)}` 
    : '';

  switch (reportType) {
    case 'employee_performance':
      description = `Employee performance report ${dateRange}. `;
      if (summary.metrics) {
        description += `Total employees: ${summary.metrics.totalEmployees || 0}. `;
        if (summary.metrics.totalLeaves) {
          description += `Total leaves recorded: ${summary.metrics.totalLeaves}, `;
          description += `with ${summary.metrics.approvedLeaves || 0} approved`;
        }
      }
      if (filters.department) {
        description += `. Filtered by department: ${filters.department}`;
      }
      break;

    case 'leave_summary':
      description = `Leave summary report ${dateRange}. `;
      if (summary.metrics) {
        description += `Total leaves: ${summary.metrics.totalLeaves || 0} `;
        description += `(Approved: ${summary.metrics.approvedLeaves || 0}, `;
        description += `Pending: ${summary.metrics.pendingLeaves || 0}, `;
        description += `Rejected: ${summary.metrics.rejectedLeaves || 0}). `;
        if (summary.metrics.totalDays) {
          description += `Total leave days: ${summary.metrics.totalDays}. `;
        }
        if (summary.metrics.approvalRate) {
          description += `Approval rate: ${summary.metrics.approvalRate}%`;
        }
      }
      break;

    case 'department':
      description = `Department-wise analysis report. `;
      if (summary.metrics) {
        description += `Total departments: ${summary.metrics.totalDepartments || 0}. `;
        description += `Total employees across departments: ${summary.metrics.totalEmployees || 0}`;
      }
      if (filters.department) {
        description += `. Specific department: ${filters.department}`;
      }
      break;

    case 'salary':
      description = `Salary and payroll report ${dateRange}. `;
      if (summary.metrics) {
        description += `Total employees: ${summary.metrics.totalEmployees || 0}. `;
        if (summary.metrics.totalSalary) {
          description += `Total payroll: $${summary.metrics.totalSalary}. `;
        }
        if (summary.metrics.averageSalary) {
          description += `Average salary: $${summary.metrics.averageSalary}. `;
        }
        if (summary.metrics.highestSalary && summary.metrics.lowestSalary) {
          description += `Salary range: $${summary.metrics.lowestSalary} - $${summary.metrics.highestSalary}`;
        }
      }
      break;

    case 'attendance':
      description = `Attendance tracking report ${dateRange}. `;
      if (summary.metrics) {
        description += `Present: ${summary.metrics.totalPresent || 0}, `;
        description += `Absent: ${summary.metrics.totalAbsent || 0}, `;
        description += `Late: ${summary.metrics.totalLate || 0}. `;
        if (summary.metrics.attendanceRate) {
          description += `Attendance rate: ${summary.metrics.attendanceRate}%`;
        }
      }
      break;

    default:
      description = `Report generated for ${reportType} with specified filters`;
  }

  return description.trim();
};

//  REPORT GENERATORS 

// 1. Employee Performance Report
const generateEmployeePerformanceReport = async (filters = {}) => {
  try {
    const query = {};
    
    if (filters.department) query.department = filters.department;
    if (filters.employeeId) query._id = filters.employeeId;
    if (filters.status && filters.status !== null) query.status = filters.status;

    const employees = await Employee.find(query)
      .populate('department', 'name')
      .select('name designation department email salary dob joiningDate')
      .lean();

    const employeeData = await Promise.all(
      employees.map(async (emp) => {
        const leaveQuery = { employeeId: emp._id };
        if (filters.startDate && filters.endDate) {
          leaveQuery.startDate = { $gte: new Date(filters.startDate) };
          leaveQuery.endDate = { $lte: new Date(filters.endDate) };
        }

        const employeeLeaves = await Leave.find(leaveQuery)
          .select('startDate endDate days leaveType status reason appliedDate approvedDate')
          .sort({ startDate: -1 })
          .lean();

        const approvedLeaves = employeeLeaves.filter(leave => leave.status === 'approved');
        const pendingLeaves = employeeLeaves.filter(leave => leave.status === 'pending');
        const rejectedLeaves = employeeLeaves.filter(leave => leave.status === 'rejected');
        
        return {
          employeeId: emp._id.toString(),
          name: emp.name,
          designation: emp.designation,
          department: emp.department?.name || emp.department,
          email: emp.email,
          joiningDate: emp.joiningDate,
          leaves: employeeLeaves.map(leave => ({
            leaveId: leave._id.toString(),
            startDate: leave.startDate,
            endDate: leave.endDate,
            days: leave.days,
            leaveType: leave.leaveType,
            status: leave.status,
            reason: leave.reason,
            appliedDate: leave.appliedDate,
            approvedDate: leave.approvedDate
          })),
          performance: {
            totalLeaves: employeeLeaves.length,
            approvedLeaves: approvedLeaves.length,
            pendingLeaves: pendingLeaves.length,
            rejectedLeaves: rejectedLeaves.length,
            approvedLeaveDays: approvedLeaves.reduce((sum, leave) => sum + (leave.days || 0), 0),
            tenure: calculateTenure(emp.joiningDate)
          }
        };
      })
    );

    return {
      data: employeeData,
      summary: {
        totalRecords: employeeData.length,
        metrics: {
          totalEmployees: employeeData.length,
          totalLeaves: employeeData.reduce((sum, emp) => sum + emp.performance.totalLeaves, 0),
          approvedLeaves: employeeData.reduce((sum, emp) => sum + emp.performance.approvedLeaves, 0),
          pendingLeaves: employeeData.reduce((sum, emp) => sum + emp.performance.pendingLeaves, 0),
          departments: [...new Set(employeeData.map(e => e.department))].length
        }
      }
    };
  } catch (error) {
    throw error;
  }
};

// 2. Leave Summary Report
const generateLeaveSummaryReport = async (filters = {}) => {
  try {
    const query = {};
    
    if (filters.startDate && filters.endDate) {
      query.startDate = { $gte: new Date(filters.startDate) };
      query.endDate = { $lte: new Date(filters.endDate) };
    }
    if (filters.status && filters.status !== null) query.status = filters.status;
    if (filters.employeeId) query.employeeId = filters.employeeId;
    if (filters.leaveType) query.leaveType = filters.leaveType;

    const leaves = await Leave.find(query)
      .populate('employeeId', 'name designation department email')
      .sort({ appliedDate: -1 })
      .lean();

    const detailedLeaves = leaves.map(leave => ({
      leaveId: leave._id.toString(),
      employee: leave.employeeId ? {
        employeeId: leave.employeeId._id.toString(),
        name: leave.employeeId.name,
        designation: leave.employeeId.designation,
        department: leave.employeeId.department,
        email: leave.employeeId.email
      } : null,
      leaveDetails: {
        startDate: leave.startDate,
        endDate: leave.endDate,
        days: leave.days,
        leaveType: leave.leaveType,
        status: leave.status,
        reason: leave.reason,
        appliedDate: leave.appliedDate,
        approvedDate: leave.approvedDate,
        rejectedDate: leave.rejectedDate
      },
      duration: calculateLeaveDuration(leave.startDate, leave.endDate)
    }));

    const totalLeaves = leaves.length;
    const approvedLeaves = leaves.filter(l => l.status === 'approved').length;
    const pendingLeaves = leaves.filter(l => l.status === 'pending').length;
    const rejectedLeaves = leaves.filter(l => l.status === 'rejected').length;
    const totalDays = leaves.reduce((sum, l) => sum + (l.days || 0), 0);
    
    const leaveTypes = {};
    leaves.forEach(leave => {
      leaveTypes[leave.leaveType] = (leaveTypes[leave.leaveType] || 0) + 1;
    });

    return {
      data: { 
        leaves: detailedLeaves,
        summaryByEmployee: await getLeaveSummaryByEmployee(leaves)
      },
      summary: {
        totalRecords: totalLeaves,
        metrics: {
          totalLeaves,
          approvedLeaves,
          pendingLeaves,
          rejectedLeaves,
          totalDays,
          leaveTypes,
          approvalRate: totalLeaves > 0 ? ((approvedLeaves / totalLeaves) * 100).toFixed(2) : 0,
          averageLeaveDuration: totalLeaves > 0 ? (totalDays / totalLeaves).toFixed(2) : 0
        }
      }
    };
  } catch (error) {
    console.error('Error generating leave summary report:', error);
    throw error;
  }
};

// 3. Department Report
const generateDepartmentReport = async (filters = {}) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: '$department',
          totalEmployees: { $sum: 1 },
          averageSalary: { $avg: '$salary' },
          totalSalary: { $sum: '$salary' }
        }
      },
      { $sort: { totalEmployees: -1 } }
    ];

    if (filters.department) {
      pipeline.unshift({ $match: { department: filters.department } });
    }

    const departmentData = await Employee.aggregate(pipeline);

    const transformedData = departmentData.map(dept => ({
      department: dept._id,
      totalEmployees: dept.totalEmployees,
      averageSalary: dept.averageSalary ? Math.round(dept.averageSalary * 100) / 100 : 0,
      totalSalary: dept.totalSalary ? Math.round(dept.totalSalary * 100) / 100 : 0
    }));

    const totalEmployees = departmentData.reduce((sum, d) => sum + d.totalEmployees, 0);

    return {
      data: transformedData,
      summary: {
        totalRecords: departmentData.length,
        metrics: {
          totalDepartments: departmentData.length,
          totalEmployees
        }
      }
    };
  } catch (error) {
    console.error('Error generating department report:', error);
    throw error;
  }
};

// 4. Salary Report
const generateSalaryReport = async (filters = {}) => {
  try {
    const query = {};
    
    if (filters.department) query.department = filters.department;
    if (filters.employeeId) query._id = filters.employeeId;

    const employees = await Employee.find(query)
      .populate('department', 'name')
      .select('name designation department salary')
      .sort({ salary: -1 })
      .lean();

    const transformedEmployees = employees.map(emp => ({
      employeeId: emp._id.toString(),
      name: emp.name,
      designation: emp.designation,
      department: emp.department?.name || emp.department,
      salary: emp.salary
    }));

    const salaries = employees.map(e => e.salary || 0).filter(s => s > 0);
    const totalSalary = salaries.reduce((sum, s) => sum + s, 0);
    const averageSalary = salaries.length > 0 ? totalSalary / salaries.length : 0;
    const highestSalary = Math.max(...salaries, 0);
    const lowestSalary = salaries.length > 0 ? Math.min(...salaries) : 0;

    return {
      data: { employees: transformedEmployees },
      summary: {
        totalRecords: employees.length,
        metrics: {
          totalEmployees: employees.length,
          totalSalary: totalSalary.toFixed(2),
          averageSalary: averageSalary.toFixed(2),
          highestSalary,
          lowestSalary
        }
      }
    };
  } catch (error) {
    console.error('Error generating salary report:', error);
    throw error;
  }
};

// 5. Attendance Report
const generateAttendanceReport = async (filters = {}) => {
  try {
    return {
      data: {
        message: 'Attendance report data would go here',
        filters: filters,
        attendanceRecords: []
      },
      summary: {
        totalRecords: 0,
        metrics: {
          totalPresent: 0,
          totalAbsent: 0,
          totalLate: 0,
          attendanceRate: 0
        }
      }
    };
  } catch (error) {
    console.error('Error generating attendance report:', error);
    throw error;
  }
};

//HELPER FUNCTIONS 

const getLeaveSummaryByEmployee = async (leaves) => {
  const employeeSummary = {};
  
  leaves.forEach(leave => {
    if (leave.employeeId) {
      const empId = leave.employeeId._id.toString();
      if (!employeeSummary[empId]) {
        employeeSummary[empId] = {
          employeeId: empId,
          name: leave.employeeId.name,
          designation: leave.employeeId.designation,
          department: leave.employeeId.department,
          totalLeaves: 0,
          approvedLeaves: 0,
          pendingLeaves: 0,
          rejectedLeaves: 0,
          totalDays: 0,
          leaves: []
        };
      }
      
      employeeSummary[empId].totalLeaves++;
      employeeSummary[empId].totalDays += leave.days || 0;
      employeeSummary[empId][`${leave.status}Leaves`]++;
      employeeSummary[empId].leaves.push({
        leaveId: leave._id.toString(),
        startDate: leave.startDate,
        endDate: leave.endDate,
        days: leave.days,
        leaveType: leave.leaveType,
        status: leave.status
      });
    }
  });
  
  return Object.values(employeeSummary);
};

const calculateLeaveDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

const calculateTenure = (joiningDate) => {
  if (!joiningDate) return { years: 0, months: 0, days: 0 };
  
  const now = new Date();
  const joining = new Date(joiningDate);
  const diffTime = Math.abs(now - joining);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  
  return { years, months, days: diffDays };
};