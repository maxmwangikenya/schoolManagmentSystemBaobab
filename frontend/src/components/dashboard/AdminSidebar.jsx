import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaUsers,
  FaBuilding,
  FaFileAlt,      // For Leaves
  FaMoneyBillWave, // For Salary
  FaCog           // For Settings
} from 'react-icons/fa';

const AdminSidebar = () => {
  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen p-4">
      <div className="mb-8">
        <h3 className="text-xl font-bold">Employee MS</h3>
      </div>
      <div className="space-y-4">
        <NavLink
          to="/admin-dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-teal-600 text-white'
                : 'text-gray-300 hover:bg-blue-600 hover:text-white' // ✅ Blue on hover
            }`
          }
        >
          <FaTachometerAlt />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/employees"
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-teal-600 text-white'
                : 'text-gray-300 hover:bg-blue-600 hover:text-white' // ✅ Blue on hover
            }`
          }
        >
          <FaUsers />
          <span>Employees</span>
        </NavLink>

        <NavLink
          to="/departments"
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-teal-600 text-white'
                : 'text-gray-300 hover:bg-blue-600 hover:text-white' // ✅ Blue on hover
            }`
          }
        >
          <FaBuilding />
          <span>Departments</span>
        </NavLink>

        <NavLink
          to="/leaves"
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-teal-600 text-white'
                : 'text-gray-300 hover:bg-blue-600 hover:text-white' // ✅ Blue on hover
            }`
          }
        >
          <FaFileAlt />
          <span>Leaves</span>
        </NavLink>

        <NavLink
          to="/salary"
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-teal-600 text-white'
                : 'text-gray-300 hover:bg-blue-600 hover:text-white' // ✅ Blue on hover
            }`
          }
        >
          <FaMoneyBillWave />
          <span>Salary</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-teal-600 text-white'
                : 'text-gray-300 hover:bg-blue-600 hover:text-white' // ✅ Blue on hover
            }`
          }
        >
          <FaCog />
          <span>Settings</span>
        </NavLink>
      </div>
    </div>
  );
};

export default AdminSidebar;