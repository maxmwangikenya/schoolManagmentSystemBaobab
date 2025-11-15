// utils/attendanceIpCheck.js
const getAllowedIps = () => {
  return (process.env.ALLOWED_ATTENDANCE_IPS || '')
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean);
};

export const ensureAllowedIp = (req, res, next) => {
  const allowedIps = getAllowedIps();

  // If nothing configured, block everyone (or change behavior if you want)
  if (allowedIps.length === 0) {
    return res.status(403).json({
      success: false,
      error: 'Attendance IPs are not configured. Please contact admin.',
    });
  }

  const clientIp =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.connection.remoteAddress ||
    req.ip;

  if (!allowedIps.includes(clientIp)) {
    return res.status(403).json({
      success: false,
      error: `IP ${clientIp} is not allowed to mark attendance.`,
    });
  }

  next();
};
