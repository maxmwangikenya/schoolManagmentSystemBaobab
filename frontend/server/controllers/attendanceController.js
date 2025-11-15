// controllers/attendanceController.js
import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';
import { getClientIp, getGeoFromIp } from '../utils/ipHelpers.js';

// 🔹 Helper: find Employee linked to logged-in User
const getEmployeeForUser = async (userId) => {
  return Employee.findOne({ user: userId });
};

// 🔹 Normalize day boundaries
const startOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

// POST /api/attendance/clock-in
export const clockIn = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const employee = await getEmployeeForUser(userId);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee record not found' });
    }

    const todayStart = startOfDay();
    const todayEnd = endOfDay();

    // Check if an attendance record exists for today
    let record = await Attendance.findOne({
      employee: employee._id,
      date: { $gte: todayStart, $lte: todayEnd },
    });

    if (record && record.clockInTime) {
      return res.status(400).json({
        success: false,
        error: 'You have already clocked in today',
      });
    }

    const ip = getClientIp(req);
    const geo = await getGeoFromIp(ip); // currently may return null if not configured

    if (!record) {
      record = new Attendance({
        employee: employee._id,
        date: new Date(),
      });
    }

    record.clockInTime = new Date();
    record.ipAddressIn = ip;
    if (geo) record.geoIn = geo;

    await record.save();

    return res.status(201).json({
      success: true,
      message: 'Clock-in successful',
      attendance: record,
    });
  } catch (error) {
    console.error('Clock-in error:', error);
    return res.status(500).json({ success: false, error: 'Failed to clock in' });
  }
};

// POST /api/attendance/clock-out
export const clockOut = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const employee = await getEmployeeForUser(userId);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee record not found' });
    }

    const todayStart = startOfDay();
    const todayEnd = endOfDay();

    const record = await Attendance.findOne({
      employee: employee._id,
      date: { $gte: todayStart, $lte: todayEnd },
    });

    if (!record || !record.clockInTime) {
      return res.status(400).json({
        success: false,
        error: 'No clock-in found for today',
      });
    }

    if (record.clockOutTime) {
      return res.status(400).json({
        success: false,
        error: 'You have already clocked out today',
      });
    }

    const ip = getClientIp(req);
    const geo = await getGeoFromIp(ip);

    record.clockOutTime = new Date();
    record.ipAddressOut = ip;
    if (geo) record.geoOut = geo;

    // Calculate total hours worked
    const diffMs = record.clockOutTime - record.clockInTime;
    const hours = diffMs / (1000 * 60 * 60);
    record.totalHours = Number(hours.toFixed(2));

    await record.save();

    return res.json({
      success: true,
      message: 'Clock-out successful',
      attendance: record,
    });
  } catch (error) {
    console.error('Clock-out error:', error);
    return res.status(500).json({ success: false, error: 'Failed to clock out' });
  }
};

// GET /api/attendance/me/today
export const getMyTodayAttendance = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const employee = await getEmployeeForUser(userId);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee record not found' });
    }

    const todayStart = startOfDay();
    const todayEnd = endOfDay();

    const record = await Attendance.findOne({
      employee: employee._id,
      date: { $gte: todayStart, $lte: todayEnd },
    });

    return res.json({
      success: true,
      attendance: record || null,
    });
  } catch (error) {
    console.error('Get today attendance error:', error);
    return res.status(500).json({ success: false, error: 'Failed to load attendance' });
  }
};

// GET /api/attendance/me/history?from=2025-01-01&to=2025-01-31
export const getMyAttendanceHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const employee = await getEmployeeForUser(userId);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee record not found' });
    }

    const { from, to } = req.query;
    const fromDate = from ? startOfDay(new Date(from)) : startOfDay();
    const toDate = to ? endOfDay(new Date(to)) : endOfDay();

    const records = await Attendance.find({
      employee: employee._id,
      date: { $gte: fromDate, $lte: toDate },
    }).sort({ date: -1 });

    return res.json({
      success: true,
      count: records.length,
      attendance: records,
    });
  } catch (error) {
    console.error('Get history error:', error);
    return res.status(500).json({ success: false, error: 'Failed to load attendance history' });
  }
};

export const getMyDailyAttendanceSummary = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const employee = await Employee.findOne({ user: userId });
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee record not found' });
    }

    const daysParam = parseInt(req.query.days, 10);
    const days = Number.isNaN(daysParam) ? 30 : Math.max(1, daysParam); // at least 1 day

    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    const pipeline = [
      {
        $match: {
          employee: employee._id,
          date: { $gte: start },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' },
          },
          totalHours: { $sum: { $ifNull: ['$totalHours', 0] } },
          present: {
            $max: {
              $cond: [{ $ifNull: ['$clockInTime', false] }, 1, 0],
            },
          },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.day': 1,
        },
      },
    ];

    const aggResult = await Attendance.aggregate(pipeline);

    // Build a full list of days (including those with 0 hours)
    const result = [];
    const mapByKey = new Map();

    aggResult.forEach((r) => {
      const { year, month, day } = r._id;
      const key = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      mapByKey.set(key, {
        date: key,
        totalHours: Number((r.totalHours || 0).toFixed(2)),
        present: r.present === 1,
      });
    });

    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;

      const label = d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });

      const existing = mapByKey.get(key);
      result.push(
        existing || {
          date: key,
          label,
          totalHours: 0,
          present: false,
        }
      );
    }

    // Ensure each item has label populated
    result.forEach((item) => {
      if (!item.label) {
        const [y, m, dd] = item.date.split('-').map(Number);
        const d = new Date(y, m - 1, dd);
        item.label = d.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        });
      }
    });

    return res.json({
      success: true,
      days,
      summary: result,
    });
  } catch (error) {
    console.error('Get daily attendance summary error:', error);
    return res.status(500).json({ success: false, error: 'Failed to load daily attendance summary' });
  }
};

/**
 * 🔹 MONTHLY SUMMARY FOR LAST N MONTHS
 */
export const getMyMonthlyAttendanceSummary = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const employee = await Employee.findOne({ user: userId });
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee record not found' });
    }

    const monthsParam = parseInt(req.query.months, 10);
    const months = Number.isNaN(monthsParam) ? 6 : Math.max(1, monthsParam); // at least 1 month

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1); // first day of oldest month

    const pipeline = [
      {
        $match: {
          employee: employee._id,
          date: { $gte: start },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          totalHours: { $sum: { $ifNull: ['$totalHours', 0] } },
          presentDays: {
            $sum: {
              $cond: [{ $ifNull: ['$clockInTime', false] }, 1, 0],
            },
          },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
    ];

    const aggResult = await Attendance.aggregate(pipeline);

    const summary = aggResult.map((m) => {
      const { year, month } = m._id;
      const labelDate = new Date(year, month - 1, 1);
      const label = labelDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
      });

      return {
        year,
        month,
        label,
        presentDays: m.presentDays || 0,
        totalHours: Number((m.totalHours || 0).toFixed(2)),
      };
    });

    return res.json({
      success: true,
      months,
      summary,
    });
  } catch (error) {
    console.error('Get monthly attendance summary error:', error);
    return res.status(500).json({ success: false, error: 'Failed to load monthly attendance summary' });
  }
};