// AdminDashboard.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/authContext';
import AdminSidebar from '../components/dashboard/AdminSidebar';
import { FaUserCircle, FaSignOutAlt, FaBell, FaCalendarPlus, FaList, FaTimes } from 'react-icons/fa';

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  // Leave management state
  const [showLeaveDropdown, setShowLeaveDropdown] = useState(false);
  const [showApplyLeaveModal, setShowApplyLeaveModal] = useState(false);
  const [showManageLeaveModal, setShowManageLeaveModal] = useState(false);

  // Leave application form state
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'vacation',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Mock leave data
  const [leaves, setLeaves] = useState([
    {
      id: 1,
      employeeName: 'John Doe',
      leaveType: 'vacation',
      startDate: '2025-01-15',
      endDate: '2025-01-18',
      totalDays: 4,
      reason: 'Family vacation',
      status: 'pending',
      appliedDate: '2025-01-10'
    },
    {
      id: 2,
      employeeName: 'Jane Smith',
      leaveType: 'sick',
      startDate: '2025-01-12',
      endDate: '2025-01-14',
      totalDays: 3,
      reason: 'Medical treatment',
      status: 'approved',
      appliedDate: '2025-01-08'
    }
  ]);

  // Calculate total days between dates
  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  };

  // Handle leave form input changes
  const handleLeaveFormChange = (e) => {
    const { name, value } = e.target;
    setLeaveForm(prev => ({ ...prev, [name]: value }));
  };

  // Submit leave application
  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newLeave = {
        id: Date.now(),
        employeeName: user?.name || 'Current User',
        leaveType: leaveForm.leaveType,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        totalDays: calculateDays(leaveForm.startDate, leaveForm.endDate),
        reason: leaveForm.reason,
        status: 'pending',
        appliedDate: new Date().toISOString().split('T')[0]
      };
      
      setLeaves(prev => [newLeave, ...prev]);
      setSubmitMessage('Leave application submitted successfully!');
      
      setLeaveForm({
        leaveType: 'vacation',
        startDate: '',
        endDate: '',
        reason: ''
      });
      
      setTimeout(() => {
        setShowApplyLeaveModal(false);
        setSubmitMessage('');
      }, 2000);
      
    } catch (error) {
      setSubmitMessage('Failed to submit leave application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Approve/Reject leave
  const handleLeaveAction = (leaveId, action) => {
    setLeaves(prev => 
      prev.map(leave => 
        leave.id === leaveId 
          ? { ...leave, status: action, reviewedDate: new Date().toISOString().split('T')[0] }
          : leave
      )
    );
  };

  // Get pending leaves count
  const pendingCount = leaves.filter(leave => leave.status === 'pending').length;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        
        {/* Enhanced Navbar */}
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
              {/* Enhanced Leave Management Button */}
              <div className="relative">
                <button
                  onClick={() => setShowLeaveDropdown(!showLeaveDropdown)}
                  className="group flex items-center gap-3 bg-white/15 backdrop-blur-sm hover:bg-white/25 px-5 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <FaCalendarPlus className="text-xl group-hover:scale-110 transition-transform duration-300" />
                  <span className="hidden sm:inline">Leave Management</span>
                  {pendingCount > 0 && (
                    <span className="bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-lg animate-pulse">
                      {pendingCount}
                    </span>
                  )}
                </button>

                {/* Enhanced Leave Dropdown */}
                {showLeaveDropdown && (
                  <div className="absolute top-full mt-3 right-0 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl z-50 min-w-64 border border-white/20 overflow-hidden">
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowApplyLeaveModal(true);
                          setShowLeaveDropdown(false);
                        }}
                        className="group w-full text-left px-6 py-4 text-slate-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 flex items-center gap-4 transition-all duration-300"
                      >
                        <div className="p-2 bg-indigo-100 group-hover:bg-indigo-200 rounded-xl transition-colors duration-300">
                          <FaCalendarPlus className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-semibold">Apply for Leave</p>
                          <p className="text-sm text-slate-500">Submit a new leave request</p>
                        </div>
                      </button>
                      
                      {(user?.role === 'admin' || user?.role === 'manager') && (
                        <button
                          onClick={() => {
                            setShowManageLeaveModal(true);
                            setShowLeaveDropdown(false);
                          }}
                          className="group w-full text-left px-6 py-4 text-slate-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 flex items-center gap-4 transition-all duration-300"
                        >
                          <div className="p-2 bg-indigo-100 group-hover:bg-indigo-200 rounded-xl transition-colors duration-300">
                            <FaList className="text-indigo-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">Manage Leaves</p>
                            <p className="text-sm text-slate-500">Review pending requests</p>
                          </div>
                          {pendingCount > 0 && (
                            <span className="bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-lg">
                              {pendingCount}
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

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

        {/* Enhanced Dashboard Content */}
        <main className="flex-1 py-8 px-0">
          <div className="max-w-7xl mx-auto px-8">
            {/* Enhanced Page Title */}
            <div className="mb-10 relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl opacity-10 blur-2xl"></div>
              <div className="relative">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">
                  Admin Dashboard
                </h1>
                <p className="text-slate-600 text-xl">Monitor and manage your organization efficiently</p>
              </div>
            </div>
            
            {/* Enhanced Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl opacity-20 blur-sm group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">Total Employees</h3>
                  <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">127</p>
                  <p className="text-sm text-slate-500 mt-2">+5% from last month</p>
                </div>
              </div>
              
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl opacity-20 blur-sm group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">Active Today</h3>
                  <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">98</p>
                  <p className="text-sm text-slate-500 mt-2">77% attendance rate</p>
                </div>
              </div>
              
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-3xl opacity-20 blur-sm group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-4 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">Pending Leaves</h3>
                  <p className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">{pendingCount}</p>
                  <p className="text-sm text-slate-500 mt-2">Require approval</p>
                </div>
              </div>
              
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl opacity-20 blur-sm group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">Departments</h3>
                  <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">8</p>
                  <p className="text-sm text-slate-500 mt-2">Across organization</p>
                </div>
              </div>
            </div>
            
            {/* Enhanced Recent Activities */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl opacity-10 blur-2xl"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Recent Activities
                    </h2>
                    <p className="text-slate-600">Latest updates from your organization</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="group flex items-center gap-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-2xl transition-all duration-300 border border-green-200/50 hover:border-green-300/70">
                    <div className="flex-shrink-0">
                      <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300"></div>
                    </div>
                    <div className="flex-1">
                      <span className="text-slate-800 font-semibold">John Doe checked in at 9:00 AM</span>
                      <p className="text-sm text-slate-500 mt-1">Department: Engineering • Status: On Time</p>
                    </div>
                    <div className="text-xs text-green-600 font-semibold bg-green-100 px-3 py-1 rounded-full">
                      2 min ago
                    </div>
                  </div>
                  
                  <div className="group flex items-center gap-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-2xl transition-all duration-300 border border-blue-200/50 hover:border-blue-300/70">
                    <div className="flex-shrink-0">
                      <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300"></div>
                    </div>
                    <div className="flex-1">
                      <span className="text-slate-800 font-semibold">New leave request submitted by Jane Smith</span>
                      <p className="text-sm text-slate-500 mt-1">Type: Vacation • Duration: 3 days</p>
                    </div>
                    <div className="text-xs text-blue-600 font-semibold bg-blue-100 px-3 py-1 rounded-full">
                      5 min ago
                    </div>
                  </div>
                  
                  <div className="group flex items-center gap-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 rounded-2xl transition-all duration-300 border border-yellow-200/50 hover:border-yellow-300/70">
                    <div className="flex-shrink-0">
                      <div className="w-4 h-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300"></div>
                    </div>
                    <div className="flex-1">
                      <span className="text-slate-800 font-semibold">Department meeting scheduled for 2:00 PM</span>
                      <p className="text-sm text-slate-500 mt-1">Department: Marketing • Attendees: 12</p>
                    </div>
                    <div className="text-xs text-yellow-600 font-semibold bg-yellow-100 px-3 py-1 rounded-full">
                      15 min ago
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Enhanced Apply Leave Modal */}
      {showApplyLeaveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative max-w-lg w-full transform transition-all duration-300 scale-100">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-3xl opacity-20 blur-2xl animate-pulse"></div>
            
            <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-8 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <FaCalendarPlus className="text-2xl text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Apply for Leave</h3>
                    <p className="text-indigo-100 text-lg">Submit your leave request</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowApplyLeaveModal(false)}
                  className="group p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-300"
                >
                  <FaTimes className="text-xl group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>
              
              <div className="p-10">
                {submitMessage && (
                  <div className="mb-8 relative">
                    <div className={`absolute inset-0 rounded-2xl opacity-20 blur-sm ${
                      submitMessage.includes('success') ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-rose-500'
                    }`}></div>
                    <div className={`relative p-6 backdrop-blur-sm rounded-2xl shadow-xl border-l-4 ${
                      submitMessage.includes('success') 
                        ? 'bg-green-50 border-green-500 text-green-800' 
                        : 'bg-red-50 border-red-500 text-red-800'
                    }`}>
                      <div className="flex items-center">
                        <div className={`p-3 rounded-xl mr-4 ${
                          submitMessage.includes('success') ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {submitMessage.includes('success') ? (
                            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                        <p className="font-bold text-lg">{submitMessage}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleLeaveSubmit} className="space-y-8">
                  <div className="relative">
                    <label className="block text-sm font-bold text-slate-800 mb-4">Leave Type</label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-20 blur-sm group-focus-within:opacity-30 transition-opacity duration-300"></div>
                      <select
                        name="leaveType"
                        value={leaveForm.leaveType}
                        onChange={handleLeaveFormChange}
                        className="relative w-full p-5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 text-lg font-semibold bg-white/80 backdrop-blur-sm shadow-lg focus:shadow-xl"
                        required
                      >
                        <option value="vacation">Vacation</option>
                        <option value="sick">Sick Leave</option>
                        <option value="personal">Personal</option>
                        <option value="emergency">Emergency</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="relative">
                      <label className="block text-sm font-bold text-slate-800 mb-4">Start Date</label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-20 blur-sm group-focus-within:opacity-30 transition-opacity duration-300"></div>
                        <input
                          type="date"
                          name="startDate"
                          value={leaveForm.startDate}
                          onChange={handleLeaveFormChange}
                          className="relative w-full p-5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 text-lg font-semibold bg-white/80 backdrop-blur-sm shadow-lg focus:shadow-xl"
                          required
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <label className="block text-sm font-bold text-slate-800 mb-4">End Date</label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-20 blur-sm group-focus-within:opacity-30 transition-opacity duration-300"></div>
                        <input
                          type="date"
                          name="endDate"
                          value={leaveForm.endDate}
                          onChange={handleLeaveFormChange}
                          className="relative w-full p-5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 text-lg font-semibold bg-white/80 backdrop-blur-sm shadow-lg focus:shadow-xl"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {leaveForm.startDate && leaveForm.endDate && (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl opacity-20 blur-sm"></div>
                      <div className="relative p-6 bg-blue-50 backdrop-blur-sm rounded-2xl border border-blue-200">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-100 rounded-xl">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-blue-800 font-bold text-lg">
                              Total Days: {calculateDays(leaveForm.startDate, leaveForm.endDate)}
                            </p>
                            <p className="text-blue-600 text-sm">Including weekends and holidays</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    <label className="block text-sm font-bold text-slate-800 mb-4">Reason</label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-20 blur-sm group-focus-within:opacity-30 transition-opacity duration-300"></div>
                      <textarea
                        name="reason"
                        value={leaveForm.reason}
                        onChange={handleLeaveFormChange}
                        rows="4"
                        className="relative w-full p-5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 resize-none bg-white/80 backdrop-blur-sm shadow-lg focus:shadow-xl"
                        placeholder="Please provide a reason for your leave..."
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button
                      type="button"
                      onClick={() => setShowApplyLeaveModal(false)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 py-4 px-6 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-800 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-3"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <FaCalendarPlus />
                          <span>Submit Request</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Manage Leaves Modal */}
      {showManageLeaveModal && (user?.role === 'admin' || user?.role === 'manager') && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative max-w-6xl w-full transform transition-all duration-300 scale-100">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-3xl opacity-20 blur-2xl animate-pulse"></div>
            
            <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-8 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <FaList className="text-2xl text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Manage Leave Requests</h3>
                    <p className="text-indigo-100 text-lg">Review and approve pending requests</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowManageLeaveModal(false)}
                  className="group p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-300"
                >
                  <FaTimes className="text-xl group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>
              
              <div className="p-10">
                <div className="space-y-6">
                  {leaves.map(leave => (
                    <div key={leave.id} className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-100 to-slate-200 rounded-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
                      <div className="relative border-2 border-slate-200 hover:border-indigo-300 rounded-3xl p-8 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-xl">
                                {leave.employeeName.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-bold text-2xl text-slate-900">{leave.employeeName}</h4>
                              <p className="text-lg text-slate-600 capitalize font-semibold">{leave.leaveType} Leave</p>
                            </div>
                          </div>
                          <span className={`px-4 py-2 rounded-2xl text-sm font-bold shadow-lg ${
                            leave.status === 'pending' ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-300' :
                            leave.status === 'approved' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-300' :
                            'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-300'
                          }`}>
                            {leave.status.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                            <span className="text-blue-600 font-semibold">Duration:</span>
                            <p className="text-blue-800 font-bold text-lg">{leave.totalDays} days</p>
                          </div>
                          <div className="p-4 bg-green-50 rounded-2xl border border-green-200">
                            <span className="text-green-600 font-semibold">From:</span>
                            <p className="text-green-800 font-bold text-lg">{new Date(leave.startDate).toLocaleDateString()}</p>
                          </div>
                          <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200">
                            <span className="text-purple-600 font-semibold">To:</span>
                            <p className="text-purple-800 font-bold text-lg">{new Date(leave.endDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <span className="text-slate-600 font-semibold">Reason:</span>
                          <div className="mt-3 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                            <p className="text-slate-800 text-lg leading-relaxed">{leave.reason}</p>
                          </div>
                        </div>
                        
                        {leave.status === 'pending' && (
                          <div className="flex gap-4">
                            <button
                              onClick={() => handleLeaveAction(leave.id, 'approved')}
                              className="group flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 px-6 rounded-2xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center gap-3"
                            >
                              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span>Approve Request</span>
                            </button>
                            <button
                              onClick={() => handleLeaveAction(leave.id, 'rejected')}
                              className="group flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white py-4 px-6 rounded-2xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center gap-3"
                            >
                              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              <span>Reject Request</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {leaves.length === 0 && (
                    <div className="text-center py-16">
                      <div className="p-6 bg-slate-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                        <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-700 mb-2">No Leave Requests</h3>
                      <p className="text-slate-500 text-lg">All requests have been processed or none submitted yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showLeaveDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowLeaveDropdown(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;