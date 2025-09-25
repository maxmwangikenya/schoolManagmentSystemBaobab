import React from 'react';
import { useAuth } from '../../context/authContext';
import { FaUserCircle, FaSignOutAlt, FaBell } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 shadow-2xl border-b border-indigo-500/20">
      <div className="flex items-center justify-between h-20 px-8 text-white">
        {/* Left Section - Enhanced Logo/Brand */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="bg-white/15 backdrop-blur-sm p-3 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold bg-gradient-to-r from-white to-indigo-100 bg-clip-text text-transparent">
                Employee MS
              </h3>
            </div>
            <div className="hidden md:block w-px h-10 bg-indigo-400/40"></div>
            <div className="hidden md:flex items-center gap-4">
              <div className="p-2 bg-white/10 rounded-xl">
                <FaUserCircle className="text-2xl text-indigo-200" />
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-100">Welcome back,</p>
                <p className="text-lg font-bold text-white">{user?.name || 'Guest'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Enhanced */}
        <div className="flex items-center gap-6">
          {/* Enhanced Notifications */}
          <button className="relative p-4 rounded-2xl hover:bg-white/15 backdrop-blur-sm transition-all duration-300 group shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            <FaBell className="text-xl group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-rose-600 rounded-full animate-pulse shadow-lg"></span>
          </button>

          {/* Enhanced User Info & Logout */}
          <div className="flex items-center gap-4 pl-6 border-l border-indigo-400/30">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-white">{user?.name || 'Guest'}</p>
              <p className="text-xs text-indigo-200 capitalize font-medium">{user?.role || 'User'}</p>
            </div>
            <button 
              onClick={logout}
              className="group flex items-center gap-3 bg-white/15 backdrop-blur-sm hover:bg-white/25 px-5 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-105"
            >
              <FaSignOutAlt className="group-hover:rotate-12 transition-transform duration-300" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;