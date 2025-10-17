import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import {
  User,
  CheckCircle,
  Clock,
  Calendar,
  TrendingUp,
  Activity,
  Zap,
  DollarSign,
  FileText,
  Settings,
  ArrowRight,
  Award,
  BarChart3,
  Briefcase,
  LogOut,
  Home,
  Umbrella
} from 'lucide-react';

const EmployeeDashboardHome = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Mock data - replace with real API data
  const stats = {
    attendanceRate: 95,
    leavesAvailable: 12,
    leavesTaken: 8,
    upcomingLeaves: 2,
    lastCheckIn: '9:15 AM',
    currentSalary: '$5,000'
  };

  // Handle logout with confirmation
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  // Quick actions with navigation
  const quickActions = [
    { 
      icon: Home, 
      label: 'Dashboard', 
      color: 'from-blue-500 to-cyan-600', 
      action: () => navigate('/employee-dashboard'),
      bgColor: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200'
    },
    { 
      icon: User, 
      label: 'My Profile', 
      color: 'from-purple-500 to-pink-600', 
      action: () => navigate(`/employee-dashboard/profile/${user?.employeeId || user?._id}`),
      bgColor: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-200'
    },
    { 
      icon: Umbrella, 
      label: 'Leaves', 
      color: 'from-orange-500 to-red-600', 
      action: () => navigate(`/employee-dashboard/leave/${user?.employeeId || user?._id}`),
      bgColor: 'from-orange-50 to-red-50',
      borderColor: 'border-orange-200'
    },
    { 
      icon: DollarSign, 
      label: 'Salary', 
      color: 'from-green-500 to-emerald-600', 
      action: () => navigate(`/employee-dashboard/salary/${user?.employeeId || user?._id}`),
      bgColor: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200'
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      color: 'from-gray-500 to-slate-600', 
      action: () => navigate('/employee-dashboard/settings'),
      bgColor: 'from-gray-50 to-slate-50',
      borderColor: 'border-gray-200'
    },
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
      icon: CheckCircle, 
      message: 'Successfully checked in', 
      subtext: 'Time: 9:15 AM • Status: On Time',
      time: 'Today', 
      color: 'text-green-600', 
      bg: 'bg-green-100',
      borderColor: 'border-green-200',
      gradientFrom: 'from-green-50',
      gradientTo: 'to-emerald-50'
    },
    { 
      id: 2, 
      icon: Calendar, 
      message: 'Leave request approved', 
      subtext: 'Type: Annual Leave • Duration: 3 days',
      time: 'Yesterday', 
      color: 'text-blue-600', 
      bg: 'bg-blue-100',
      borderColor: 'border-blue-200',
      gradientFrom: 'from-blue-50',
      gradientTo: 'to-indigo-50'
    },
    { 
      id: 3, 
      icon: DollarSign, 
      message: 'Salary credited', 
      subtext: 'Amount: $5,000 • Month: October',
      time: '3 days ago', 
      color: 'text-green-600', 
      bg: 'bg-green-100',
      borderColor: 'border-green-200',
      gradientFrom: 'from-green-50',
      gradientTo: 'to-emerald-50'
    },
    { 
      id: 4, 
      icon: Award, 
      message: 'Performance review scheduled', 
      subtext: 'Date: Next Monday • Manager: John Smith',
      time: '1 week ago', 
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
      <div className="relative bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-3xl shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="absolute top-0 right-0 w-72 h-72 md:w-96 md:h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 md:w-96 md:h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative px-6 md:px-8 py-8 md:py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-8">
            {/* Left: Profile & Greeting */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 text-center md:text-left">
              {/* Avatar */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-cyan-500 to-blue-600 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
                <img
                  className="relative h-24 w-24 md:h-32 md:w-32 lg:h-36 lg:w-36 rounded-full object-cover border-4 border-white shadow-2xl transform group-hover:scale-105 transition-transform"
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Employee')}&background=0891b2&color=fff&size=200`}
                  alt={user?.name}
                />
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 md:w-10 md:h-10 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Greeting */}
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <span className="text-2xl md:text-3xl">{greetingEmoji}</span>
                  <p className="text-white/90 text-lg md:text-xl font-semibold">{greeting}!</p>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-3 drop-shadow-lg">
                  {user?.name || 'Employee Dashboard'}
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-white/30">
                    <Briefcase className="w-3 h-3 md:w-4 md:h-4 text-white" />
                    <span className="text-white font-semibold text-xs md:text-sm capitalize">{user?.role || 'Employee'}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-white/30">
                    <User className="w-3 h-3 md:w-4 md:h-4 text-white" />
                    <span className="text-white font-semibold text-xs md:text-sm">ID: {user?.employeeId || user?._id?.slice(-6)}</span>
                  </div>
                </div>
                <p className="text-white/80 mt-3 text-xs md:text-sm">Welcome to your personal workspace 🚀</p>
              </div>
            </div>

            {/* Right: Date Card */}
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
        {/* Attendance Rate */}
        <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transform hover:-translate-y-2 transition-all cursor-pointer">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 md:p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-gray-600 text-xs md:text-sm font-bold uppercase tracking-wide mb-2">Attendance</h3>
            <p className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{stats.attendanceRate}%</p>
            <p className="text-green-600 text-xs md:text-sm font-semibold">Last check-in: {stats.lastCheckIn}</p>
          </div>
        </div>

        {/* Available Leaves */}
        <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transform hover:-translate-y-2 transition-all cursor-pointer"
             onClick={() => navigate(`/employee-dashboard/leave/${user?.employeeId || user?._id}`)}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 md:p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-gray-600 text-xs md:text-sm font-bold uppercase tracking-wide mb-2">Available Leaves</h3>
            <p className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{stats.leavesAvailable}</p>
            <p className="text-blue-600 text-xs md:text-sm font-semibold">{stats.leavesTaken} days used</p>
          </div>
        </div>

        {/* Upcoming Leaves */}
        <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transform hover:-translate-y-2 transition-all cursor-pointer"
             onClick={() => navigate(`/employee-dashboard/leave/${user?.employeeId || user?._id}`)}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 md:p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-gray-600 text-xs md:text-sm font-bold uppercase tracking-wide mb-2">Upcoming Leaves</h3>
            <p className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{stats.upcomingLeaves}</p>
            <p className="text-orange-600 text-xs md:text-sm font-semibold">Scheduled this month</p>
          </div>
        </div>

        {/* Current Salary */}
        <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transform hover:-translate-y-2 transition-all cursor-pointer"
             onClick={() => navigate(`/employee-dashboard/salary/${user?.employeeId || user?._id}`)}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 md:p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-gray-600 text-xs md:text-sm font-bold uppercase tracking-wide mb-2">Current Salary</h3>
            <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stats.currentSalary}</p>
            <p className="text-purple-600 text-xs md:text-sm font-semibold">Monthly payment</p>
          </div>
        </div>
      </div>

      {/* Quick Actions - 6 ITEMS INCLUDING LOGOUT */}
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-2.5 md:p-3 rounded-xl shadow-lg">
            <Zap className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Quick Actions</h2>
            <p className="text-gray-600 text-xs md:text-sm">Access your key features</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
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
        {/* Recent Activities - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-5 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 md:w-6 md:h-6" />
              Recent Activities
            </h2>
            <p className="text-cyan-100 text-xs md:text-sm mt-1">Your latest updates and notifications</p>
          </div>
          
          <div className="p-5 md:p-6 space-y-3">
            {recentActivities.map((activity) => {
              const IconComponent = activity.icon;
              return (
                <div key={activity.id} className={`flex items-start gap-3 md:gap-4 p-4 md:p-5 bg-gradient-to-r ${activity.gradientFrom} ${activity.gradientTo} rounded-xl hover:shadow-md transition-all border ${activity.borderColor}`}>
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${activity.bg}`}>
                    <IconComponent className={`w-5 h-5 md:w-6 md:h-6 ${activity.color}`} />
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
              );
            })}
          </div>
        </div>

        {/* Personal Overview - Takes 1 column */}
        <div className="lg:col-span-1 space-y-4 md:space-y-6">
          {/* Performance Overview */}
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-5 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
                My Performance
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
                  <span className="text-xs font-semibold text-green-700">Task Completion</span>
                  <span className="text-lg font-bold text-green-900">87%</span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-full rounded-full transition-all"
                    style={{ width: '87%' }}
                  ></div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-purple-700">Projects</span>
                  <span className="text-lg font-bold text-purple-900">5</span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-600 h-full rounded-full transition-all"
                    style={{ width: '75%' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 md:w-6 md:h-6" />
                Quick Info
              </h2>
            </div>
            
            <div className="p-5 md:p-6 space-y-3">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                <span className="text-xs font-semibold text-gray-700">Department</span>
                <span className="text-sm font-bold text-blue-600">Engineering</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <span className="text-xs font-semibold text-gray-700">Join Date</span>
                <span className="text-sm font-bold text-green-600">Jan 2023</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                <span className="text-xs font-semibold text-gray-700">Manager</span>
                <span className="text-sm font-bold text-orange-600">John Smith</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboardHome;