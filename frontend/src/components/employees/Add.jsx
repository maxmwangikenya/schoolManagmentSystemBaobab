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
    dob: '', // ✅ use `dob` (matches schema)
    gender: '',
    maritalStatus: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const submitData = new FormData();

      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
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
        setFormData({
          name: '',
          email: '',
          employeeId: '',
          dob: '', // ✅ reset consistently
          gender: '',
          maritalStatus: '',
          designation: '',
          department: '',
          salary: '',
          password: '',
          role: '',
          image: null
        });
        setImagePreview(null);
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Failed to add employee');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1">
        <div className="bg-white shadow-sm border-b">
          <Navbar />
        </div>

        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="px-8 py-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <User className="h-8 w-8 text-blue-600" />
                  Add New Employee
                </h1>
                <p className="text-gray-600 mt-2">Fill in the details to add a new employee to your organization</p>
              </div>

              <div className="p-8 space-y-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <User className="h-4 w-4" /> Full Name
                      </label>
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-lg" required />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Mail className="h-4 w-4" /> Email
                      </label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-lg" required />
                    </div>

                    {/* Employee ID */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <CreditCard className="h-4 w-4" /> Employee ID
                      </label>
                      <input type="text" name="employeeId" value={formData.employeeId} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-lg" required />
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Date of Birth
                      </label>
                      <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-lg" required />
                    </div>

                    {/* Gender */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <User className="h-4 w-4" /> Gender
                      </label>
                      <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-lg" required>
                        <option value="">Select gender</option>
                        <option value="Male">Male</option> {/* ✅ match schema enum */}
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Marital Status */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Heart className="h-4 w-4" /> Marital Status
                      </label>
                      <select name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-lg" required>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Professional Info */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">Professional Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Designation */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Briefcase className="h-4 w-4" /> Designation
                      </label>
                      <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-lg" required />
                    </div>

                    {/* Department */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Building className="h-4 w-4" /> Department
                      </label>
                      <select name="department" value={formData.department} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-lg" required disabled={loading}>
                        <option value="">Select department</option>
                        {departments.map(dep => (
                          <option key={dep._id} value={dep._id}>{dep.dep_name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Salary */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" /> Salary
                      </label>
                      <input type="number" name="salary" value={formData.salary} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-lg" required />
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Shield className="h-4 w-4" /> Role
                      </label>
                      <select name="role" value={formData.role} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-lg" required>
                        <option value="">Select role</option>
                        <option value="employee">Employee</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Lock className="h-4 w-4" /> Password
                    </label>
                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-lg" required />
                  </div>
                </div>

                {/* Profile Image */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">Profile Image</h2>
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-24 h-24 rounded-full object-cover border" />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" />
                      <label htmlFor="image-upload" className="px-4 py-2 border rounded-lg cursor-pointer">Choose Image</label>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add Employee</button>
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
