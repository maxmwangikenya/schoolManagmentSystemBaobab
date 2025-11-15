// middleware/attendanceIpCheck.js
import { getClientIp } from '../utils/ipHelpers.js';

// Read from backend .env (NOT Vite)
const rawAllowed = process.env.ALLOWED_ATTENDANCE_IPS || '';

const ALLOWED_IPS = rawAllowed
  .split(',')
  .map((ip) => ip.trim())
  .filter(Boolean);

export const ensureAllowedIp = (req, res, next) => {
  // If no IPs configured on the server, allow all (soft mode)
  if (ALLOWED_IPS.length === 0) {
    return next();
  }

  const ip = getClientIp(req);

  if (!ip) {
    return res.status(403).json({
      success: false,
      error: 'Unable to determine client IP for attendance',
    });
  }

  if (!ALLOWED_IPS.includes(ip)) {
    return res.status(403).json({
      success: false,
      error: `Your IP (${ip}) is not allowed to mark attendance`,
    });
  }

  return next();
};
