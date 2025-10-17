import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Shield, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Key,
  Info
} from 'lucide-react';
import axios from 'axios';

const ChangePassword = () => {
  const navigate = useNavigate();
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

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters long';
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

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
        
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      } else {
        throw new Error(response.data.error || 'Unknown error');
      }

    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to change password';
      
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="absolute inset-0 bg-black/5"></div>
          <div className="absolute top-0 right-0 w-72 h-72 md:w-96 md:h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 md:w-96 md:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          <div className="relative px-6 md:px-8 py-8 md:py-12">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => navigate('/admin-dashboard')}
                  className="bg-white/20 backdrop-blur-md p-3 rounded-xl hover:bg-white/30 transition-all border border-white/30"
                >
                  <ArrowLeft className="w-6 h-6 text-white" />
                </button>
                <div className="text-center lg:text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl border border-white/30">
                      <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                      Change Password
                    </h1>
                  </div>
                  <p className="text-white/90 text-sm md:text-base mt-2">
                    Update your account password for enhanced security
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl overflow-hidden">
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

          {/* Password Fields Section */}
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                <Key className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Password Information</h2>
                <p className="text-gray-600 text-sm">Enter your current and new password</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Current Password */}
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
                    placeholder="Enter your new password"
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
                    placeholder="Confirm your new password"
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
                onClick={() => navigate('/admin-dashboard')}
                className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold shadow-md hover:shadow-lg"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
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
                    <span>Change Password</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;