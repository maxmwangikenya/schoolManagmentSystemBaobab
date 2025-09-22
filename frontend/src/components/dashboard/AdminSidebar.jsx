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
    { to: '/salary', icon: FaMoneyBillWave, label: 'Payroll' },
    { to: '/reports', icon: FaChartBar, label: 'Reports' },
    { to: '/attendance', icon: FaCalendarCheck, label: 'Attendance' },
    { to: '/settings', icon: FaCog, label: 'Settings' }
  ];

  return (
    <div className="w-72 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white min-h-screen shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-4 rounded-xl shadow-lg">
          <h3 
            style={{ fontFamily: 'Pacifico, cursive' }} 
            className="text-2xl md:text-3xl text-white text-center font-bold tracking-wide"
          >
            Employee MS
          </h3>
          <p className="text-center text-teal-100 text-sm mt-1">Management System</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin-dashboard'} // Add exact matching for dashboard
                className={({ isActive }) => {
                  return `group flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-400/30 to-teal-500/70 text-white shadow-lg transform scale-105'
                      : 'text-gray-300 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-purple-600/20 hover:text-white hover:transform hover:scale-102'
                  }`;
                }}
              >
                {({ isActive }) => (
                  <>
                    <div className={`p-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-white/20' 
                        : 'bg-gray-700/50 group-hover:bg-blue-500/20'
                    }`}>
                      <IconComponent className="text-lg" />
                    </div>
                    <span className="font-medium tracking-wide">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-6 border-t border-gray-700/50">
          <div className="bg-gradient-to-r from-blue-600/10 to-teal-500/10 p-4 rounded-xl border border-gray-700/30">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Quick Stats</h4>
            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex justify-between">
                <span>Total Employees:</span>
                <span className="text-teal-400 font-semibold">127</span>
              </div>
              <div className="flex justify-between">
                <span>Active Today:</span>
                <span className="text-green-400 font-semibold">98</span>
              </div>
              <div className="flex justify-between">
                <span>Pending Leaves:</span>
                <span className="text-yellow-400 font-semibold">5</span>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default AdminSidebar;