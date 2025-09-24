import React, { useState, useEffect } from 'react';
import { Upload, User, Mail, Calendar, Heart, Briefcase, Building, DollarSign, Lock, Shield, Image, CreditCard } from 'lucide-react';
import AdminSidebar from '../dashboard/AdminSidebar';
import Navbar from '../dashboard/Navbar';
import axios from 'axios';

const AddEmployee = () => {
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
        const response = await axios.get('http://localhost:3000/api/departments/add', {
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

      const response = await axios.post('http://localhost:3000/api/employees/add', submitData, {
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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <AdminSidebar />
      <div className="flex-1">
        <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20">
          <Navbar />
        </div>

        <div className="p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Compact Header */}
            <div className="mb-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mb-3 shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-1">
                Add New Employee
              </h1>
              <p className="text-gray-600">Create a new employee profile</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 overflow-hidden">
              {/* Compact Form Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-white" />
                    Employee Information
                  </h2>
                </div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              </div>

              <div className="p-6 space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-emerald-200 to-transparent"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="group space-y-1">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1 group-focus-within:text-emerald-600 transition-colors">
                        <User className="h-3 w-3" /> Full Name *
                      </label>
                      <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleInputChange} 
                        className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 text-sm text-gray-900 placeholder-gray-400" 
                        placeholder="Enter full name"
                        required 
                      />
                    </div>

                    {/* Email */}
                    <div className="group space-y-1">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1 group-focus-within:text-emerald-600 transition-colors">
                        <Mail className="h-3 w-3" /> Email Address *
                      </label>
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 text-sm text-gray-900 placeholder-gray-400" 
                        placeholder="employee@company.com"
                        required 
                      />
                    </div>

                    {/* Employee ID */}
                    <div className="group space-y-1">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1 group-focus-within:text-emerald-600 transition-colors">
                        <CreditCard className="h-3 w-3" /> Employee ID *
                      </label>
                      <input 
                        type="text" 
                        name="employeeId" 
                        value={formData.employeeId} 
                        onChange={handleInputChange} 
                        className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 text-sm text-gray-900 placeholder-gray-400" 
                        placeholder="EMP001"
                        required 
                      />
                    </div>

                    {/* Date of Birth */}
                    <div className="group space-y-1">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1 group-focus-within:text-emerald-600 transition-colors">
                        <Calendar className="h-3 w-3" /> Date of Birth
                      </label>
                      <input 
                        type="date" 
                        name="dob" 
                        value={formData.dob} 
                        onChange={handleInputChange} 
                        className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 text-sm text-gray-900" 
                      />
                    </div>

                    {/* Gender */}
                    <div className="group space-y-1">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1 group-focus-within:text-emerald-600 transition-colors">
                        <User className="h-3 w-3" /> Gender *
                      </label>
                      <select 
                        name="gender" 
                        value={formData.gender} 
                        onChange={handleInputChange} 
                        className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 text-sm text-gray-900 appearance-none cursor-pointer" 
                        required
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Marital Status */}
                    <div className="group space-y-1">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1 group-focus-within:text-emerald-600 transition-colors">
                        <Heart className="h-3 w-3" /> Marital Status
                      </label>
                      <select 
                        name="maritalStatus" 
                        value={formData.maritalStatus} 
                        onChange={handleInputChange} 
                        className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 text-sm text-gray-900 appearance-none cursor-pointer"
                      >
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <Briefcase className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Designation */}
                    <div className="group space-y-1">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1 group-focus-within:text-blue-600 transition-colors">
                        <Briefcase className="h-3 w-3" /> Designation *
                      </label>
                      <input 
                        type="text" 
                        name="designation" 
                        value={formData.designation} 
                        onChange={handleInputChange} 
                        className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm text-gray-900 placeholder-gray-400" 
                        placeholder="Software Engineer"
                        required 
                      />
                    </div>

                    {/* Department */}
                    <div className="group space-y-1">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1 group-focus-within:text-blue-600 transition-colors">
                        <Building className="h-3 w-3" /> Department *
                      </label>
                      <select 
                        name="department" 
                        value={formData.department} 
                        onChange={handleInputChange} 
                        className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm text-gray-900 appearance-none cursor-pointer" 
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
                    <div className="group space-y-1">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1 group-focus-within:text-blue-600 transition-colors">
                        <DollarSign className="h-3 w-3" /> Salary *
                      </label>
                      <input 
                        type="number" 
                        name="salary" 
                        value={formData.salary} 
                        onChange={handleInputChange} 
                        className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm text-gray-900 placeholder-gray-400" 
                        placeholder="50000"
                        required 
                      />
                    </div>

                    {/* Role */}
                    <div className="group space-y-1">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1 group-focus-within:text-blue-600 transition-colors">
                        <Shield className="h-3 w-3" /> Role *
                      </label>
                      <select 
                        name="role" 
                        value={formData.role} 
                        onChange={handleInputChange} 
                        className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm text-gray-900 appearance-none cursor-pointer" 
                        required
                      >
                        <option value="">Select role</option>
                        <option value="employee">Employee</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>

                  {/* Password - Full Width */}
                  <div className="group space-y-1">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1 group-focus-within:text-blue-600 transition-colors">
                      <Lock className="h-3 w-3" /> Password *
                    </label>
                    <input 
                      type="password" 
                      name="password" 
                      value={formData.password} 
                      onChange={handleInputChange} 
                      className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm text-gray-900 placeholder-gray-400" 
                      placeholder="Enter secure password"
                      required 
                    />
                  </div>
                </div>

                {/* Compact Profile Image */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Image className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Profile Image</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-transparent"></div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                    <div className="flex-shrink-0">
                      {imagePreview ? (
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-md" 
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-2 border-white shadow-md">
                          <User className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 mb-1">Upload Photo</p>
                      <p className="text-xs text-gray-600 mb-2">JPG, PNG (Optional)</p>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange} 
                        className="hidden" 
                        id="image-upload" 
                      />
                      <label 
                        htmlFor="image-upload" 
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg cursor-pointer hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
                      >
                        <Upload className="h-4 w-4" />
                        Choose Image
                      </label>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-4 border-t border-gray-200">
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 ${
                      submitting 
                        ? 'opacity-70 cursor-not-allowed' 
                        : 'hover:from-blue-700 hover:to-purple-700'
                    }`}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Adding Employee...
                      </>
                    ) : (
                      <>
                        <User className="h-5 w-5" />
                        Add Employee
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

export default AddEmployee;