import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaUsers,
  FaBuilding,
  FaFileAlt,
  FaMoneyBillWave,
  FaCog,
  FaChartBar,
  FaCalendarCheck
} from 'react-icons/fa';

const AdminSidebar = () => {
  const menuItems = [
    { to: '/admin-dashboard', icon: FaTachometerAlt, label: 'Dashboard' },
    { to: '/admin-dashboard/employees', icon: FaUsers, label: 'Employees' },
    { to: '/admin-dashboard/departments', icon: FaBuilding, label: 'Departments' },
    { to: '/leaves', icon: FaFileAlt, label: 'Leave Management' },
    { to: '/admin-dashboard/salary', icon: FaMoneyBillWave, label: 'salary' },
    { to: '/reports', icon: FaChartBar, label: 'Reports' },
    { to: '/attendance', icon: FaCalendarCheck, label: 'Attendance' },
    { to: '/admin-dashboard/settings', icon: FaCog, label: 'Settings' }
  ];

  return (
    <div className="w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white min-h-screen shadow-2xl">
      {/* Enhanced Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl opacity-20 blur-xl animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-6 rounded-3xl shadow-2xl border border-indigo-500/20">
            <h3 
              style={{ fontFamily: 'Pacifico, cursive' }} 
              className="text-2xl md:text-3xl text-white text-center font-bold tracking-wide bg-gradient-to-r from-white to-indigo-100 bg-clip-text text-transparent"
            >
              Employee MS
            </h3>
            <p className="text-center text-indigo-100 text-sm mt-2 font-medium">Management System</p>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Menu */}
      <nav className="p-6">
        <div className="space-y-3">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin-dashboard'} // Add exact matching for dashboard
                className={({ isActive }) => {
                  return `group relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600/40 via-purple-600/40 to-indigo-600/40 text-white shadow-xl transform scale-105 border border-indigo-400/30'
                      : 'text-slate-300 hover:bg-gradient-to-r hover:from-indigo-600/20 hover:via-purple-600/20 hover:to-indigo-600/20 hover:text-white hover:transform hover:scale-102 hover:shadow-lg'
                  }`;
                }}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-20 blur-sm"></div>
                    )}
                    <div className={`relative p-3 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-white/20 backdrop-blur-sm shadow-lg' 
                        : 'bg-slate-700/50 group-hover:bg-indigo-500/30 group-hover:backdrop-blur-sm'
                    }`}>
                      <IconComponent className="text-xl" />
                    </div>
                    <span className="relative font-semibold tracking-wide text-lg">{item.label}</span>
                    {isActive && (
                      <div className="absolute right-4 w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full animate-pulse shadow-lg"></div>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Enhanced Bottom Section */}
        <div className="mt-10 pt-6 border-t border-slate-700/50">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl opacity-10 blur-lg"></div>
            <div className="relative bg-gradient-to-r from-slate-800/60 via-slate-700/60 to-slate-800/60 backdrop-blur-sm p-6 rounded-2xl border border-slate-600/30 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-white">Quick Stats</h4>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
                  <span className="text-slate-300 font-medium">Total Employees:</span>
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-3 py-1 rounded-full">
                    <span className="text-white font-bold">127</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
                  <span className="text-slate-300 font-medium">Active Today:</span>
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1 rounded-full">
                    <span className="text-white font-bold">98</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
                  <span className="text-slate-300 font-medium">Pending Leaves:</span>
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-600 px-3 py-1 rounded-full animate-pulse">
                    <span className="text-white font-bold">5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default AdminSidebar;