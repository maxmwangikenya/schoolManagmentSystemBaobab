import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, CheckCircle, XCircle, AlertCircle, 
  Filter, Bell, Users, TrendingUp, ChevronDown, ChevronUp,
  MessageSquare
} from 'lucide-react';

const AdminLeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('all');
  const [expandedLeave, setExpandedLeave] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewComments, setReviewComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_BACKENDAPI; // Replace with your actual API URL

  useEffect(() => {
    fetchLeaveStats();
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [filter, typeFilter]);

  const fetchLeaveStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/leaves/stats/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/api/leaves`;
      const params = new URLSearchParams();
      
      if (filter !== 'all') params.append('status', filter);
      if (typeFilter !== 'all') params.append('leaveType', typeFilter);
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setLeaves(data.leaves);
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (leaveId, status) => {
    if (!reviewComments.trim() && status === 'rejected') {
      alert('Please provide comments for rejection');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/leaves/${leaveId}/review`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          reviewComments: reviewComments.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        fetchLeaves();
        fetchLeaveStats();
        setReviewModal(null);
        setReviewComments('');
        alert(`Leave ${status} successfully!`);
      } else {
        alert(data.error || 'Failed to review leave');
      }
    } catch (error) {
      console.error('Error reviewing leave:', error);
      alert('Failed to review leave');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  const pendingCount = leaves.filter(l => l.status === 'pending').length;

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
              <p className="text-gray-600 mt-1">Review and manage employee leave applications</p>
            </div>
            {pendingCount > 0 && (
              <div className="bg-red-500 text-white px-4 py-2 rounded-full flex items-center gap-2 animate-pulse shadow-lg">
                <Bell className="w-5 h-5" />
                <span className="font-bold">{pendingCount} Pending Review</span>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalApplications || 0}</p>
                </div>
                <Users className="w-12 h-12 text-blue-500 opacity-50" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingCount || 0}</p>
                </div>
                <Clock className="w-12 h-12 text-yellow-500 opacity-50" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.approvedCount || 0}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-500 opacity-50" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500 hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejectedCount || 0}</p>
                </div>
                <XCircle className="w-12 h-12 text-red-500 opacity-50" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">Filters:</span>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'pending'
                    ? 'bg-yellow-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ⏳ Pending ({leaves.filter(l => l.status === 'pending').length})
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'approved'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ✓ Approved
              </button>
              <button
                onClick={() => setFilter('rejected')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'rejected'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ✗ Rejected
              </button>
            </div>

            <div className="flex gap-2 flex-wrap ml-auto">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  typeFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Types
              </button>
              <button
                onClick={() => setTypeFilter('casual')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  typeFilter === 'casual'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Casual
              </button>
              <button
                onClick={() => setTypeFilter('sick')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
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

        {/* Leave Applications List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : leaves.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Leave Applications Found</h3>
            <p className="text-gray-600">
              {filter !== 'all' || typeFilter !== 'all'
                ? 'No applications found matching your filters.'
                : 'No leave applications have been submitted yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaves.map((leave) => (
              <div
                key={leave._id}
                className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border-l-4 ${
                  leave.status === 'pending' ? 'border-yellow-500' :
                  leave.status === 'approved' ? 'border-green-500' :
                  'border-red-500'
                }`}
              >
                <div className="p-6">
                  {/* Employee Info & Status */}
                  <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        className="h-14 w-14 rounded-full object-cover border-2 border-gray-200"
                        src={leave.employeeId?.profileImage 
                          ? `${API_BASE_URL}/public/uploads/${leave.employeeId.profileImage}` 
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(leave.employeeId?.name || 'Unknown')}&background=4f46e5&color=fff`
                        }
                        alt={leave.employeeId?.name || 'Employee'}
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(leave.employeeId?.name || 'Unknown')}&background=4f46e5&color=fff`;
                        }}
                      />
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{leave.employeeId?.name || 'Unknown'}</h3>
                        <p className="text-sm text-gray-600">{leave.employeeId?.designation || 'N/A'} • {leave.employeeId?.department || 'N/A'}</p>
                        <p className="text-xs text-gray-500 mt-1">Applied on {formatDate(leave.appliedDate)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {getLeaveTypeBadge(leave.leaveType)}
                      {getStatusBadge(leave.status)}
                    </div>
                  </div>

                  {/* Leave Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Leave Period</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-900">
                          {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Duration</p>
                      <span className="text-sm font-bold text-indigo-600">
                        {leave.days} {leave.days === 1 ? 'day' : 'days'}
                      </span>
                    </div>
                    {leave.reviewedBy && leave.reviewedDate && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Reviewed</p>
                        <span className="text-sm text-gray-900">{formatDate(leave.reviewedDate)}</span>
                      </div>
                    )}
                  </div>

                  {/* Employee Leave Balance */}
                  {leave.remainingBalance && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <p className="text-sm font-bold text-gray-800">Employee Leave Balance After This Request</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-3 rounded border border-green-200">
                          <p className="text-xs text-gray-600">Casual Leave</p>
                          <p className="text-lg font-bold text-green-600">
                            {leave.remainingBalance?.casual ?? 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">days remaining</p>
                        </div>
                        <div className="bg-white p-3 rounded border border-orange-200">
                          <p className="text-xs text-gray-600">Sick Leave</p>
                          <p className="text-lg font-bold text-orange-600">
                            {leave.remainingBalance?.sick ?? 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">days remaining</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reason */}
                  <div className="mb-4">
                    <button
                      onClick={() => setExpandedLeave(expandedLeave === leave._id ? null : leave._id)}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Reason for Leave
                      {expandedLeave === leave._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {expandedLeave === leave._id && (
                      <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200 animate-fadeIn">
                        <p className="text-sm text-gray-800">{leave.reason}</p>
                      </div>
                    )}
                  </div>

                  {/* Review Comments */}
                  {leave.reviewComments && (
                    <div className={`p-3 rounded border mb-4 ${
                      leave.status === 'approved' 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        {leave.status === 'approved' ? '✓' : '✗'} Review Comments:
                      </p>
                      <p className="text-sm text-gray-800">{leave.reviewComments}</p>
                    </div>
                  )}

                  {/* Action Buttons (Only for pending) */}
                  {leave.status === 'pending' && (
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => setReviewModal({ leave, action: 'approved' })}
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Approve Leave
                      </button>
                      <button
                        onClick={() => setReviewModal({ leave, action: 'rejected' })}
                        className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject Leave
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-scaleIn">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {reviewModal.action === 'approved' ? '✓ Approve' : '✗ Reject'} Leave Application
            </h3>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-semibold">Employee:</span> {reviewModal.leave.employeeId?.name}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-semibold">Duration:</span> {reviewModal.leave.days} days
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-semibold">Type:</span> {reviewModal.leave.leaveType}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Period:</span> {formatDate(reviewModal.leave.startDate)} - {formatDate(reviewModal.leave.endDate)}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Comments {reviewModal.action === 'rejected' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                rows="4"
                placeholder={reviewModal.action === 'approved' 
                  ? "Add any approval notes (optional)..." 
                  : "Provide reason for rejection (required)..."}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setReviewModal(null);
                  setReviewComments('');
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-medium"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleReview(reviewModal.leave._id, reviewModal.action)}
                disabled={submitting}
                className={`flex-1 px-6 py-3 text-white rounded-xl transition font-medium shadow-lg ${
                  reviewModal.action === 'approved'
                    ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </span>
                ) : (
                  `Confirm ${reviewModal.action === 'approved' ? 'Approval' : 'Rejection'}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminLeaveManagement;