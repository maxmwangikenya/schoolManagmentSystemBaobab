import React from 'react';
import { useAuth } from '../context/authContext';
import { FaUserCircle, FaSignOutAlt, FaBell } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="w-full flex items-center justify-between h-16 bg-gradient-to-r from-teal-600 to-teal-700 px-6 text-white shadow-lg">
      {/* Left Section - Logo/Brand */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-lg">

          </div>
          <div className="hidden md:block w-px h-8 bg-teal-400/30"></div>
          <div className="hidden md:flex items-center gap-2">
            <FaUserCircle className="text-lg text-teal-200" />
            <div>
              <p className="text-sm font-medium">Welcome back,</p>
              <p className="text-base font-semibold">{user?.name || 'Guest'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-full hover:bg-teal-500/20 transition-colors">
          <FaBell className="text-xl" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
        </button>

        {/* User Info & Logout */}
        <div className="flex items-center gap-3 pl-4 border-l border-teal-500/30">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{user?.name || 'Guest'}</p>
            <p className="text-xs text-teal-200 capitalize">{user?.role || 'User'}</p>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
          >
            <FaSignOutAlt />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;