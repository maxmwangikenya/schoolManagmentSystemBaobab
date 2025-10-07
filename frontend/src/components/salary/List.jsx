import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../dashboard/AdminSidebar';
import Navbar from '../dashboard/Navbar';

const List = () => {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // History modal states
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
    const API_BASE_URL = import.meta.env.VITE_BACKENDAPI;

  useEffect(() => {
    fetchSalaries();
  }, []);

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/salary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setSalaries(response.data.salaries || []);
      } else {
        setError('Failed to fetch salaries');
      }
    } catch (err) {
      console.error('Error fetching salaries:', err);
      setError('Error fetching salary data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSalaryHistory = async (employeeId) => {
    try {
      setHistoryLoading(true);
      setHistoryError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/salary/history/${employeeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setSalaryHistory(response.data.salaryHistory || []);
      } else {
        setHistoryError('Failed to fetch salary history');
      }
    } catch (err) {
      console.error('Error fetching salary history:', err);
      setHistoryError('Error fetching salary history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleViewHistory = async (employee) => {
    setSelectedEmployee(employee);
    setShowHistoryModal(true);
    await fetchSalaryHistory(employee.employeeId._id);
  };

  const closeHistoryModal = () => {
    setShowHistoryModal(false);
    setSelectedEmployee(null);
    setSalaryHistory([]);
    setHistoryError(null);
  };

  const handleDelete = async (salaryId) => {
    if (window.confirm('Are you sure you want to delete this salary record?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${API_BASE_URL}/api/salary/${salaryId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.data.success) {
          setSalaries(salaries.filter(salary => salary._id !== salaryId));
        } else {
          setError('Failed to delete salary record');
        }
      } catch (err) {
        console.error('Error deleting salary:', err);
        setError('Error deleting salary record');
      }
    }
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount || 0).toFixed(2)}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter salaries based on search term
  const filteredSalaries = salaries.filter(salary => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const employeeName = `${salary.employeeId?.firstName || ''} ${salary.employeeId?.lastName || ''}`.toLowerCase();
    const employeeId = salary.employeeId?.employeeId?.toLowerCase() || '';
    const department = salary.departmentId?.dep_name?.toLowerCase() || '';
    
    return employeeName.includes(searchLower) || 
           employeeId.includes(searchLower) || 
           department.includes(searchLower);
  });

  if (loading) {
    return (
      <div className="flex min-h-screen bg-white">
        <AdminSidebar />
        <div className="flex-1">
          <div className="bg-white border-b">
            <Navbar />
          </div>
          <div className="p-8">
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mx-auto"></div>
              <p className="mt-6 text-gray-600 text-lg font-medium">Loading salaries...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebar />
      
      <div className="flex-1 min-w-0">
        <div className="bg-white border-b">
          <Navbar />
        </div>
        
        <div className="p-4 lg:p-8">
          {/* Page Header */}
          <div className="mb-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-2">
                  Salary Management
                </h1>
                <p className="text-gray-600 text-sm lg:text-lg">Manage employee salaries and compensation</p>
              </div>
              
              <Link
                to="/admin-dashboard/salary/add"
                className="px-4 lg:px-8 py-3 lg:py-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-bold transition-colors duration-300 flex items-center justify-center gap-3 text-sm lg:text-base"
              >
                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Salary
              </Link>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-6 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800 font-bold">{error}</p>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="mb-8">
            <div className="bg-gray-50 rounded-lg p-4 lg:p-6 border">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by employee name, ID, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 lg:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white text-sm lg:text-base"
                />
              </div>
            </div>
          </div>

          {/* Salary List - Card Layout for better responsiveness */}
          {filteredSalaries.length > 0 ? (
            <div className="space-y-4">
              {filteredSalaries.map((salary, index) => (
                <div key={salary._id} className="bg-white border rounded-lg p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6 items-center">
                    {/* Employee Info */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center mr-4 flex-shrink-0">
                          <span className="text-sm font-bold text-white">
                            {(salary.employeeId?.firstName || 'U').charAt(0)}
                            {(salary.employeeId?.lastName || 'N').charAt(0)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm lg:text-base font-bold text-gray-900 truncate">
                            {salary.employeeId?.firstName || 'Unknown'} {salary.employeeId?.lastName || 'Name'}
                          </div>
                          <div className="text-xs lg:text-sm text-gray-500 truncate">
                            ID: {salary.employeeId?.employeeId || 'N/A'}
                          </div>
                          <div className="text-xs lg:text-sm text-gray-500 truncate">
                            {salary.departmentId?.dep_name || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Salary Details */}
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:gap-1">
                      <div className="text-center lg:text-left">
                        <div className="text-xs text-gray-500 uppercase">Basic</div>
                        <div className="text-sm font-bold text-green-700">{formatCurrency(salary.basicSalary)}</div>
                      </div>
                      <div className="text-center lg:text-left">
                        <div className="text-xs text-gray-500 uppercase">Allow.</div>
                        <div className="text-sm font-bold text-blue-700">{formatCurrency(salary.allowances)}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:gap-1">
                      <div className="text-center lg:text-left">
                        <div className="text-xs text-gray-500 uppercase">Deduct.</div>
                        <div className="text-sm font-bold text-red-700">{formatCurrency(salary.deductions)}</div>
                      </div>
                      <div className="text-center lg:text-left">
                        <div className="text-xs text-gray-500 uppercase">Net</div>
                        <div className="text-sm lg:text-base font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded inline-block">
                          {formatCurrency(salary.netSalary)}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-4 lg:pt-0 border-t lg:border-t-0">
                      <div className="text-xs lg:text-sm text-gray-600 mr-2">
                        {formatDate(salary.payDate)}
                      </div>
                      
                      {/* History Button */}
                      <button
                        onClick={() => handleViewHistory(salary)}
                        className="p-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-all duration-300 group"
                        title="View Salary History"
                      >
                        <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </button>

                      <Link
                        to={`/admin-dashboard/salary/edit/${salary._id}`}
                        className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-all duration-300 group"
                        title="Edit Salary"
                      >
                        <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      
                      <button
                        onClick={() => handleDelete(salary._id)}
                        className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-all duration-300 group"
                        title="Delete Salary"
                      >
                        <svg className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-lg border">
              <div className="mb-6">
                <div className="mx-auto h-24 w-24 bg-gray-400 rounded-full flex items-center justify-center">
                  <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4">No Salary Records Found</h3>
              <p className="text-gray-600 text-sm lg:text-lg mb-8">
                {searchTerm ? 'No salary records match your search criteria.' : 'Start by adding your first salary record.'}
              </p>
              <Link
                to="/admin-dashboard/salary/add"
                className="inline-flex items-center px-6 lg:px-8 py-3 lg:py-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-bold transition-colors duration-300 gap-3 text-sm lg:text-base"
              >
                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add First Salary Record
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Salary History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Salary History</h3>
                    <p className="text-purple-100">
                      {selectedEmployee?.employeeId?.firstName} {selectedEmployee?.employeeId?.lastName} 
                      <span className="text-purple-200 ml-2">
                        (ID: {selectedEmployee?.employeeId?.employeeId})
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeHistoryModal}
                  className="text-white hover:text-purple-200 transition-colors duration-200 p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {historyLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading salary history...</p>
                </div>
              ) : historyError ? (
                <div className="text-center py-12">
                  <div className="text-red-600 mb-4">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-red-600 font-semibold">{historyError}</p>
                </div>
              ) : salaryHistory.length > 0 ? (
                <div className="space-y-4">
                  {salaryHistory.map((record, index) => (
                    <div key={record._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {formatDate(record.payDate)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Pay Period #{salaryHistory.length - index}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="text-xs text-gray-500 uppercase">Basic</div>
                            <div className="text-sm font-bold text-green-700">{formatCurrency(record.basicSalary)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 uppercase">Allowances</div>
                            <div className="text-sm font-bold text-blue-700">{formatCurrency(record.allowances)}</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="text-xs text-gray-500 uppercase">Deductions</div>
                            <div className="text-sm font-bold text-red-700">{formatCurrency(record.deductions)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 uppercase">Net Salary</div>
                            <div className="text-lg font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-lg">
                              {formatCurrency(record.netSalary)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            index === 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {index === 0 ? 'Latest' : 'Historical'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">No Salary History</h4>
                  <p className="text-gray-600">This employee doesn't have any previous salary records.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-4 flex justify-end">
              <button
                onClick={closeHistoryModal}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default List;