import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Filter, ChevronDown, ChevronUp, History } from 'lucide-react';

const LeaveApply = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Leave History States
  const [leaves, setLeaves] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const API_BASE_URL = import.meta.env.VITE_BACKENDAPI;

  // Calculate number of days between two dates
  const calculateLeaveDays = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Fetch employee data and leave balance
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch employee data
        const employeeResponse = await axios.get(`${API_BASE_URL}/api/employees/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setEmployee(employeeResponse.data);

        // Fetch leave balance from backend
        const balanceResponse = await axios.get(`${API_BASE_URL}/api/leaves/balance/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (balanceResponse.data.success) {
          setLeaveBalance(balanceResponse.data.data);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.error || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Fetch leave history
  useEffect(() => {
    if (isHistoryOpen) {
      fetchLeaveHistory();
    }
  }, [id, filter, typeFilter, isHistoryOpen]);

  const fetchLeaveHistory = async () => {
    try {
      setHistoryLoading(true);
      let url = `${API_BASE_URL}/api/leaves/employee/${id}`;
      const params = new URLSearchParams();
      
      if (filter !== 'all') params.append('status', filter);
      if (typeFilter !== 'all') params.append('leaveType', typeFilter);
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const token = localStorage.getItem('token');
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setLeaves(response.data.leaves);
      }
    } catch (error) {
      console.error('Error fetching leave history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        icon: <Clock className="w-4 h-4" />,
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-300',
        label: 'Pending'
      },
      approved: {
        icon: <CheckCircle className="w-4 h-4" />,
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-300',
        label: 'Approved'
      },
      rejected: {
        icon: <XCircle className="w-4 h-4" />,
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-300',
        label: 'Rejected'
      }
    };

    const badge = badges[status] || badges.pending;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${badge.bg} ${badge.text} ${badge.border}`}>
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  const getLeaveTypeBadge = (type) => {
    const colors = {
      casual: 'bg-blue-100 text-blue-800 border-blue-300',
      sick: 'bg-purple-100 text-purple-800 border-purple-300'
    };

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${colors[type] || colors.casual}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const stats = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === 'pending').length,
    approved: leaves.filter(l => l.status === 'approved').length,
    rejected: leaves.filter(l => l.status === 'rejected').length
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage('');

    try {
      // Basic frontend validation
      if (!formData.startDate || !formData.endDate) {
        throw new Error('Please select both start and end dates');
      }

      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        throw new Error('End date must be after start date');
      }

      if (formData.reason.trim().length < 10) {
        throw new Error('Reason must be at least 10 characters');
      }

      const leaveDays = calculateLeaveDays(formData.startDate, formData.endDate);

      const token = localStorage.getItem('token');
      
      const leaveData = {
        employeeId: id,
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        days: leaveDays
      };

      // Submit leave application
      const response = await axios.post(`${API_BASE_URL}/api/leaves`, leaveData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSuccessMessage(response.data.message || 'Leave application submitted successfully!');
        
        // Reset form
        setFormData({
          leaveType: 'casual',
          startDate: '',
          endDate: '',
          reason: ''
        });

        // Refresh leave balance
        const balanceResponse = await axios.get(`${API_BASE_URL}/api/leaves/balance/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (balanceResponse.data.success) {
          setLeaveBalance(balanceResponse.data.data);
        }

        // Refresh leave history if it's open
        if (isHistoryOpen) {
          fetchLeaveHistory();
        }

        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
      }

    } catch (err) {
      console.error('Error submitting leave:', err);
      // Use backend error message if available
      const errorMessage = err.response?.data?.error || err.message || 'Failed to submit leave application';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!employee || !leaveBalance) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <p className="text-gray-600 text-lg">Employee data not found</p>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  const requestedDays = calculateLeaveDays(formData.startDate, formData.endDate);
  const availableBalance = formData.leaveType === 'casual' 
    ? leaveBalance.remainingLeaves.casual 
    : leaveBalance.remainingLeaves.sick;

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Employee Info Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-lg"
                  src={employee.profileImage 
                    ? `${API_BASE_URL}/public/uploads/${employee.profileImage}` 
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name || 'Unknown')}&background=4f46e5&color=fff&size=80`
                  }
                  alt={employee.name || 'Employee'}
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name || 'Unknown')}&background=4f46e5&color=fff&size=80`;
                  }}
                />
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white">{employee.name || 'N/A'}</h3>
                  <p className="text-indigo-100">{employee.designation || 'N/A'}</p>
                  <p className="text-indigo-200 text-sm">{employee.department || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Leave Balance with Detailed Breakdown */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Leave Balance</h4>
            <div className="grid grid-cols-2 gap-4">
              {/* Casual Leave */}
              <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
                <p className="text-xs font-bold text-gray-600 uppercase">Casual Leave</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {leaveBalance.remainingLeaves.casual}
                </p>
                <p className="text-xs text-gray-500 mt-1">days remaining</p>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-semibold">{leaveBalance.totalLeaves.casual}</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-gray-600">Used:</span>
                    <span className="font-semibold">{leaveBalance.usedLeaves.casual}</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-gray-600">Pending:</span>
                    <span className="font-semibold text-orange-600">
                      {leaveBalance.pendingLeaves.casual}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sick Leave */}
              <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-orange-500">
                <p className="text-xs font-bold text-gray-600 uppercase">Sick Leave</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">
                  {leaveBalance.remainingLeaves.sick}
                </p>
                <p className="text-xs text-gray-500 mt-1">days remaining</p>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-semibold">{leaveBalance.totalLeaves.sick}</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-gray-600">Used:</span>
                    <span className="font-semibold">{leaveBalance.usedLeaves.sick}</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-gray-600">Pending:</span>
                    <span className="font-semibold text-orange-600">
                      {leaveBalance.pendingLeaves.sick}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* VIEW HISTORY SECTION - Expandable */}
        <div className="mb-6">
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <History className="w-6 h-6" />
              <div className="text-left">
                <h3 className="font-semibold text-lg">View Leave History</h3>
                <p className="text-sm text-blue-100">
                  {isHistoryOpen ? 'Click to hide your leave records' : 'Click to view all your leave applications'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isHistoryOpen && leaves.length > 0 && (
                <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-bold">
                  {leaves.length}
                </span>
              )}
              {isHistoryOpen ? (
                <ChevronUp className="w-6 h-6 transition-transform group-hover:scale-110" />
              ) : (
                <ChevronDown className="w-6 h-6 transition-transform group-hover:scale-110" />
              )}
            </div>
          </button>

          {/* Expandable History Section */}
          {isHistoryOpen && (
            <div className="mt-4 bg-gray-50 rounded-lg p-6 border border-gray-200 animate-fadeIn">
              {historyLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {/* Statistics Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                      <div className="text-xs text-gray-600">Total</div>
                      <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
                      <div className="text-xs text-gray-600">Pending</div>
                      <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                      <div className="text-xs text-gray-600">Approved</div>
                      <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
                      <div className="text-xs text-gray-600">Rejected</div>
                      <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-700">Filters:</span>
                      </div>
                      
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => setFilter('all')}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                            filter === 'all'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          All Status
                        </button>
                        <button
                          onClick={() => setFilter('pending')}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                            filter === 'pending'
                              ? 'bg-yellow-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Pending
                        </button>
                        <button
                          onClick={() => setFilter('approved')}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                            filter === 'approved'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Approved
                        </button>
                        <button
                          onClick={() => setFilter('rejected')}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                            filter === 'rejected'
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Rejected
                        </button>
                      </div>

                      <div className="flex gap-2 flex-wrap ml-auto">
                        <button
                          onClick={() => setTypeFilter('all')}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                            typeFilter === 'all'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          All Types
                        </button>
                        <button
                          onClick={() => setTypeFilter('casual')}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                            typeFilter === 'casual'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Casual
                        </button>
                        <button
                          onClick={() => setTypeFilter('sick')}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                            typeFilter === 'sick'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Sick
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Leave History List */}
                  {leaves.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                      <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">No Leave Records Found</h3>
                      <p className="text-gray-600">
                        {filter !== 'all' || typeFilter !== 'all'
                          ? 'No leaves found matching your filters.'
                          : "You haven't applied for any leaves yet."}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {leaves.map((leave) => (
                        <div
                          key={leave._id}
                          className="bg-white rounded-lg shadow hover:shadow-lg transition p-5 border border-gray-200"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Calendar className="w-5 h-5 text-blue-600" />
                              <div>
                                <h3 className="font-semibold text-base text-gray-800">
                                  {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                                </h3>
                                <p className="text-xs text-gray-600">
                                  Applied on {formatDate(leave.appliedDate)}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 flex-wrap justify-end">
                              {getLeaveTypeBadge(leave.leaveType)}
                              {getStatusBadge(leave.status)}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <span className="text-sm font-medium text-gray-600">Duration:</span>
                              <span className="ml-2 text-sm text-gray-800 font-semibold">
                                {leave.days} {leave.days === 1 ? 'day' : 'days'}
                              </span>
                            </div>
                            {leave.reviewedBy && leave.reviewedDate && (
                              <div>
                                <span className="text-sm font-medium text-gray-600">Reviewed on:</span>
                                <span className="ml-2 text-sm text-gray-800">
                                  {formatDate(leave.reviewedDate)}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="mb-4">
                            <span className="text-sm font-medium text-gray-600 block mb-1">Reason:</span>
                            <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded border border-gray-200">
                              {leave.reason}
                            </p>
                          </div>

                          {leave.reviewComments && (
                            <div className={`p-3 rounded border ${
                              leave.status === 'approved' 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-red-50 border-red-200'
                            }`}>
                              <span className="text-sm font-medium text-gray-700 block mb-1">
                                {leave.status === 'approved' ? '✓' : '✗'} Review Comments:
                              </span>
                              <p className="text-sm text-gray-800">{leave.reviewComments}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Leave Application Form */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
            <h3 className="text-2xl font-bold text-white">Apply for Leave</h3>
            <p className="text-indigo-100 mt-1">Submit your leave request for admin approval</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3">
                <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-800 font-medium">{successMessage}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
                <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            )}

            {/* Leave Type */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Leave Type <span className="text-red-500">*</span>
              </label>
              <select
                name="leaveType"
                value={formData.leaveType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              >
                <option value="casual">
                  Casual Leave ({leaveBalance.remainingLeaves.casual} days remaining)
                </option>
                <option value="sick">
                  Sick Leave ({leaveBalance.remainingLeaves.sick} days remaining)
                </option>
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Days Calculation with Balance Check */}
            {requestedDays > 0 && (
              <div className={`${requestedDays > availableBalance ? 'bg-red-50 border-red-200' : 'bg-indigo-50 border-indigo-200'} border rounded-xl p-4`}>
                <p className={`${requestedDays > availableBalance ? 'text-red-900' : 'text-indigo-900'} font-medium`}>
                  Requested: <span className="text-2xl font-bold">{requestedDays}</span> {requestedDays === 1 ? 'day' : 'days'}
                  <span className="ml-4 text-sm">
                    (Available: {availableBalance} days)
                  </span>
                </p>
                {requestedDays > availableBalance && (
                  <p className="text-red-700 text-sm mt-2">
                    Insufficient balance! Reduce leave duration or choose different leave type.
                  </p>
                )}
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                rows="4"
                placeholder="Please provide a detailed reason (minimum 10 characters)..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                required
                minLength={10}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.reason.length}/500 characters
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setFormData({
                  leaveType: 'casual',
                  startDate: '',
                  endDate: '',
                  reason: ''
                })}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={submitting || (requestedDays > availableBalance && requestedDays > 0)}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </span>
                ) : (
                  'Apply for Leave'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LeaveApply;