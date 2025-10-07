import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../dashboard/AdminSidebar';
import Navbar from '../dashboard/Navbar';

const AddSalary = () => {
  const [formData, setFormData] = useState({
    employeeId: '',
    departmentId: '',
    basicSalary: '',
    allowances: '',
    deductions: '',
    payDate: ''
  });
    const API_BASE_URL = import.meta.env.VITE_BACKENDAPI;
  
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  // Fetch employees and departments on component mount
  useEffect(() => {
    fetchEmployeesAndDepartments();
  }, []);

  const fetchEmployeesAndDepartments = async () => {
    try {
      setFetchingData(true);
      const token = localStorage.getItem('token');
      
      // Fetch employees and departments in parallel
      const [employeesResponse, departmentsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/employees`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/api/departments/add`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      if (employeesResponse.data.success) {
        setEmployees(employeesResponse.data.employees);
      }
      
      if (departmentsResponse.data.success) {
        setDepartments(departmentsResponse.data.departments);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load employees and departments');
    } finally {
      setFetchingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  // Calculate net salary
  const calculateNetSalary = () => {
    const basic = parseFloat(formData.basicSalary) || 0;
    const allowances = parseFloat(formData.allowances) || 0;
    const deductions = parseFloat(formData.deductions) || 0;
    return (basic + allowances - deductions).toFixed(2);
  };

  // Get selected employee details
  const getSelectedEmployee = () => {
    return employees.find(emp => emp._id === formData.employeeId);
  };

  // Get selected department details
  const getSelectedDepartment = () => {
    return departments.find(dept => dept._id === formData.departmentId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.employeeId || !formData.departmentId || !formData.basicSalary || !formData.payDate) {
      setError('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.basicSalary) <= 0) {
      setError('Basic salary must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const salaryData = {
        ...formData,
        basicSalary: parseFloat(formData.basicSalary),
        allowances: parseFloat(formData.allowances) || 0,
        deductions: parseFloat(formData.deductions) || 0,
        netSalary: parseFloat(calculateNetSalary())
      };

      const response = await axios.post(`${API_BASE_URL}/api/salary/add`, salaryData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          employeeId: '',
          departmentId: '',
          basicSalary: '',
          allowances: '',
          deductions: '',
          payDate: ''
        });
        
        // Show success message and redirect after 2 seconds
        setTimeout(() => {
          navigate('/admin-dashboard/salary');
        }, 2000);
      } else {
        setError(response.data.error || 'Failed to add salary');
      }
    } catch (err) {
      console.error('Error adding salary:', err);
      setError(err.response?.data?.error || 'Error adding salary');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <AdminSidebar />
        <div className="flex-1">
          <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20">
            <Navbar />
          </div>
          <div className="p-8">
            <div className="text-center py-16">
              <div className="relative inline-flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gradient-to-r from-indigo-500 to-purple-600 border-t-transparent"></div>
                <div className="absolute animate-pulse rounded-full h-10 w-10 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20"></div>
              </div>
              <p className="mt-6 text-slate-600 text-lg font-medium">Loading data...</p>
              <p className="mt-2 text-slate-400">Fetching employees and departments</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1">
        {/* Navbar */}
        <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20">
          <Navbar />
        </div>
        
        {/* Page Content */}
        <div className="p-8">
          {/* Page Header */}
          <div className="mb-10">
            <div className="flex items-center gap-6 mb-6">
              <Link
                to="/admin-dashboard/salary"
                className="group p-4 rounded-2xl border-2 border-slate-200 hover:border-indigo-300 bg-white/80 backdrop-blur-sm hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-6 h-6 text-slate-600 group-hover:text-indigo-600 group-hover:-translate-x-0.5 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl opacity-10 blur-2xl"></div>
                <div className="relative">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                    Add Employee Salary
                  </h1>
                  <p className="text-slate-600 text-lg">Set up salary details for your employee</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 rounded-3xl opacity-10 blur-2xl"></div>
              
              <div className="relative bg-white/85 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                {/* Form Header */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-8">
                  <div className="flex items-center space-x-4">
                    <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Salary Information</h2>
                      <p className="text-blue-100 text-lg">Configure employee compensation details</p>
                    </div>
                  </div>
                </div>

                {/* Form Content */}
                <div className="p-10">
                  {/* Success Message */}
                  {success && (
                    <div className="mb-8 relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl opacity-20 blur-sm"></div>
                      <div className="relative p-6 bg-white/80 backdrop-blur-sm border-l-4 border-emerald-500 rounded-2xl shadow-xl">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="p-3 bg-emerald-100 rounded-xl">
                              <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-4">
                            <p className="text-emerald-800 font-bold text-lg">Salary added successfully!</p>
                            <p className="text-emerald-600 text-sm">Redirecting to salary list...</p>
                            <div className="mt-2 w-32 bg-emerald-200 rounded-full h-1">
                              <div className="bg-emerald-500 h-1 rounded-full animate-pulse" style={{width: '100%'}}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="mb-8 relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-rose-500 rounded-2xl opacity-20 blur-sm"></div>
                      <div className="relative p-6 bg-white/80 backdrop-blur-sm border-l-4 border-red-500 rounded-2xl shadow-xl">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="p-3 bg-red-100 rounded-xl">
                              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-4">
                            <p className="text-red-800 font-bold text-lg">{error}</p>
                            <p className="text-red-600 text-sm">Please check your input and try again</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Employee and Department Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Employee Selection */}
                      <div className="relative">
                        <label htmlFor="employeeId" className="block text-sm font-bold text-slate-800 mb-4 flex items-center">
                          <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                            Select Employee
                          </span>
                          <span className="text-red-500 ml-2 text-lg">*</span>
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-20 blur-sm group-focus-within:opacity-30 transition-opacity duration-300"></div>
                          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <svg className="h-6 w-6 text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <select
                            id="employeeId"
                            name="employeeId"
                            value={formData.employeeId}
                            onChange={handleInputChange}
                            className="relative w-full pl-14 pr-6 py-5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 text-lg font-semibold bg-white/80 backdrop-blur-sm shadow-lg focus:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            required
                            disabled={loading}
                          >
                            <option value="">Choose an employee</option>
                            {employees.map((employee) => (
                              <option key={employee._id} value={employee._id}>
                                {employee.firstName} {employee.lastName} - {employee.employeeId}
                              </option>
                            ))}
                          </select>
                        </div>
                        {getSelectedEmployee() && (
                          <div className="mt-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <p className="text-sm text-blue-700">
                              <strong>Position:</strong> {getSelectedEmployee().position}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Department Selection */}
                      <div className="relative">
                        <label htmlFor="departmentId" className="block text-sm font-bold text-slate-800 mb-4 flex items-center">
                          <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                            Department
                          </span>
                          <span className="text-red-500 ml-2 text-lg">*</span>
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-20 blur-sm group-focus-within:opacity-30 transition-opacity duration-300"></div>
                          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <svg className="h-6 w-6 text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <select
                            id="departmentId"
                            name="departmentId"
                            value={formData.departmentId}
                            onChange={handleInputChange}
                            className="relative w-full pl-14 pr-6 py-5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 text-lg font-semibold bg-white/80 backdrop-blur-sm shadow-lg focus:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            required
                            disabled={loading}
                          >
                            <option value="">Select department</option>
                            {departments.map((department) => (
                              <option key={department._id} value={department._id}>
                                {department.dep_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Salary Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Basic Salary */}
                      <div className="relative">
                        <label htmlFor="basicSalary" className="block text-sm font-bold text-slate-800 mb-4 flex items-center">
                          <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                            Basic Salary
                          </span>
                          <span className="text-red-500 ml-2 text-lg">*</span>
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl opacity-20 blur-sm group-focus-within:opacity-30 transition-opacity duration-300"></div>
                          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <span className="text-slate-400 group-focus-within:text-green-600 transition-colors duration-300 font-bold text-lg">$</span>
                          </div>
                          <input
                            type="number"
                            id="basicSalary"
                            name="basicSalary"
                            value={formData.basicSalary}
                            onChange={handleInputChange}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className="relative w-full pl-12 pr-6 py-5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 text-lg font-semibold bg-white/80 backdrop-blur-sm shadow-lg focus:shadow-xl placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>

                      {/* Allowances */}
                      <div className="relative">
                        <label htmlFor="allowances" className="block text-sm font-bold text-slate-800 mb-4">
                          <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                            Allowances
                          </span>
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl opacity-20 blur-sm group-focus-within:opacity-30 transition-opacity duration-300"></div>
                          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <span className="text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300 font-bold text-lg">$</span>
                          </div>
                          <input
                            type="number"
                            id="allowances"
                            name="allowances"
                            value={formData.allowances}
                            onChange={handleInputChange}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className="relative w-full pl-12 pr-6 py-5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg font-semibold bg-white/80 backdrop-blur-sm shadow-lg focus:shadow-xl placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Deductions */}
                      <div className="relative">
                        <label htmlFor="deductions" className="block text-sm font-bold text-slate-800 mb-4">
                          <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                            Deductions
                          </span>
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl opacity-20 blur-sm group-focus-within:opacity-30 transition-opacity duration-300"></div>
                          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <span className="text-slate-400 group-focus-within:text-red-600 transition-colors duration-300 font-bold text-lg">$</span>
                          </div>
                          <input
                            type="number"
                            id="deductions"
                            name="deductions"
                            value={formData.deductions}
                            onChange={handleInputChange}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className="relative w-full pl-12 pr-6 py-5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 text-lg font-semibold bg-white/80 backdrop-blur-sm shadow-lg focus:shadow-xl placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      {/* Pay Date */}
                      <div className="relative">
                        <label htmlFor="payDate" className="block text-sm font-bold text-slate-800 mb-4 flex items-center">
                          <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                            Pay Date
                          </span>
                          <span className="text-red-500 ml-2 text-lg">*</span>
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl opacity-20 blur-sm group-focus-within:opacity-30 transition-opacity duration-300"></div>
                          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <svg className="h-6 w-6 text-slate-400 group-focus-within:text-purple-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <input
                            type="date"
                            id="payDate"
                            name="payDate"
                            value={formData.payDate}
                            onChange={handleInputChange}
                            className="relative w-full pl-14 pr-6 py-5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-lg font-semibold bg-white/80 backdrop-blur-sm shadow-lg focus:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Salary Summary */}
                    {(formData.basicSalary || formData.allowances || formData.deductions) && (
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl opacity-20 blur-sm"></div>
                        <div className="relative p-8 bg-gradient-to-r from-indigo-50 to-purple-50 backdrop-blur-sm rounded-3xl border-2 border-indigo-200">
                          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                            <div className="p-3 bg-indigo-100 rounded-xl">
                              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                            Salary Breakdown
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-green-200">
                              <p className="text-sm font-semibold text-green-700 mb-1">Basic Salary</p>
                              <p className="text-2xl font-bold text-green-800">
                                ${parseFloat(formData.basicSalary || 0).toFixed(2)}
                              </p>
                            </div>
                            <div className="p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-blue-200">
                              <p className="text-sm font-semibold text-blue-700 mb-1">Allowances</p>
                              <p className="text-2xl font-bold text-blue-800">
                                ${parseFloat(formData.allowances || 0).toFixed(2)}
                              </p>
                            </div>
                            <div className="p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-red-200">
                              <p className="text-sm font-semibold text-red-700 mb-1">Deductions</p>
                              <p className="text-2xl font-bold text-red-800">
                                ${parseFloat(formData.deductions || 0).toFixed(2)}
                              </p>
                            </div>
                            <div className="p-4 bg-gradient-to-r from-purple-100 to-indigo-100 backdrop-blur-sm rounded-2xl border-2 border-purple-300">
                              <p className="text-sm font-semibold text-purple-700 mb-1">Net Salary</p>
                              <p className="text-3xl font-bold text-purple-800">
                                ${calculateNetSalary()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Form Actions */}
                    <div className="flex gap-6 pt-8 border-t border-slate-100">
                      <button
                        type="submit"
                        disabled={loading || success}
                        className="group flex-1 px-8 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-800 disabled:from-slate-400 disabled:via-slate-500 disabled:to-slate-600 disabled:cursor-not-allowed rounded-2xl text-white font-bold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:transform-none flex items-center justify-center gap-3 text-lg"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                            <span>Adding Salary...</span>
                          </>
                        ) : success ? (
                          <>
                            <div className="p-1 bg-white/20 rounded-lg">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span>Salary Added!</span>
                          </>
                        ) : (
                          <>
                            <div className="p-1 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all duration-300">
                              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <span>Add Salary</span>
                            <div className="w-2 h-2 bg-white/40 rounded-full group-hover:bg-white/60 transition-all duration-300"></div>
                          </>
                        )}
                      </button>
                      
                      <Link
                        to="/admin-dashboard/salary"
                        className="group px-8 py-5 border-2 border-slate-200 hover:border-slate-300 bg-white/80 backdrop-blur-sm hover:bg-slate-50 rounded-2xl text-slate-700 hover:text-slate-900 font-bold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
                      >
                        <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Cancel</span>
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSalary;