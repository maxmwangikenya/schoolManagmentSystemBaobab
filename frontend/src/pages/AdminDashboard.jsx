import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import {
  Users,
  CheckCircle,
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
  Briefcase,
  LogOut  // ✅ THIS IS THE LOGOUT ICON IMPORT
} from 'lucide-react';

const AdminDashboardHome = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // ✅ GET LOGOUT FUNCTION HERE

  // Stats data
  const stats = {
    totalEmployees: 127,
    activeToday: 98,
    pendingLeaves: 5,
    departments: 8,
    attendanceRate: 77,
    growthRate: 5
  };

  // ✅ LOGOUT HANDLER WITH CONFIRMATION
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  // ✅ QUICK ACTIONS - NOTICE THE LAST ITEM IS LOGOUT
  const quickActions = [
    { 
      icon: Users, 
      label: 'Employees', 
      color: 'from-blue-500 to-cyan-600', 
      action: () => navigate('/admin-dashboard/employees'),
      bgColor: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200'
    },
    { 
      icon: Building, 
      label: 'Departments', 
      color: 'from-purple-500 to-pink-600', 
      action: () => navigate('/admin-dashboard/departments'),
      bgColor: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-200'
    },
    { 
      icon: DollarSign, 
      label: 'Salaries', 
      color: 'from-green-500 to-emerald-600', 
      action: () => navigate('/admin-dashboard/salaries'),
      bgColor: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200'
    },
    { 
      icon: Calendar, 
      label: 'Leaves', 
      color: 'from-orange-500 to-red-600', 
      action: () => navigate('/admin-dashboard/leaves'),
      bgColor: 'from-orange-50 to-red-50',
      borderColor: 'border-orange-200'
    },
    { 
      icon: FileText, 
      label: 'Reports', 
      color: 'from-indigo-500 to-purple-600', 
      action: () => navigate('/admin-dashboard/reports'),
      bgColor: 'from-indigo-50 to-purple-50',
      borderColor: 'border-indigo-200'
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      color: 'from-gray-500 to-slate-600', 
      action: () => navigate('/admin-dashboard/settings'),
      bgColor: 'from-gray-50 to-slate-50',
      borderColor: 'border-gray-200'
    },
    // ✅✅✅ THIS IS THE LOGOUT BUTTON - LAST ITEM IN THE ARRAY ✅✅✅
    { 
      icon: LogOut, 
      label: 'Logout', 
      color: 'from-red-500 to-rose-600', 
      action: handleLogout,
      bgColor: 'from-red-50 to-rose-50',
      borderColor: 'border-red-200'
    }
  ];

  const recentActivities = [
    { 
      id: 1, 
      message: 'John Doe checked in at 9:00 AM', 
      subtext: 'Department: Engineering • Status: On Time',
      time: '2 min ago', 
      color: 'text-green-600', 
      bg: 'bg-green-100',
      borderColor: 'border-green-200',
      gradientFrom: 'from-green-50',
      gradientTo: 'to-emerald-50'
    },
    { 
      id: 2, 
      message: 'New leave request submitted by Jane Smith', 
      subtext: 'Type: Vacation • Duration: 3 days',
      time: '5 min ago', 
      color: 'text-blue-600', 
      bg: 'bg-blue-100',
      borderColor: 'border-blue-200',
      gradientFrom: 'from-blue-50',
      gradientTo: 'to-indigo-50'
    },
    { 
      id: 3, 
      message: 'Department meeting scheduled for 2:00 PM', 
      subtext: 'Department: Marketing • Attendees: 12',
      time: '15 min ago', 
      color: 'text-yellow-600', 
      bg: 'bg-yellow-100',
      borderColor: 'border-yellow-200',
      gradientFrom: 'from-yellow-50',
      gradientTo: 'to-orange-50'
    },
    { 
      id: 4, 
      message: 'New employee onboarded - Sarah Wilson', 
      subtext: 'Department: Sales • Start Date: Today',
      time: '1 hour ago', 
      color: 'text-purple-600', 
      bg: 'bg-purple-100',
      borderColor: 'border-purple-200',
      gradientFrom: 'from-purple-50',
      gradientTo: 'to-pink-50'
    }
  ];

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';
  const greetingEmoji = currentHour < 12 ? '🌅' : currentHour < 18 ? '☀️' : '🌙';

  return (
    <div className="p-6 md:p-8 space-y-6 md:space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="absolute top-0 right-0 w-72 h-72 md:w-96 md:h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 md:w-96 md:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative px-6 md:px-8 py-8 md:py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 text-center md:text-left">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
                <img
                  className="relative h-24 w-24 md:h-32 md:w-32 lg:h-36 lg:w-36 rounded-full object-cover border-4 border-white shadow-2xl transform group-hover:scale-105 transition-transform"
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=6366f1&color=fff&size=200`}
                  alt={user?.name}
                />
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 md:w-10 md:h-10 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <span className="text-2xl md:text-3xl">{greetingEmoji}</span>
                  <p className="text-white/90 text-lg md:text-xl font-semibold">{greeting}!</p>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-3 drop-shadow-lg">
                  {user?.name || 'Admin Dashboard'}
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-white/30">
                    <Briefcase className="w-3 h-3 md:w-4 md:h-4 text-white" />
                    <span className="text-white font-semibold text-xs md:text-sm capitalize">{user?.role || 'Administrator'}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-white/30">
                    <Building className="w-3 h-3 md:w-4 md:h-4 text-white" />
                    <span className="text-white font-semibold text-xs md:text-sm">Organization Admin</span>
                  </div>
                </div>
                <p className="text-white/80 mt-3 text-xs md:text-sm">Monitor and manage your organization efficiently 🚀</p>
              </div>
            </div>

            <div className="bg-white/15 backdrop-blur-xl rounded-2xl md:rounded-3xl p-6 md:p-8 text-center border border-white/30 shadow-2xl">
              <div className="text-white/80 text-xs md:text-sm mb-2 font-semibold uppercase tracking-wide">Today</div>
              <div className="text-5xl md:text-6xl font-bold text-white mb-2">
                {new Date().getDate()}
              </div>
              <div className="text-white text-sm md:text-base font-semibold mb-1">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              <div className="text-white/70 text-xs md:text-sm font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div 
          className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transform hover:-translate-y-2 transition-all cursor-pointer"
          onClick={() => navigate('/admin-dashboard/employees')}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 md:p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-gray-600 text-xs md:text-sm font-bold uppercase tracking-wide mb-2">Total Employees</h3>
            <p className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{stats.totalEmployees}</p>
            <p className="text-blue-600 text-xs md:text-sm font-semibold">+{stats.growthRate}% from last month</p>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transform hover:-translate-y-2 transition-all cursor-pointer">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 md:p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-gray-600 text-xs md:text-sm font-bold uppercase tracking-wide mb-2">Active Today</h3>
            <p className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{stats.activeToday}</p>
            <p className="text-green-600 text-xs md:text-sm font-semibold">{stats.attendanceRate}% attendance rate</p>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transform hover:-translate-y-2 transition-all cursor-pointer"
             onClick={() => navigate('/admin-dashboard/leaves')}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-3 md:p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-yellow-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-gray-600 text-xs md:text-sm font-bold uppercase tracking-wide mb-2">Pending Leaves</h3>
            <p className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{stats.pendingLeaves}</p>
            <p className="text-yellow-600 text-xs md:text-sm font-semibold">Require approval</p>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transform hover:-translate-y-2 transition-all cursor-pointer"
             onClick={() => navigate('/admin-dashboard/departments')}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 md:p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                <Building className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-gray-600 text-xs md:text-sm font-bold uppercase tracking-wide mb-2">Departments</h3>
            <p className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{stats.departments}</p>
            <p className="text-purple-600 text-xs md:text-sm font-semibold">Across organization</p>
          </div>
        </div>
      </div>

      {/* ✅✅✅ QUICK ACTIONS SECTION - THIS IS WHERE LOGOUT APPEARS ✅✅✅ */}
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
        
        {/* ✅ THE GRID BELOW RENDERS ALL QUICK ACTIONS INCLUDING LOGOUT (7 ITEMS) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 md:gap-4">
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

      {/* Main Content Grid */}
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
              <div key={activity.id} className={`flex items-start gap-3 md:gap-4 p-4 md:p-5 bg-gradient-to-r ${activity.gradientFrom} ${activity.gradientTo} rounded-xl hover:shadow-md transition-all border ${activity.borderColor}`}>
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
                  <span className="text-xs font-semibold text-blue-700">Attendance</span>
                  <span className="text-lg font-bold text-blue-900">{stats.attendanceRate}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-600 h-full rounded-full transition-all"
                    style={{ width: `${stats.attendanceRate}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-green-700">Growth Rate</span>
                  <span className="text-lg font-bold text-green-900">+{stats.growthRate}%</span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-full rounded-full transition-all"
                    style={{ width: '85%' }}
                  ></div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-purple-700">Satisfaction</span>
                  <span className="text-lg font-bold text-purple-900">92%</span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-600 h-full rounded-full transition-all"
                    style={{ width: '92%' }}
                  ></div>
                </div>
              </div>
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
                <span className="text-xs font-semibold text-gray-700">New This Month</span>
                <span className="text-lg font-bold text-blue-600">12</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <span className="text-xs font-semibold text-gray-700">On Leave Today</span>
                <span className="text-lg font-bold text-green-600">8</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                <span className="text-xs font-semibold text-gray-700">Remote Workers</span>
                <span className="text-lg font-bold text-orange-600">45</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHome;