import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  User, 
  Mail, 
  Calendar, 
  Heart, 
  Briefcase, 
  Building, 
  DollarSign, 
  Lock, 
  Shield, 
  Image, 
  CreditCard,
  ArrowLeft,
  UserPlus,
  Save
} from 'lucide-react';
import axios from 'axios';

const AddEmployee = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    employeeId: '',
    dob: '',
    gender: '',
    maritalStatus: 'Single',
    designation: '',
    department: '',
    salary: '',
    password: '',
    role: '',
    image: null
  });
  const API_BASE_URL = import.meta.env.VITE_BACKENDAPI;
  const [departments, setDepartments] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/api/departments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.data.success) {
          setDepartments(response.data.departments || []);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const clearForm = () => {
    setFormData({
      name: '',
      email: '',
      employeeId: '',
      dob: '',
      gender: '',
      maritalStatus: 'Single',
      designation: '',
      department: '',
      salary: '',
      password: '',
      role: '',
      image: null
    });
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (submitting) {
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      const response = await axios.post(`${API_BASE_URL}/api/employees/add`, submitData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        alert('Employee added successfully!');
        clearForm();
      } else {
        throw new Error(response.data.error || 'Unknown error');
      }

    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to add employee';
      alert(`Error: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="absolute inset-0 bg-black/5"></div>
          <div className="absolute top-0 right-0 w-72 h-72 md:w-96 md:h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 md:w-96 md:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          <div className="relative px-6 md:px-8 py-8 md:py-12">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => navigate('/admin-dashboard/employees')}
                  className="bg-white/20 backdrop-blur-md p-3 rounded-xl hover:bg-white/30 transition-all border border-white/30"
                >
                  <ArrowLeft className="w-6 h-6 text-white" />
                </button>
                <div className="text-center lg:text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl border border-white/30">
                      <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                      Add New Employee
                    </h1>
                  </div>
                  <p className="text-white/90 text-sm md:text-base mt-2">
                    Create a new employee profile for your organization
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Personal Information Section */}
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                <p className="text-gray-600 text-sm">Basic employee details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <User className="w-4 h-4 text-green-600" />
                  Full Name *
                </label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-900 placeholder-gray-400 font-medium" 
                  placeholder="Enter full name"
                  required 
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-green-600" />
                  Email Address *
                </label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-900 placeholder-gray-400 font-medium" 
                  placeholder="employee@company.com"
                  required 
                />
              </div>

              {/* Employee ID */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-green-600" />
                  Employee ID *
                </label>
                <input 
                  type="text" 
                  name="employeeId" 
                  value={formData.employeeId} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-900 placeholder-gray-400 font-medium" 
                  placeholder="EMP001"
                  required 
                />
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  Date of Birth
                </label>
                <input 
                  type="date" 
                  name="dob" 
                  value={formData.dob} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-900 font-medium" 
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <User className="w-4 h-4 text-green-600" />
                  Gender *
                </label>
                <select 
                  name="gender" 
                  value={formData.gender} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-900 font-medium appearance-none cursor-pointer" 
                  required
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Marital Status */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-green-600" />
                  Marital Status
                </label>
                <select 
                  name="maritalStatus" 
                  value={formData.maritalStatus} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-900 font-medium appearance-none cursor-pointer"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

          {/* Professional Information Section */}
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Professional Information</h2>
                <p className="text-gray-600 text-sm">Job role and credentials</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Designation */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  Designation *
                </label>
                <input 
                  type="text" 
                  name="designation" 
                  value={formData.designation} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400 font-medium" 
                  placeholder="Software Engineer"
                  required 
                />
              </div>

              {/* Department */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  Department *
                </label>
                <select 
                  name="department" 
                  value={formData.department} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 font-medium appearance-none cursor-pointer" 
                  required 
                  disabled={loading}
                >
                  <option value="">Select department</option>
                  {departments.map(dep => (
                    <option key={dep._id} value={dep._id}>{dep.dep_name}</option>
                  ))}
                </select>
              </div>

              {/* Salary */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  Salary *
                </label>
                <input 
                  type="number" 
                  name="salary" 
                  value={formData.salary} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400 font-medium" 
                  placeholder="50000"
                  required 
                />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  Role *
                </label>
                <select 
                  name="role" 
                  value={formData.role} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 font-medium appearance-none cursor-pointer" 
                  required
                >
                  <option value="">Select role</option>
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Password - Full Width */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  Password *
                </label>
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400 font-medium" 
                  placeholder="Enter secure password"
                  required 
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

          {/* Profile Image Section */}
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-xl shadow-lg">
                <Image className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Profile Image</h2>
                <p className="text-gray-600 text-sm">Upload employee photo (optional)</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
              <div className="flex-shrink-0">
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-xl" 
                    />
                    <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white shadow-lg"></div>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex flex-col items-center justify-center border-4 border-white shadow-xl">
                    <User className="w-12 h-12 text-purple-400 mb-2" />
                    <span className="text-xs text-purple-600 font-medium">No Image</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Upload Employee Photo</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Accepted formats: JPG, PNG • Maximum size: 5MB
                </p>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="hidden" 
                  id="image-upload" 
                />
                <label 
                  htmlFor="image-upload" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl cursor-pointer hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                >
                  <Upload className="w-5 h-5" />
                  Choose Image
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="p-8 bg-gradient-to-r from-gray-50 to-blue-50 border-t-2 border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={() => navigate('/admin-dashboard/employees')}
                className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold shadow-md hover:shadow-lg"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submitting}
                className={`px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all flex items-center justify-center gap-3 ${
                  submitting 
                    ? 'opacity-70 cursor-not-allowed' 
                    : 'hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700'
                }`}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                    <span>Adding Employee...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6" />
                    <span>Add Employee</span>
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

export default AddEmployee;