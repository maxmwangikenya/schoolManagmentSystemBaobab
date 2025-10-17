import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DollarSign, Calendar, TrendingUp, ArrowLeft, Edit, User, Briefcase, Building } from 'lucide-react';

const EmployeeSalary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_BACKENDAPI;

  useEffect(() => {
    fetchEmployeeData();
  }, [id]);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // ✅ NEW: Fetch employee data (includes salary)
      const response = await axios.get(`${API_BASE_URL}/api/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEmployee(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching employee data:', err);
      setError(err.response?.data?.error || 'Failed to load employee data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'Not Set';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading employee information...</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <p className="text-gray-600 text-lg mb-4">{error || 'Employee data not found'}</p>
          <button
            onClick={() => navigate('/admin-dashboard/employees')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Employees
          </button>
        </div>
      </div>
    );
  }

  const hasSalary = employee.salary !== undefined && employee.salary !== null;

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

        {/* Employee Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-lg"
                  src={employee.profileImage 
                    ? `${API_BASE_URL}/public/uploads/${employee.profileImage}` 
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name || 'Unknown')}&background=059669&color=fff&size=80`
                  }
                  alt={employee.name || 'Employee'}
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name || 'Unknown')}&background=059669&color=fff&size=80`;
                  }}
                />
                <div>
                  <h3 className="text-2xl font-bold text-white">{employee.name || 'N/A'}</h3>
                  <p className="text-green-100">{employee.designation || 'N/A'}</p>
                  <p className="text-green-200 text-sm">{employee.department || 'N/A'} • {employee.employeeId || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Salary Information */}
        {!hasSalary ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <DollarSign className="w-24 h-24 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Salary Information</h3>
            <p className="text-gray-600 mb-6">Salary details have not been set up for this employee yet.</p>
            <button
              onClick={() => navigate(`/admin-dashboard/employees/edit/${id}`)}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl font-medium inline-flex items-center gap-2"
            >
              <Edit className="w-5 h-5" />
              Set Salary
            </button>
          </div>
        ) : (
          <>
            {/* Current Salary Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Current Salary</h3>
                    <p className="text-green-100 text-sm">Active as of {formatDate(employee.updatedAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-100 text-sm">Annual Salary</p>
                    <p className="text-4xl font-bold text-white">{formatCurrency(employee.salary)}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Salary Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Annual Salary */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-blue-700">Annual</span>
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-blue-900">{formatCurrency(employee.salary)}</p>
                    <p className="text-xs text-blue-600 mt-1">Yearly compensation</p>
                  </div>

                  {/* Monthly Salary */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-green-700">Monthly</span>
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-900">{formatCurrency(employee.salary / 12)}</p>
                    <p className="text-xs text-green-600 mt-1">Per month</p>
                  </div>

                  {/* Bi-weekly */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-purple-700">Bi-weekly</span>
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-purple-900">{formatCurrency(employee.salary / 26)}</p>
                    <p className="text-xs text-purple-600 mt-1">Every 2 weeks</p>
                  </div>
                </div>

                {/* Employee Details */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-bold text-gray-800 mb-4">Employee Details</h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <div className="flex items-center gap-2 text-gray-700">
                        <User className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">Full Name</span>
                      </div>
                      <span className="text-gray-900 font-semibold">{employee.name}</span>
                    </div>

                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Briefcase className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">Designation</span>
                      </div>
                      <span className="text-gray-900 font-semibold">{employee.designation || 'N/A'}</span>
                    </div>

                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Building className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">Department</span>
                      </div>
                      <span className="text-gray-900 font-semibold">{employee.department || 'N/A'}</span>
                    </div>

                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">Employee ID</span>
                      </div>
                      <span className="text-gray-900 font-semibold">{employee.employeeId}</span>
                    </div>

                    <div className="flex justify-between items-center py-3">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">Last Updated</span>
                      </div>
                      <span className="text-gray-900 font-semibold">{formatDate(employee.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Salary Calculation Info */}
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                  <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Salary Breakdown
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hourly Rate (2080 hrs/year)</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(employee.salary / 2080)}/hr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weekly Rate</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(employee.salary / 52)}/week</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Daily Rate (260 days/year)</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(employee.salary / 260)}/day</span>
                    </div>
                  </div>
                </div>

                {/* Update Salary Button */}
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => navigate(`/admin-dashboard/employees/edit/${id}`)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl font-medium"
                  >
                    <Edit className="w-5 h-5" />
                    Update Salary
                  </button>
                </div>
              </div>
            </div>

            {/* Info Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Salary Information</h4>
                  <p className="text-sm text-blue-700">
                    The salary shown is the current annual compensation for this employee. 
                    To update salary information or view complete employee details, use the "Update Salary" button above.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeSalary;