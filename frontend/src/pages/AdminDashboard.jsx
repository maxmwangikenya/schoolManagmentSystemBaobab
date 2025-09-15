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
    <div className="flex min-h-screen bg-gray-00">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ">
        
        {/* 👇 NAVBAR — Full width, edge-to-edge */}
        <div className="w-full bg-gradient-to-r from-teal-600 to-teal-700 shadow-lg">
          <div className="flex items-center justify-between h-16 px-6 text-white">
            {/* Left Section - Logo/Brand */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-lg">
                  <h3 className="text-lg font-bold">Employee MS</h3>
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

            {/* Right Section — All elements properly nested inside */}
            <div className="flex items-center gap-4">
              {/* Leave Management Button */}
              <div className="relative">
                <button
                  onClick={() => setShowLeaveDropdown(!showLeaveDropdown)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition-all duration-200"
                >
                  <FaCalendarPlus className="text-lg" />
                  <span className="hidden sm:inline">Leave</span>
                  {pendingCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{pendingCount}</span>
                  )}
                </button>

                {/* Leave Dropdown */}
                {showLeaveDropdown && (
                  <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl z-50 min-w-48">
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowApplyLeaveModal(true);
                          setShowLeaveDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <FaCalendarPlus className="text-teal-600" />
                        Apply for Leave
                      </button>
                      
                      {(user?.role === 'admin' || user?.role === 'manager') && (
                        <button
                          onClick={() => {
                            setShowManageLeaveModal(true);
                            setShowLeaveDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <FaList className="text-teal-600" />
                          Manage Leaves
                          {pendingCount > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-auto">{pendingCount}</span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

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
        </div> {/* ✅ End Navbar Container — All elements properly nested */}

        {/* ✅ Dashboard Content — Fixed horizontal padding */}
        <main className="flex-1 py-6 px-0">
          <div className="max-w-7xl mx-auto px-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
            
            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Employees</h3>
                <p className="text-3xl font-bold text-blue-600">127</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Active Today</h3>
                <p className="text-3xl font-bold text-green-600">98</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Pending Leaves</h3>
                <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Departments</h3>
                <p className="text-3xl font-bold text-purple-600">8</p>
              </div>
            </div>
            
            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activities</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">John Doe checked in at 9:00 AM</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">New leave request submitted by Jane Smith</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700">Department meeting scheduled for 2:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modals & Overlay */}
      {/* Apply Leave Modal */}
      {showApplyLeaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="bg-teal-600 text-white p-4 rounded-t-lg flex justify-between items-center">
              <h3 className="text-lg font-bold">Apply for Leave</h3>
              <button onClick={() => setShowApplyLeaveModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6">
              {submitMessage && (
                <div className={`p-3 rounded mb-4 ${submitMessage.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {submitMessage}
                </div>
              )}
              
              <form onSubmit={handleLeaveSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
                  <select
                    name="leaveType"
                    value={leaveForm.leaveType}
                    onChange={handleLeaveFormChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  >
                    <option value="vacation">Vacation</option>
                    <option value="sick">Sick Leave</option>
                    <option value="personal">Personal</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={leaveForm.startDate}
                      onChange={handleLeaveFormChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={leaveForm.endDate}
                      onChange={handleLeaveFormChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {leaveForm.startDate && leaveForm.endDate && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      Total Days: <strong>{calculateDays(leaveForm.startDate, leaveForm.endDate)}</strong>
                    </p>
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                  <textarea
                    name="reason"
                    value={leaveForm.reason}
                    onChange={handleLeaveFormChange}
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Please provide a reason for your leave..."
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowApplyLeaveModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Manage Leaves Modal */}
      {showManageLeaveModal && (user?.role === 'admin' || user?.role === 'manager') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="bg-teal-600 text-white p-4 rounded-t-lg flex justify-between items-center">
              <h3 className="text-lg font-bold">Manage Leave Requests</h3>
              <button onClick={() => setShowManageLeaveModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {leaves.map(leave => (
                  <div key={leave.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{leave.employeeName}</h4>
                        <p className="text-sm text-gray-600 capitalize">{leave.leaveType} Leave</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        leave.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {leave.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 text-sm">
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <span className="ml-2 font-medium">{leave.totalDays} days</span>
                      </div>
                      <div>
                        <span className="text-gray-600">From:</span>
                        <span className="ml-2 font-medium">{new Date(leave.startDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">To:</span>
                        <span className="ml-2 font-medium">{new Date(leave.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <span className="text-gray-600 text-sm">Reason:</span>
                      <p className="text-gray-800 bg-gray-50 p-2 rounded mt-1">{leave.reason}</p>
                    </div>
                    
                    {leave.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLeaveAction(leave.id, 'approved')}
                          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleLeaveAction(leave.id, 'rejected')}
                          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                
                {leaves.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No leave requests found.
                  </div>
                )}
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