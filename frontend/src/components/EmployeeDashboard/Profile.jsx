import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const EmployeeProfile = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:3000';

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        console.log('Fetching employee with ID:', id);
        
        const response = await axios.get(`${API_BASE_URL}/api/employees/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log('Employee data received:', response.data);
        
        // Backend returns employee directly, not wrapped
        setEmployee(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching employee:', err);
        console.error('Error response:', err.response?.data);
        setError('Failed to load employee data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEmployeeData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-600 text-lg font-semibold mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <p className="text-gray-600 text-lg">No employee data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl mx-auto overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-8 text-white">
          <h3 className="text-3xl font-bold">My Profile</h3>
          <p className="text-indigo-100 mt-2">View your personal information</p>
        </div>

        <div className="p-8">
          {/* Employee Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Image */}
            <div className="col-span-1 flex flex-col items-center">
              <div className="relative">
                <img
                  className="h-40 w-40 rounded-full object-cover border-4 border-indigo-200 shadow-xl"
                  src={employee.profileImage 
                    ? `${API_BASE_URL}/public/uploads/${employee.profileImage}` 
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name || 'Unknown')}&background=4f46e5&color=fff&size=160`
                  }
                  alt={employee.name || 'Employee'}
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name || 'Unknown')}&background=4f46e5&color=fff&size=160`;
                  }}
                />
                <div className="absolute bottom-2 right-2 bg-green-500 h-6 w-6 rounded-full border-4 border-white"></div>
              </div>
              <h4 className="mt-6 text-2xl font-bold text-gray-900">{employee.name || 'N/A'}</h4>
              <p className="text-sm text-indigo-600 font-semibold mt-1">{employee.designation || 'N/A'}</p>
              <p className="text-xs text-gray-500 mt-1">{employee.department || 'N/A'}</p>
            </div>

            {/* Employee Details */}
            <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-xl border border-indigo-100 shadow-sm">
                <label className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Email</label>
                <p className="text-base text-gray-900 font-semibold mt-2">{employee.email || 'N/A'}</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-100 shadow-sm">
                <label className="text-xs font-bold text-purple-600 uppercase tracking-wider">Employee ID</label>
                <p className="text-base text-gray-900 font-semibold mt-2">{employee.employeeId || 'N/A'}</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-xl border border-blue-100 shadow-sm">
                <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">Department</label>
                <p className="text-base text-gray-900 font-semibold mt-2">{employee.department || 'N/A'}</p>
              </div>
              
              <div className="bg-gradient-to-br from-teal-50 to-green-50 p-5 rounded-xl border border-teal-100 shadow-sm">
                <label className="text-xs font-bold text-teal-600 uppercase tracking-wider">Designation</label>
                <p className="text-base text-gray-900 font-semibold mt-2">{employee.designation || 'N/A'}</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100 shadow-sm">
                <label className="text-xs font-bold text-green-600 uppercase tracking-wider">Salary</label>
                <p className="text-lg text-green-600 font-bold mt-2">
                  ${employee.salary ? employee.salary.toLocaleString() : 'N/A'}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-xl border border-amber-100 shadow-sm">
                <label className="text-xs font-bold text-amber-600 uppercase tracking-wider">Gender</label>
                <p className="text-base text-gray-900 font-semibold mt-2">{employee.gender || 'N/A'}</p>
              </div>
              
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-5 rounded-xl border border-rose-100 shadow-sm">
                <label className="text-xs font-bold text-rose-600 uppercase tracking-wider">Marital Status</label>
                <p className="text-base text-gray-900 font-semibold mt-2">{employee.maritalStatus || 'N/A'}</p>
              </div>
              
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-5 rounded-xl border border-violet-100 shadow-sm">
                <label className="text-xs font-bold text-violet-600 uppercase tracking-wider">Date of Birth</label>
                <p className="text-base text-gray-900 font-semibold mt-2">
                  {employee.dob ? new Date(employee.dob).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'N/A'}
                </p>
              </div>
              
              <div className="md:col-span-2 bg-gradient-to-br from-slate-50 to-gray-50 p-5 rounded-xl border border-slate-100 shadow-sm">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Joined Date</label>
                <p className="text-base text-gray-900 font-semibold mt-2">
                  {employee.createdAt ? new Date(employee.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;