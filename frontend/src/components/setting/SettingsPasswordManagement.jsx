import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { 
  Lock, 
  Shield, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Key,
  Info,
  Users,
  Search,
  Settings
} from 'lucide-react';
import axios from 'axios';

const SettingsPasswordManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // CRITICAL: Strict role checking
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  
  // Debug logging - remove in production
  console.log('Current user:', user);
  console.log('User role:', user?.role);
  console.log('Is Admin:', isAdmin);

  // State for admin view toggle
  const [activeTab, setActiveTab] = useState('myPassword');
  
  // State for employee list (admin only)
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const API_BASE_URL = import.meta.env.VITE_BACKENDAPI;

  // Fetch employees (ONLY for admin)
  useEffect(() => {
    if (isAdmin && activeTab === 'employeePasswords') {
      fetchEmployees();
    }
  }, [isAdmin, activeTab]);

  // Filter employees based on search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(emp => 
        emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeId?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEmployees(filtered);
    }
  }, [searchQuery, employees]);

  const fetchEmployees = async () => {
    // SECURITY: Double check admin role before fetching
    if (!isAdmin) {
      setErrors({ general: 'Unauthorized: Admin access required' });
      return;
    }

    setLoadingEmployees(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/employees`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setEmployees(response.data.employees || []);
        setFilteredEmployees(response.data.employees || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      if (error.response?.status === 403) {
        setErrors({ general: 'Unauthorized: Admin access required' });
      } else {
        setErrors({ general: 'Failed to load employees' });
      }
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Current password is ALWAYS required for own password change
    // Admin changing employee password doesn't need current password
    if (!isAdmin || activeTab === 'myPassword') {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters long';
    } else if (formData.currentPassword && formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // SECURITY: Admin must select an employee when changing employee password
    if (isAdmin && activeTab === 'employeePasswords' && !selectedEmployee) {
      newErrors.general = 'Please select an employee';
    }

    return newErrors;
  };

  const clearForm = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
    setSuccessMessage('');
    setSelectedEmployee(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (loading) return;

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const token = localStorage.getItem('token');
      let response;

      // SECURITY: Only admin can change employee passwords
      if (isAdmin && activeTab === 'employeePasswords') {
        if (!selectedEmployee) {
          setErrors({ general: 'Please select an employee' });
          setLoading(false);
          return;
        }

        // Admin changing employee password
        response = await axios.put(
          `${API_BASE_URL}/api/auth/admin-change-password/${selectedEmployee._id}`,
          {
            newPassword: formData.newPassword,
            confirmPassword: formData.confirmPassword
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data.success) {
          setSuccessMessage(`Password changed successfully for ${selectedEmployee.name}!`);
          clearForm();
          setTimeout(() => setSuccessMessage(''), 5000);
        }
      } else {
        // User (admin or employee) changing own password
        response = await axios.put(
          `${API_BASE_URL}/api/auth/change-password`,
          {
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
            confirmPassword: formData.confirmPassword
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          setSuccessMessage('Password changed successfully!');
          clearForm();
          setTimeout(() => setSuccessMessage(''), 5000);
        }
      }

    } catch (error) {
      console.error('Password change error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to change password';
      
      if (error.response?.status === 403) {
        setErrors({ general: 'Unauthorized: You do not have permission to perform this action' });
      } else if (error.response?.status === 400 && error.response?.data?.field) {
        setErrors({ [error.response.data.field]: errorMessage });
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    strength = Object.values(checks).filter(Boolean).length;
    
    const strengthMap = {
      0: { label: 'Very Weak', color: 'text-red-500' },
      1: { label: 'Weak', color: 'text-red-400' },
      2: { label: 'Fair', color: 'text-yellow-500' },
      3: { label: 'Good', color: 'text-blue-500' },
      4: { label: 'Strong', color: 'text-green-500' },
      5: { label: 'Very Strong', color: 'text-green-600' }
    };
    
    return { strength, ...strengthMap[strength] };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  const handleEmployeeSelect = (employee) => {
    // SECURITY: Only admin can select employees
    if (!isAdmin) {
      setErrors({ general: 'Unauthorized: Admin access required' });
      return;
    }

    setSelectedEmployee(employee);
    setSuccessMessage('');
    setErrors({});
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const getDashboardPath = () => {
    return isAdmin ? '/admin-dashboard' : '/employee-dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="absolute inset-0 bg-black/5"></div>
          <div className="absolute top-0 right-0 w-72 h-72 md:w-96 md:h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 md:w-96 md:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          <div className="relative px-6 md:px-8 py-8 md:py-12">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => navigate(getDashboardPath())}
                  className="bg-white/20 backdrop-blur-md p-3 rounded-xl hover:bg-white/30 transition-all border border-white/30"
                >
                  <ArrowLeft className="w-6 h-6 text-white" />
                </button>
                <div className="text-center lg:text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl border border-white/30">
                      <Settings className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                      Settings
                    </h1>
                  </div>
                  <p className="text-white/90 text-sm md:text-base mt-2">
                    {isAdmin ? 'Manage passwords for yourself and employees' : 'Update your account password'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECURITY: Admin Tab Switcher - ONLY visible to admins */}
        {isAdmin && (
          <div className="bg-white rounded-2xl shadow-xl p-2 mb-6 flex gap-2">
            <button
              onClick={() => {
                setActiveTab('myPassword');
                clearForm();
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all ${
                activeTab === 'myPassword'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Lock className="w-5 h-5" />
              My Password
            </button>
            <button
              onClick={() => {
                setActiveTab('employeePasswords');
                clearForm();
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all ${
                activeTab === 'employeePasswords'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="w-5 h-5" />
              Employee Passwords
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SECURITY: Employee List - ONLY visible to admin in employeePasswords tab */}
          {isAdmin && activeTab === 'employeePasswords' && (
            <div className="lg:col-span-1 bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Select Employee
                </h2>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search employees..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  />
                </div>

                {/* Employee List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {loadingEmployees ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-3 border-purple-600 border-t-transparent mx-auto"></div>
                      <p className="text-gray-600 mt-2">Loading employees...</p>
                    </div>
                  ) : filteredEmployees.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No employees found
                    </div>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <button
                        key={employee._id}
                        onClick={() => handleEmployeeSelect(employee)}
                        className={`w-full text-left p-4 rounded-xl transition-all border-2 ${
                          selectedEmployee?._id === employee._id
                            ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300 shadow-md'
                            : 'bg-gray-50 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                            {employee.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{employee.name}</p>
                            <p className="text-sm text-gray-600 truncate">{employee.email}</p>
                            <p className="text-xs text-gray-500">ID: {employee.employeeId}</p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Password Form */}
          <div className={`${isAdmin && activeTab === 'employeePasswords' ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Success Message */}
              {successMessage && (
                <div className="m-8 mb-0 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-green-800 font-semibold">{successMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* General Error Message */}
              {errors.general && (
                <div className="m-8 mb-0 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-red-800 font-semibold">{errors.general}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Selected Employee Info - ONLY for admin */}
              {isAdmin && activeTab === 'employeePasswords' && selectedEmployee && (
                <div className="m-8 mb-0 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-lg">
                      {selectedEmployee.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-purple-900">Changing password for:</p>
                      <p className="text-purple-700">{selectedEmployee.name} ({selectedEmployee.email})</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Password Fields Section */}
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                    <Key className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {isAdmin && activeTab === 'employeePasswords' 
                        ? 'Set New Password' 
                        : 'Change Password'}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {isAdmin && activeTab === 'employeePasswords'
                        ? 'Enter new password for the selected employee'
                        : 'Enter your current and new password'}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Current Password - Required for own password OR employee changing password */}
                  {(!isAdmin || activeTab === 'myPassword') && (
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-blue-600" />
                        Current Password *
                      </label>
                      <div className="relative">
                        <input 
                          type={showPasswords.currentPassword ? "text" : "password"}
                          name="currentPassword" 
                          value={formData.currentPassword} 
                          onChange={handleInputChange} 
                          className={`w-full px-4 py-3 pr-12 bg-gray-50 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 placeholder-gray-400 font-medium ${
                            errors.currentPassword ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                          }`}
                          placeholder="Enter your current password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('currentPassword')}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPasswords.currentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.currentPassword}
                        </p>
                      )}
                    </div>
                  )}

                  {/* New Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-blue-600" />
                      New Password *
                    </label>
                    <div className="relative">
                      <input 
                        type={showPasswords.newPassword ? "text" : "password"}
                        name="newPassword" 
                        value={formData.newPassword} 
                        onChange={handleInputChange} 
                        className={`w-full px-4 py-3 pr-12 bg-gray-50 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 placeholder-gray-400 font-medium ${
                          errors.newPassword ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                        }`}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('newPassword')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPasswords.newPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {formData.newPassword && (
                      <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full transition-all duration-300 ${
                                passwordStrength.strength <= 1 ? 'bg-red-500' :
                                passwordStrength.strength <= 2 ? 'bg-yellow-500' :
                                passwordStrength.strength <= 3 ? 'bg-blue-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm font-bold ${passwordStrength.color}`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          Use 8+ characters with uppercase, lowercase, numbers & symbols
                        </p>
                      </div>
                    )}
                    
                    {errors.newPassword && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.newPassword}
                      </p>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-blue-600" />
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <input 
                        type={showPasswords.confirmPassword ? "text" : "password"}
                        name="confirmPassword" 
                        value={formData.confirmPassword} 
                        onChange={handleInputChange} 
                        className={`w-full px-4 py-3 pr-12 bg-gray-50 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 placeholder-gray-400 font-medium ${
                          errors.confirmPassword ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                        }`}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirmPassword')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPasswords.confirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    {/* Password Match Indicator */}
                    {formData.confirmPassword && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        {formData.newPassword === formData.confirmPassword ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Passwords match</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Passwords don't match</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

              {/* Security Tips Section */}
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Security Tips</h2>
                    <p className="text-gray-600 text-sm">Best practices for a strong password</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Info className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-blue-900 mb-1">Use Unique Passwords</h4>
                        <p className="text-sm text-blue-700">Don't reuse passwords from other accounts</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Info className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-purple-900 mb-1">Mix Characters</h4>
                        <p className="text-sm text-purple-700">Include uppercase, lowercase, numbers & symbols</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Info className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-green-900 mb-1">Longer is Better</h4>
                        <p className="text-sm text-green-700">Use at least 8 characters (12+ recommended)</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border-2 border-orange-200">
                    <div className="flex items-start gap-3">
                      <div className="bg-orange-100 p-2 rounded-lg">
                        <Info className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-orange-900 mb-1">Avoid Personal Info</h4>
                        <p className="text-sm text-orange-700">Don't use names, birthdays, or common words</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="p-8 bg-gradient-to-r from-gray-50 to-blue-50 border-t-2 border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    type="button"
                    onClick={() => navigate(getDashboardPath())}
                    className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold shadow-md hover:shadow-lg"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    onClick={handleSubmit}
                    className={`px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all flex items-center justify-center gap-3 ${
                      loading 
                        ? 'opacity-70 cursor-not-allowed' 
                        : 'hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-6 h-6" />
                        <span>
                          {isAdmin && activeTab === 'employeePasswords' 
                            ? 'Update Employee Password' 
                            : 'Change Password'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPasswordManagement;