import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/authContext';

import {
  User,
  Calendar,
  Activity,
  Zap,
  DollarSign,
  Settings,
  ArrowRight,
  Briefcase,
  Building,
  LogOut,
  ClipboardList,
  Shield,
  BarChart3,
  Clock,
  Wifi,
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const currencyCode = import.meta.env.VITE_CURRENCY || 'KES';
const fmtMoney = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode, maximumFractionDigits: 2 }).format(
    Number(n || 0)
  );
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

const DashboardCard = ({
  title,
  value,
  subtitle,
  gradient = 'from-slate-50 to-slate-100',
  border = 'border-slate-200',
  Icon,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`text-left bg-white rounded-xl shadow-sm border ${border} hover:shadow-lg transition-all hover:-translate-y-1 focus:ring-2 focus:ring-indigo-500/30`}
  >
    <div className={`bg-gradient-to-br ${gradient} p-4 rounded-xl`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">{title}</span>
        {Icon ? <Icon className="w-4.5 h-4.5 text-slate-500" /> : null}
      </div>
      <div className="text-xl md:text-2xl font-extrabold text-slate-900">{value}</div>
      {subtitle ? <div className="text-[11px] text-slate-600 mt-1">{subtitle}</div> : null}
    </div>
  </button>
);

const StatusBadge = ({ status }) => {
  const map = {
    pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
  };
  const cls = map[status?.toLowerCase?.()] || 'bg-slate-50 text-slate-600 ring-1 ring-slate-200';
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${cls}`}>{status || 'unknown'}</span>
  );
};

// 🔹 Allowed IPs from frontend .env (not hard-coded)
const ALLOWED_IPS = (import.meta.env.VITE_ALLOWED_ATTENDANCE_IPS || '')
  .split(',')
  .map((ip) => ip.trim())
  .filter(Boolean);

const EmployeeDashboardHome = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_BACKENDAPI;

  const employeeId = user?.employeeId || user?._id;

  const [loading, setLoading] = useState(true);
  const [empError, setEmpError] = useState(null);
  const [employee, setEmployee] = useState(null);

  const [balError, setBalError] = useState(null);
  const [balance, setBalance] = useState(null);

  const [histError, setHistError] = useState(null);
  const [leaves, setLeaves] = useState([]);

  const [now, setNow] = useState(new Date()); // live time

  // 🔹 Attendance state
  const [attLoading, setAttLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clientIp, setClientIp] = useState('');
  const [ipMatch, setIpMatch] = useState(false); // default false (strict)
  const [attError, setAttError] = useState('');
  const [attSuccess, setAttSuccess] = useState('');

  const token = localStorage.getItem('token');

  // live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      const [empRes, balRes, histRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/employees/${employeeId}`, { headers }),
        axios.get(`${API_BASE_URL}/api/leaves/balance/${employeeId}`, { headers }),
        axios.get(`${API_BASE_URL}/api/leaves/employee/${employeeId}`, { headers }),
      ]);

      setEmployee(empRes.data || null);
      setEmpError(null);

      setBalance(balRes.data?.data || null);
      setBalError(null);

      setLeaves(histRes.data?.leaves || []);
      setHistError(null);
    } catch (err) {
      if (err?.config?.url?.includes('/api/employees/'))
        setEmpError(err?.response?.data?.error || 'Failed to load employee');
      if (err?.config?.url?.includes('/api/leaves/balance'))
        setBalError(err?.response?.data?.error || 'Failed to load leave balance');
      if (err?.config?.url?.includes('/api/leaves/employee'))
        setHistError(err?.response?.data?.error || 'Failed to load leave history');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Get client IP and compare with allowed IPs
  const fetchClientIp = async () => {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      const ip = data.ip;
      setClientIp(ip);

      if (ALLOWED_IPS.length === 0) {
        // ⚠ No allowed IPs configured → treat as NOT allowed
        setIpMatch(false);
      } else {
        setIpMatch(ALLOWED_IPS.includes(ip));
      }
    } catch (err) {
      console.error('Failed to fetch client IP:', err);
      setClientIp('Unknown');
      // On error, also treat as NOT allowed
      setIpMatch(false);
    }
  };

  // 🔹 Get today's attendance
  const fetchTodayAttendance = async () => {
    try {
      setAttLoading(true);
      setAttError('');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API_BASE_URL}/api/attendance/me/today`, { headers });
      const data = res.data;

      if (!data.success) {
        setTodayAttendance(null);
        setIsClockedIn(false);
        return;
      }

      const att = data.attendance;
      setTodayAttendance(att || null);

      if (att && att.clockInTime && !att.clockOutTime) {
        setIsClockedIn(true);
      } else {
        setIsClockedIn(false);
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setAttError('Failed to load today attendance');
      setTodayAttendance(null);
      setIsClockedIn(false);
    } finally {
      setAttLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId && API_BASE_URL && token) {
      fetchAll();
      fetchClientIp();
      fetchTodayAttendance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  const upcomingLeavesCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return (leaves || []).filter((l) => new Date(l.startDate) >= today).length;
  }, [leaves]);

  const totalRemaining = useMemo(() => {
    const rem = balance?.remainingLeaves || {};
    return Number(rem.casual || 0) + Number(rem.sick || 0) + Number(rem.annual || 0);
  }, [balance]);

  const totalUsed = useMemo(() => {
    const used = balance?.usedLeaves || {};
    return Number(used.casual || 0) + Number(used.sick || 0) + Number(used.annual || 0);
  }, [balance]);

  const net = employee?.salary?.netSalary;
  const gross = employee?.salary?.grossSalary;

  // greeting + icon rules
  const hour = now.getHours();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const getGreeting = (h) => {
    if (h < 5) return 'Good Night';
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };
  const greeting = getGreeting(hour);
  const isSun = hour >= 6 && hour < 19;

  const Glyph = () =>
    isSun ? (
      <span className="relative inline-flex items-center justify-center">
        <span className="absolute -inset-2 rounded-full bg-yellow-400/30 blur-md animate-pulse" />
        <span className="absolute -inset-4 rounded-full bg-amber-400/20 blur-xl animate-pulse" />
        <span className="text-3xl md:text-4xl select-none">☀️</span>
      </span>
    ) : (
      <span className="relative inline-flex items-center justify-center">
        <span className="absolute -inset-2 rounded-full bg-indigo-400/30 blur-md animate-pulse" />
        <span className="absolute -inset-4 rounded-full bg-indigo-500/20 blur-xl animate-pulse" />
        <span className="text-3xl md:text-4xl select-none">🌙</span>
      </span>
    );

  const avatarSrc = employee?.profileImage
    ? `${API_BASE_URL}/public/uploads/${employee.profileImage}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user?.name || 'Employee'
      )}&background=0ea5e9&color=fff&size=200`;

  const role = (user?.role || 'employee').toLowerCase();
  const roleChip =
    role === 'admin'
      ? 'bg-rose-50 text-rose-700 border-rose-200'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  const handleLogout = () => {
    if (window.confirm('Logout now?')) logout();
  };

  // 🔹 Clock in/out handler with IP enforcement
  const handleAttendanceClick = async () => {
    setAttError('');
    setAttSuccess('');

    // ⛔ HARD BLOCK: do NOT allow when IP doesn't match
    if (!ipMatch) {
      setAttError('Your current IP is not allowed to mark attendance.');
      return;
    }

    try {
      setActionLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const endpoint = isClockedIn ? 'clock-out' : 'clock-in';

      const res = await axios.post(`${API_BASE_URL}/api/attendance/${endpoint}`, {}, { headers });
      const data = res.data;

      if (!data.success) {
        setAttError(data.error || 'Failed to update attendance');
      } else {
        setAttSuccess(data.message || 'Attendance updated');
        await fetchTodayAttendance();
      }
    } catch (err) {
      console.error('Error updating attendance:', err);
      setAttError('Failed to update attendance');
    } finally {
      setActionLoading(false);
    }
  };

  const buttonLabel = isClockedIn ? 'Clock Out' : 'Clock In';
  const buttonIcon = isClockedIn ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />;

  // 🟥 / 🟩 button gradient based on IP match
  const buttonColorClass = ipMatch
    ? 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
    : 'from-red-600 to-red-700 hover:from-red-700 hover:to-red-800';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center">
          <p className="text-red-600 font-semibold mb-3">{empError || 'Unable to load your profile.'}</p>
          <button
            onClick={fetchAll}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-indigo-50/30 to-white min-h-screen">
      <div className="p-6 md:p-8 space-y-8">
        {/*  HEADER (two-column)  */}
        <div className="relative bg-gradient-to-r from-sky-600 via-cyan-600 to-indigo-600 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-black/5" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl" />

          <div className="relative px-6 md:px-8 py-7">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT: identity */}
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img
                    className="h-16 w-16 md:h-20 md:w-20 rounded-full object-cover border-4 border-white shadow-2xl"
                    src={avatarSrc}
                    alt={user?.name || 'Employee'}
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user?.name || 'Employee'
                      )}&background=0ea5e9&color=fff&size=200`;
                    }}
                  />
                </div>

                <div className="text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base md:text-lg font-semibold">{user?.name || 'Employee'}</span>
                    {/* Role chip */}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${roleChip}`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      {role === 'admin' ? 'Admin' : 'Employee'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur px-2.5 py-1 rounded-full border border-white/25 text-[12px]">
                      <Building className="w-3.5 h-3.5" />
                      {employee?.department || '—'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur px-2.5 py-1 rounded-full border border-white/25 text-[12px] capitalize">
                      <Briefcase className="w-3.5 h-3.5" />
                      {employee?.designation || role}
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur px-2.5 py-1 rounded-full border border-white/25 text-[12px]">
                      <User className="w-3.5 h-3.5" />
                      ID: {employee?.employeeId}
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT: greeting + time */}
              <div className="lg:justify-end lg:text-right flex items-center">
                <div className="ml-0 lg:ml-auto">
                  <div className="flex lg:justify-end items-center gap-2 text-white">
                    <Glyph />
                    <div className="text-xl md:text-2xl font-bold">{greeting}</div>
                    <div className="opacity-80">•</div>
                    <div className="tabular-nums text-2xl md:text-3xl font-extrabold">{timeStr}</div>
                  </div>
                  <div className="text-white/90 mt-1 text-sm md:text-base font-semibold">
                    {user?.name || 'Employee'}
                  </div>
                </div>
              </div>
            </div>

            {/* Header actions */}
            <div className="flex flex-wrap items-center gap-2.5 mt-5">
              <button
                onClick={() => navigate(`/employee-dashboard/leaves/${user?.employeeId || user?._id}`)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/15 text-white font-semibold rounded-lg border border-white/30 hover:bg-white/25 transition text-[13px]"
              >
                <Calendar className="w-4 h-4" />
                My Leaves
              </button>
              <button
                onClick={() => navigate(`/employee-dashboard/salary/${employeeId}`)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/15 text-white font-semibold rounded-lg border border-white/30 hover:bg-white/25 transition text-[13px]"
              >
                <DollarSign className="w-4 h-4" />
                My Payroll
              </button>
              <button
                onClick={() => navigate('/employee-dashboard/settings')}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/15 text-white font-semibold rounded-lg border border-white/30 hover:bg-white/25 transition text-[13px]"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-rose-500/90 text-white font-semibold rounded-lg border border-rose-400/40 hover:bg-rose-600 transition text-[13px]"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
        {/* /HEADER  */}

        {/* QUICK ACTIONS */}
        <div className="bg-white rounded-2xl shadow-xl p-5 border border-slate-200">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-2.5 rounded-xl shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
              <p className="text-slate-600 text-xs">Your frequently used areas</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
            <button
              onClick={() => navigate('/employee-dashboard')}
              className="group bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 hover:shadow-lg hover:-translate-y-1 transition"
            >
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 w-12 h-12 rounded-lg flex items-center justify-center mb-2.5 mx-auto group-hover:scale-110 transition">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <p className="text-[13px] font-bold text-center text-slate-800">Dashboard</p>
            </button>

            <button
              onClick={() => navigate(`/employee-dashboard/profile/${employeeId}`)}
              className="group bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 hover:shadow-lg hover:-translate-y-1 transition"
            >
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-12 h-12 rounded-lg flex items-center justify-center mb-2.5 mx-auto group-hover:scale-110 transition">
                <User className="w-6 h-6 text-white" />
              </div>
              <p className="text-[13px] font-bold text-center text-slate-800">My Profile</p>
            </button>

            <button
              onClick={() => navigate(`/employee-dashboard/Leaves/${employeeId}`)}
              className="group bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 hover:shadow-lg hover:-translate-y-1 transition"
            >
              <div className="bg-gradient-to-br from-orange-500 to-rose-600 w-12 h-12 rounded-lg flex items-center justify-center mb-2.5 mx-auto group-hover:scale-110 transition">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <p className="text-[13px] font-bold text-center text-slate-800">Leaves</p>
            </button>

            <button
              onClick={() => navigate(`/employee-dashboard/salary/${employeeId}`)}
              className="group bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 hover:shadow-lg hover:-translate-y-1 transition"
            >
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-12 h-12 rounded-lg flex items-center justify-center mb-2.5 mx-auto group-hover:scale-110 transition">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <p className="text-[13px] font-bold text-center text-slate-800">PayRoll</p>
            </button>

            <button
              onClick={() => navigate('/employee-dashboard/reports')}
              className="group bg-gradient-to-br from-indigo-50 to-sky-50 border border-indigo-200 rounded-xl p-4 hover:shadow-lg hover:-translate-y-1 transition"
            >
              <div className="bg-gradient-to-br from-indigo-500 to-sky-600 w-12 h-12 rounded-lg flex items-center justify-center mb-2.5 mx-auto group-hover:scale-110 transition">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <p className="text-[13px] font-bold text-center text-slate-800">Reports</p>
            </button>

            <button
              onClick={handleLogout}
              className="group bg-gradient-to-br from-rose-50 to-red-50 border border-rose-200 rounded-xl p-4 hover:shadow-lg hover:-translate-y-1 transition"
            >
              <div className="bg-gradient-to-br from-red-500 to-rose-600 w-12 h-12 rounded-lg flex items-center justify-center mb-2.5 mx-auto group-hover:scale-110 transition">
                <LogOut className="w-6 h-6 text-white" />
              </div>
              <p className="text-[13px] font-bold text-center text-slate-800">Logout</p>
            </button>
          </div>
        </div>

        {/* 🔹 TODAY'S ATTENDANCE CARD WITH CLOCK-IN BUTTON */}
        <div className="bg-white rounded-2xl shadow-xl p-5 border border-slate-200">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-emerald-400 to-green-500 p-2.5 rounded-xl shadow-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Today&apos;s Attendance</h3>
                <p className="text-slate-600 text-xs">Mark your presence from an authorized network</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-500">Status</p>
              <p className="text-sm font-semibold text-slate-900">
                {attLoading ? 'Checking…' : isClockedIn ? 'Clocked In' : 'Not Clocked In'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Total hours today:{' '}
                <span className="font-semibold text-indigo-600">
                  {todayAttendance?.totalHours?.toFixed?.(2) || '0.00'}
                </span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-50">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Clock In</p>
                <p className="text-sm font-semibold text-slate-900">
                  {todayAttendance?.clockInTime
                    ? new Date(todayAttendance.clockInTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-50">
                <Clock className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Clock Out</p>
                <p className="text-sm font-semibold text-slate-900">
                  {todayAttendance?.clockOutTime
                    ? new Date(todayAttendance.clockOutTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—'}
                </p>
              </div>
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-slate-700">
                <Wifi className="w-4 h-4 text-sky-600" />
                <span className="font-semibold">Your IP:</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-xs">
                  {clientIp || 'Unknown'}
                </span>
              </div>
              {ALLOWED_IPS.length > 0 && (
                <div className="flex items-start gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-indigo-500 mt-0.5" />
                  <span className="text-xs">
                    <span className="font-semibold">Allowed IP(s): </span>
                    {ALLOWED_IPS.join(', ')}
                  </span>
                </div>
              )}
              <div className="mt-1">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                    ipMatch
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {ipMatch ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      IP Verified
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      IP Not Allowed
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {attError && (
            <div className="mb-3 flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4" />
              <span>{attError}</span>
            </div>
          )}

          {attSuccess && (
            <div className="mb-3 flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <CheckCircle className="w-4 h-4" />
              <span>{attSuccess}</span>
            </div>
          )}

          <div className="flex items-center justify-between flex-wrap gap-3">
            <button
              onClick={handleAttendanceClick}
              disabled={actionLoading || attLoading}
              className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow-lg transition-all bg-gradient-to-r ${buttonColorClass} disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {actionLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Processing...
                </>
              ) : (
                <>
                  {buttonIcon}
                  {buttonLabel}
                </>
              )}
            </button>

            <p className="text-xs text-slate-500 max-w-md">
              Your attendance is recorded with time and IP address. The button is{' '}
              <span className="font-semibold text-green-600">green</span> when you are on an allowed IP, and{' '}
              <span className="font-semibold text-red-600">red</span> when not.
            </p>
          </div>
        </div>

        {/* LEAVE / PAY METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <DashboardCard
            title="Leave Balance (Total)"
            value={`${totalRemaining} day(s)`}
            subtitle={
              balance
                ? `Casual ${balance.remainingLeaves?.casual || 0} • Sick ${balance.remainingLeaves?.sick || 0} • Annual ${
                    balance.remainingLeaves?.annual || 0
                  }`
                : balError || '—'
            }
            gradient="from-emerald-50 to-emerald-100"
            border="border-emerald-200"
            Icon={ClipboardList}
            onClick={() => navigate(`/employee-dashboard/EmployeeLeaves/${employeeId}`)}
          />
          <DashboardCard
            title="Leave Used (YTD)"
            value={`${totalUsed} day(s)`}
            subtitle="Approved + Pending"
            gradient="from-amber-50 to-amber-100"
            border="border-amber-200"
            Icon={Calendar}
            onClick={() => navigate(`/employee-dashboard/EmployeeLeaves/${employeeId}`)}
          />
          <DashboardCard
            title="Upcoming Leaves"
            value={`${upcomingLeavesCount}`}
            subtitle="Starting today or later"
            gradient="from-indigo-50 to-indigo-100"
            border="border-indigo-200"
            Icon={Activity}
            onClick={() => navigate(`/employee-dashboard/EmployeeLeaves/${employeeId}`)}
          />
          <DashboardCard
            title="Net Salary"
            value={fmtMoney(net)}
            subtitle={`Gross: ${fmtMoney(gross)}`}
            gradient="from-sky-50 to-cyan-100"
            border="border-cyan-200"
            Icon={DollarSign}
            onClick={() => navigate(`/employee-dashboard/salary/${employeeId}`)}
          />
        </div>

        {/* RECENT LEAVE ACTIVITY */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="bg-gradient-to-r from-cyan-600 to-indigo-600 p-5 md:p-6">
            <h2 className="text-white text-base md:text-lg font-bold flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Leave Activity
            </h2>
            <p className="text-cyan-100 text-xs mt-1">Latest updates from your leave requests</p>
          </div>

          <div className="p-5 md:p-6">
            {histError ? (
              <div className="text-rose-600 text-sm">{histError}</div>
            ) : (leaves || []).length === 0 ? (
              <div className="text-slate-600 text-sm">You have no leave applications yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Dates</th>
                      <th className="px-3 py-2">Days</th>
                      <th className="px-3 py-2">Reason</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Applied</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.slice(0, 6).map((lv) => (
                      <tr key={lv._id} className="bg-white border border-slate-200">
                        <td className="px-3 py-3 font-semibold text-slate-900 capitalize">{lv.leaveType}</td>
                        <td className="px-3 py-3 text-slate-700">
                          {fmtDate(lv.startDate)} – {fmtDate(lv.endDate)}
                        </td>
                        <td className="px-3 py-3 text-slate-700">{lv.days}</td>
                        <td className="px-3 py-3 text-slate-700 max-w-[320px] line-clamp-2">{lv.reason}</td>
                        <td className="px-3 py-3">
                          <StatusBadge status={lv.status} />
                        </td>
                        <td className="px-3 py-3 text-slate-700">{fmtDate(lv.appliedDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => navigate(`/employee-dashboard/EmployeeLeaves/${employeeId}`)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-sm"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        {/* /RECENT LEAVE ACTIVITY */}
      </div>
    </div>
  );
};

export default EmployeeDashboardHome;
