import React, { useState } from 'react';
import { Lock, Shield, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import AdminSidebar from '../dashboard/AdminSidebar';
import Navbar from '../dashboard/Navbar';
import axios from 'axios';

const ChangePassword = () => {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear success message when user starts typing
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Current password validation
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    // New password validation
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters long';
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
  };
  const API_BASE_URL = import.meta.env.VITE_BACKENDAPI;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (loading) {
      return;
    }

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/api/auth/change-password`, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setSuccessMessage('Password changed successfully!');
        clearForm();
        
        // Optional: Auto-hide success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      } else {
        throw new Error(response.data.error || 'Unknown error');
      }

    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to change password';
      
      // Handle specific error types
      if (error.response?.status === 400 && error.response?.data?.field) {
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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <AdminSidebar />
      <div className="flex-1">
        <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20">
          <Navbar />
        </div>

        <div className="p-4 lg:p-6">
          <div className="max-w-2xl mx-auto">
            {/* Compact Header */}
            <div className="mb-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mb-3 shadow-lg">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-1">
                Change Password
              </h1>
              <p className="text-gray-600">Update your account password for security</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 overflow-hidden">
              {/* Compact Form Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Shield className="h-5 w-5 text-white" />
                    Security Settings
                  </h2>
                </div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              </div>

              <div className="p-6 space-y-6">
                {/* Success Message */}
                {successMessage && (
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <p className="text-green-800 font-medium">{successMessage}</p>
                  </div>
                )}

                {/* General Error Message */}
                {errors.general && (
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <p className="text-red-800 font-medium">{errors.general}</p>
                  </div>
                )}

                {/* Password Fields */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <Lock className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Password Information</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent"></div>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Current Password */}
                    <div className="group space-y-1">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1 group-focus-within:text-blue-600 transition-colors">
                        <Lock className="h-3 w-3" /> Current Password *
                      </label>
                      <div className="relative">
                        <input 
                          type={showPasswords.currentPassword ? "text" : "password"}
                          name="currentPassword" 
                          value={formData.currentPassword} 
                          onChange={handleInputChange} 
                          className={`w-full px-3 py-2 pr-10 bg-white/80 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm text-gray-900 placeholder-gray-400 ${
                            errors.currentPassword ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter your current password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('currentPassword')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPasswords.currentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.currentPassword}
                        </p>
                      )}
                    </div>

                    {/* New Password */}
                    <div className="group space-y-1">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1 group-focus-within:text-blue-600 transition-colors">
                        <Lock className="h-3 w-3" /> New Password *
                      </label>
                      <div className="relative">
                        <input 
                          type={showPasswords.newPassword ? "text" : "password"}
                          name="newPassword" 
                          value={formData.newPassword} 
                          onChange={handleInputChange} 
                          className={`w-full px-3 py-2 pr-10 bg-white/80 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm text-gray-900 placeholder-gray-400 ${
                            errors.newPassword ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter your new password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('newPassword')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPasswords.newPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      
                      {/* Password Strength Indicator */}
                      {formData.newPassword && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  passwordStrength.strength <= 1 ? 'bg-red-500' :
                                  passwordStrength.strength <= 2 ? 'bg-yellow-500' :
                                  passwordStrength.strength <= 3 ? 'bg-blue-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                              ></div>
                            </div>
                            <span className={`text-xs font-medium ${passwordStrength.color}`}>
                              {passwordStrength.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Use 8+ characters with uppercase, lowercase, numbers & symbols
                          </p>
                        </div>
                      )}
                      
                      {errors.newPassword && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.newPassword}
                        </p>
                      )}
                    </div>

                    {/* Confirm New Password */}
                    <div className="group space-y-1">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1 group-focus-within:text-blue-600 transition-colors">
                        <Lock className="h-3 w-3" /> Confirm New Password *
                      </label>
                      <div className="relative">
                        <input 
                          type={showPasswords.confirmPassword ? "text" : "password"}
                          name="confirmPassword" 
                          value={formData.confirmPassword} 
                          onChange={handleInputChange} 
                          className={`w-full px-3 py-2 pr-10 bg-white/80 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm text-gray-900 placeholder-gray-400 ${
                            errors.confirmPassword ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Confirm your new password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirmPassword')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPasswords.confirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      
                      {/* Password Match Indicator */}
                      {formData.confirmPassword && (
                        <div className="flex items-center gap-2">
                          {formData.newPassword === formData.confirmPassword ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-3 w-3" />
                              <span className="text-xs">Passwords match</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-red-600">
                              <AlertCircle className="h-3 w-3" />
                              <span className="text-xs">Passwords don't match</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {errors.confirmPassword && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Security Tips */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Password Security Tips
                  </h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Use a unique password you haven't used elsewhere</li>
                    <li>• Include uppercase letters, lowercase letters, numbers, and symbols</li>
                    <li>• Make it at least 8 characters long (12+ is even better)</li>
                    <li>• Avoid personal information like names, birthdays, or common words</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-4 border-t border-gray-200">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 ${
                      loading 
                        ? 'opacity-70 cursor-not-allowed' 
                        : 'hover:from-blue-700 hover:to-purple-700'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Updating Password...
                      </>
                    ) : (
                      <>
                        <Lock className="h-5 w-5" />
                        Change Password
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;