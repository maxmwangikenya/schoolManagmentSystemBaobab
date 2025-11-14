// utils/ipHelpers.js
// If you want to use geo lookups, install axios:  npm i axios
// and uncomment the axios import + code below.

import axios from 'axios';

/**
 * Get client IP from request
 */
export const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // Can be: "ip1, ip2, ip3"
    return forwarded.split(',')[0].trim();
  }
  // Fallbacks
  return req.socket?.remoteAddress || req.ip || '';
};

/**
 * Get Geo info from IP
 * - For now you can leave it as stub or use any IP API (e.g. ipapi, ipstack)
 * - Remember to keep API keys in env variables (process.env.XYZ)
 */
export const getGeoFromIp = async (ip) => {
  if (!ip || ip === '::1' || ip.startsWith('127.')) {
    // local dev; ignore
    return null;
  }

  try {
    // Example with ipapi.co (just an example – you can change):
    // const { data } = await axios.get(`https://ipapi.co/${ip}/json/`);
    // return {
    //   country: data.country_name,
    //   city: data.city,
    //   lat: data.latitude,
    //   lon: data.longitude,
    // };

    // Stub for now: return null to avoid errors
    return null;
  } catch (error) {
    console.error('Geo lookup failed:', error.message);
    return null;
  }
};
