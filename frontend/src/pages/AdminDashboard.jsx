// src/components/AdminDashboardHome.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import axios from 'axios';
import {
  Users,
  Clock,
  Building,
  TrendingUp,
  Activity,
  Zap,
  Calendar,
  DollarSign,
  FileText,
  Settings,
  ArrowRight,
  BarChart3,
  LogOut,
  CheckCircle
} from 'lucide-react';

const AdminDashboardHome = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const API_BASE_URL = import.meta.env.VITE_BACKENDAPI;
  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    }),
    []
  );

  // Time for header badge
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  // Live stats
  const [stats, setStats] = useState({
    totalEmployees: 0,
    departments: 0,
    pendingLeaves: 0,
    newHires30d: 0,
    momChange: 0, // absolute change vs previous 30 days
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) logout();
  };

  const updateDateTime = () => {
    const now = new Date();
    setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    setCurrentDate(now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
  };

  useEffect(() => {
    updateDateTime();
    const t = setInterval(updateDateTime, 60_000);
    return () => clearInterval(t);
  }, []);

  // Fetch dashboard stats (no attendance endpoints)
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);

      const [empRes, depRes, leaveRes] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/api/employees`, { headers: authHeaders }),
        axios.get(`${API_BASE_URL}/api/departments`, { headers: authHeaders }),
        axios.get(`${API_BASE_URL}/api/leaves`, { headers: authHeaders }), // admin list
      ]);

      const employees = empRes.status === 'fulfilled'
        ? (empRes.value.data?.employees || [])
        : [];

      const departments = depRes.status === 'fulfilled'
        ? (depRes.value.data?.departments || [])
        : [];

      const leaves = leaveRes.status === 'fulfilled'
        ? (leaveRes.value.data?.leaves || leaveRes.value.data || [])
        : [];

      const totalEmployees = employees.length;
      const pendingLeaves = Array.isArray(leaves)
        ? leaves.filter(l => String(l?.status || '').toLowerCase() === 'pending').length
        : 0;

      // New hires last 30 days + MoM absolute change (requires createdAt on employees)
      const now = Date.now();
      const day = 24 * 60 * 60 * 1000;
      const last30 = employees.filter(e => {
        const t = e?.createdAt ? new Date(e.createdAt).getTime() : 0;
        return t >= (now - 30 * day);
      }).length;

      const prev30 = employees.filter(e => {
        const t = e?.createdAt ? new Date(e.createdAt).getTime() : 0;
        return t < (now - 30 * day) && t >= (now - 60 * day);
      }).length;

      setStats({
        totalEmployees,
        departments: departments.length,
        pendingLeaves,
        newHires30d: last30,
        momChange: last30 - prev30, // absolute change
      });
    } catch (err) {
      console.error('Dashboard stats error:', err);
      setStatsError('Failed to load live stats');
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE_URL]);

  const quickActions = [
    { icon: Users,     label: 'Employees',  color: 'from-blue-500 to-cyan-600',    action: () => navigate('/admin-dashboard/employees'),   bgColor: 'from-blue-50 to-cyan-50',     borderColor: 'border-blue-200' },
    { icon: Building,  label: 'Departments',color: 'from-purple-500 to-pink-600',  action: () => navigate('/admin-dashboard/departments'), bgColor: 'from-purple-50 to-pink-50',   borderColor: 'border-purple-200' },
    { icon: DollarSign,label: 'Salaries',   color: 'from-green-500 to-emerald-600',action: () => navigate('/admin-dashboard/salaries'),    bgColor: 'from-green-50 to-emerald-50', borderColor: 'border-green-200' },
    { icon: FileText,  label: 'Payroll',    color: 'from-emerald-500 to-teal-600', action: () => navigate('/admin-dashboard/payroll'),     bgColor: 'from-emerald-50 to-teal-50',  borderColor: 'border-emerald-200' },
    { icon: Calendar,  label: 'Leaves',     color: 'from-orange-500 to-red-600',   action: () => navigate('/admin-dashboard/leaves'),      bgColor: 'from-orange-50 to-red-50',    borderColor: 'border-orange-200' },
    { icon: FileText,  label: 'Reports',    color: 'from-indigo-500 to-purple-600',action: () => navigate('/admin-dashboard/report/ReportList'), bgColor: 'from-indigo-50 to-purple-50', borderColor: 'border-indigo-200' },
    { icon: Settings,  label: 'Settings',   color: 'from-gray-500 to-slate-600',   action: () => navigate('/admin-dashboard/settings'),    bgColor: 'from-gray-50 to-slate-50',    borderColor: 'border-gray-200' },
    { icon: LogOut,    label: 'Logout',     color: 'from-red-500 to-rose-600',     action: () => handleLogout(),                           bgColor: 'from-red-50 to-rose-50',      borderColor: 'border-red-200' },
  ];

  const recentActivities = [
    { id: 1, message: 'John Doe profile updated', subtext: 'Department: Engineering', time: '2 min ago', color: 'text-green-600', bg: 'bg-green-100', borderColor: 'border-green-200', gradientFrom: 'from-green-50', gradientTo: 'to-emerald-50' },
    { id: 2, message: 'New leave request submitted', subtext: 'Type: Vacation • 3 days', time: '5 min ago', color: 'text-blue-600', bg: 'bg-blue-100', borderColor: 'border-blue-200', gradientFrom: 'from-blue-50', gradientTo: 'to-indigo-50' },
    { id: 3, message: 'Department meeting scheduled', subtext: 'Marketing • 2:00 PM', time: '15 min ago', color: 'text-yellow-600', bg: 'bg-yellow-100', borderColor: 'border-yellow-200', gradientFrom: 'from-yellow-50', gradientTo: 'to-orange-50' },
    { id: 4, message: 'New employee onboarded - Sarah Wilson', subtext: 'Sales • Start Date: Today', time: '1 hour ago', color: 'text-purple-600', bg: 'bg-purple-100', borderColor: 'border-purple-200', gradientFrom: 'from-purple-50', gradientTo: 'to-pink-50' },
  ];

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';
  const greetingEmoji = currentHour < 12 ? '🌅' : currentHour < 18 ? '☀️' : '🌙';
  const userRole = user?.role === 'admin' ? 'Admin' : 'Employee';
  const roleColor = user?.role === 'admin' ? 'bg-purple-500' : 'bg-blue-500';

  return (
    <div className="p-6 md:p-8 space-y-6 md:space-y-8">
      {/* Hero Banner (no clock-in) */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="absolute top-0 right-0 w-72 h-72 md:w-96 md:h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 md:w-96 md:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="relative px-6 md:px-8 py-8 md:py-10">
          {/* Date & Time (Top Right) */}
          <div className="flex justify-end mb-4">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
              <div className="flex items-center gap-3 text-white">
                <Clock className="w-4 h-4" />
                <div className="text-right">
                  <p className="text-sm font-bold">{currentTime}</p>
                  <p className="text-xs opacity-90">{currentDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Greeting */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 text-center md:text-left">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
                <img
                  src={user?.profileImage || `https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=6366f1&color=fff`}
                  alt="Profile"
                  className="relative w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white shadow-2xl object-cover"
                />
                <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 ${roleColor} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg`}>
                  {userRole}
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {greeting}, {user?.name || 'Admin'}! {greetingEmoji}
                </h1>
                <p className="text-white/90 text-base md:text-lg">Welcome back to your dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid (live data, no attendance) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Employees */}
        <div
          className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transform hover:-translate-y-2 transition-all cursor-pointer"
          onClick={() => navigate('/admin-dashboard/employees')}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 md:p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-gray-600 text-xs md:text-sm font-bold uppercase tracking-wide mb-2">Total Employees</h3>
            <p className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              {statsLoading ? '—' : stats.totalEmployees}
            </p>
            <p className="text-blue-600 text-xs md:text-sm font-semibold">
              {statsLoading ? 'Loading…' : 'Organization headcount'}
            </p>
          </div>
        </div>

        {/* Pending Leaves */}
        <div
          className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transform hover:-translate-y-2 transition-all cursor-pointer"
          onClick={() => navigate('/admin-dashboard/leaves')}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-3 md:p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-yellow-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-gray-600 text-xs md:text-sm font-bold uppercase tracking-wide mb-2">Pending Leaves</h3>
            <p className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              {statsLoading ? '—' : stats.pendingLeaves}
            </p>
            <p className="text-yellow-600 text-xs md:text-sm font-semibold">Require approval</p>
          </div>
        </div>

        {/* Departments */}
        <div
          className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transform hover:-translate-y-2 transition-all cursor-pointer"
          onClick={() => navigate('/admin-dashboard/departments')}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 md:p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                <Building className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-gray-600 text-xs md:text-sm font-bold uppercase tracking-wide mb-2">Departments</h3>
            <p className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              {statsLoading ? '—' : stats.departments}
            </p>
            <p className="text-purple-600 text-xs md:text-sm font-semibold">Across organization</p>
          </div>
        </div>

        {/* New Hires (Last 30 Days) + MoM change */}
        <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transform hover:-translate-y-2 transition-all cursor-pointer">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 md:p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 text-xs md:text-sm font-bold uppercase tracking-wide mb-2">New Hires (Last 30 Days)</h3>
            <p className="text-4xl md:text-5xl font-bold text-gray-900 mb-1">
              {statsLoading ? '—' : stats.newHires30d}
            </p>
            <p className={`text-xs md:text-sm font-semibold ${stats.momChange >= 0 ? 'text-green-600' : 'text-rose-600'}`}>
              {statsLoading ? '' : `${stats.momChange >= 0 ? '+' : ''}${stats.momChange} vs previous 30 days`}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-2.5 md:p-3 rounded-xl shadow-lg">
            <Zap className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Quick Actions</h2>
            <p className="text-gray-600 text-xs md:text-sm">Access key management features</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-3 md:gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`group relative bg-gradient-to-br ${action.bgColor} hover:shadow-xl rounded-xl md:rounded-2xl p-4 md:p-6 transition-all transform hover:scale-105 border ${action.borderColor}`}
            >
              <div className={`bg-gradient-to-br ${action.color} w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 mx-auto group-hover:scale-110 transition-transform shadow-lg`}>
                <action.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <p className="text-xs md:text-sm font-bold text-gray-800 text-center">{action.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-5 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 md:w-6 md:h-6" />
              Recent Activities
            </h2>
            <p className="text-blue-100 text-xs md:text-sm mt-1">Latest updates from your organization</p>
          </div>

          <div className="p-5 md:p-6 space-y-3">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className={`flex items-start gap-3 md:gap-4 p-4 md:p-5 bg-gradient-to-r ${activity.gradientFrom} ${activity.gradientTo} rounded-xl hover:shadow-md transition-all border ${activity.borderColor}`}
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${activity.bg}`}>
                  <CheckCircle className={`w-5 h-5 md:w-6 md:h-6 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-bold text-gray-800">{activity.message}</p>
                  <p className="text-xs text-gray-600 mt-1">{activity.subtext}</p>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overview side cards */}
        <div className="lg:col-span-1 space-y-4 md:space-y-6">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-5 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
                Overview
              </h2>
            </div>

            <div className="p-5 md:p-6 space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-blue-700">New Hires (30d)</span>
                  <span className="text-lg font-bold text-blue-900">
                    {statsLoading ? '—' : stats.newHires30d}
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-600 h-full rounded-full transition-all" style={{ width: `${statsLoading ? 0 : Math.min(100, stats.newHires30d * 10)}%` }} />
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-green-700">MoM Change</span>
                  <span className={`text-lg font-bold ${stats.momChange >= 0 ? 'text-green-900' : 'text-rose-900'}`}>
                    {statsLoading ? '—' : `${stats.momChange >= 0 ? '+' : ''}${stats.momChange}`}
                  </span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-full rounded-full transition-all" style={{ width: `${statsLoading ? 0 : Math.min(100, Math.abs(stats.momChange) * 10)}%` }} />
                </div>
              </div>

              {statsError && <p className="text-xs text-red-600 font-semibold">{statsError}</p>}
            </div>
          </div>

          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 md:w-6 md:h-6" />
                Quick Stats
              </h2>
            </div>

            <div className="p-5 md:p-6 space-y-3">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                <span className="text-xs font-semibold text-gray-700">Total Employees</span>
                <span className="text-lg font-bold text-blue-600">{statsLoading ? '—' : stats.totalEmployees}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <span className="text-xs font-semibold text-gray-700">Pending Leaves</span>
                <span className="text-lg font-bold text-green-600">{statsLoading ? '—' : stats.pendingLeaves}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <span className="text-xs font-semibold text-gray-700">Departments</span>
                <span className="text-lg font-bold text-purple-600">{statsLoading ? '—' : stats.departments}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHome;
