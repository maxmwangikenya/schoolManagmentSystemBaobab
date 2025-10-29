import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, User, Mail, Calendar, Heart, Briefcase, Building, 
  DollarSign, Lock, Shield, Image, CreditCard, ArrowLeft, 
  UserPlus, Save, Phone, Users, IdCard, AlertCircle, Plus, Minus
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
    phone: '',
    nationalId: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    emergencyContactEmail: '',
    designation: '',
    department: '',
    basicSalary: '',
    housingAllowance: '0',
    transportAllowance: '0',
    medicalAllowance: '0',
    otherAllowance: '0',
    kraPIN: '',
    nssfNumber: '',
    nhifNumber: '',
    password: '',
    role: 'employee',
    image: null
  });

  const API_BASE_URL = import.meta.env.VITE_BACKENDAPI || 'http://localhost:3000';
  const [departments, setDepartments] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [salaryBreakdown, setSalaryBreakdown] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

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

  // Calculate salary breakdown when salary fields change
  useEffect(() => {
    if (formData.basicSalary) {
      calculateSalary();
    }
  }, [
    formData.basicSalary,
    formData.housingAllowance,
    formData.transportAllowance,
    formData.medicalAllowance,
    formData.otherAllowance
  ]);

  const calculateSalary = () => {
    const basic = parseFloat(formData.basicSalary) || 0;
    const housing = parseFloat(formData.housingAllowance) || 0;
    const transport = parseFloat(formData.transportAllowance) || 0;
    const medical = parseFloat(formData.medicalAllowance) || 0;
    const other = parseFloat(formData.otherAllowance) || 0;

    const gross = basic + housing + transport + medical + other;

    // Simple calculations - server will calculate exact amounts
    const nhif = calculateNHIF(gross);
    const nssf = calculateNSSF(gross);
    const housingLevy = gross * 0.015;
    const taxableIncome = gross - nssf - housingLevy;
    const paye = calculatePAYE(taxableIncome);

    const totalDeductions = nhif + nssf + housingLevy + paye;
    const net = gross - totalDeductions;

    setSalaryBreakdown({
      basic,
      allowances: { housing, transport, medical, other },
      gross,
      deductions: {
        nhif: Math.round(nhif),
        nssf: Math.round(nssf),
        housingLevy: Math.round(housingLevy),
        paye: Math.round(paye)
      },
      totalDeductions: Math.round(totalDeductions),
      net: Math.round(net)
    });
  };

  // Simplified NHIF calculation
  const calculateNHIF = (gross) => {
    if (gross <= 5999) return 150;
    if (gross <= 7999) return 300;
    if (gross <= 11999) return 400;
    if (gross <= 14999) return 500;
    if (gross <= 19999) return 600;
    if (gross <= 24999) return 750;
    if (gross <= 29999) return 850;
    if (gross <= 34999) return 900;
    if (gross <= 39999) return 950;
    if (gross <= 44999) return 1000;
    if (gross <= 49999) return 1100;
    if (gross <= 59999) return 1200;
    if (gross <= 69999) return 1300;
    if (gross <= 79999) return 1400;
    if (gross <= 89999) return 1500;
    if (gross <= 99999) return 1600;
    return 1700;
  };

  // Simplified NSSF calculation
  const calculateNSSF = (gross) => {
    const tier1 = Math.min(gross, 7000) * 0.06;
    const tier2 = gross > 7000 ? Math.min(gross - 7000, 29000) * 0.06 : 0;
    return tier1 + tier2;
  };

  // Simplified PAYE calculation
  const calculatePAYE = (taxable) => {
    const annual = taxable * 12;
    let tax = 0;

    if (annual <= 288000) {
      tax = annual * 0.10;
    } else if (annual <= 388000) {
      tax = (288000 * 0.10) + ((annual - 288000) * 0.25);
    } else if (annual <= 6000000) {
      tax = (288000 * 0.10) + (100000 * 0.25) + ((annual - 388000) * 0.30);
    } else if (annual <= 9600000) {
      tax = (288000 * 0.10) + (100000 * 0.25) + (5612000 * 0.30) + ((annual - 6000000) * 0.325);
    } else {
      tax = (288000 * 0.10) + (100000 * 0.25) + (5612000 * 0.30) + (3600000 * 0.325) + ((annual - 9600000) * 0.35);
    }

    tax = Math.max(0, tax - 28800); // Personal relief
    return tax / 12;
  };

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
      phone: '',
      nationalId: '',
      emergencyContactName: '',
      emergencyContactRelationship: '',
      emergencyContactPhone: '',
      emergencyContactEmail: '',
      designation: '',
      department: '',
      basicSalary: '',
      housingAllowance: '0',
      transportAllowance: '0',
      medicalAllowance: '0',
      otherAllowance: '0',
      kraPIN: '',
      nssfNumber: '',
      nhifNumber: '',
      password: '',
      role: 'employee',
      image: null
    });
    setImagePreview(null);
    setSalaryBreakdown(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (submitting) return;

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
        alert('Employee added successfully with automatic salary calculations!');
        clearForm();
        navigate('/admin-dashboard/employees');
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
      <div className="max-w-6xl mx-auto">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="absolute inset-0 bg-black/5"></div>
          <div className="relative px-6 md:px-8 py-8">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/admin-dashboard/employees')}
                className="bg-white/20 backdrop-blur-md p-3 rounded-xl hover:bg-white/30 transition-all"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <UserPlus className="w-8 h-8 text-white" />
                  <h1 className="text-3xl md:text-4xl font-bold text-white">
                    Add New Employee
                  </h1>
                </div>
                <p className="text-white/90">
                  Complete employee profile with automatic salary calculations
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                <p className="text-gray-600 text-sm">Basic employee details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-green-600" />
                  Full Name *
                </label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all" 
                  placeholder="John Doe"
                  required 
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-green-600" />
                  Email *
                </label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all" 
                  placeholder="john@example.com"
                  required 
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-green-600" />
                  Employee ID *
                </label>
                <input 
                  type="text" 
                  name="employeeId" 
                  value={formData.employeeId} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all" 
                  placeholder="EMP001"
                  required 
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-green-600" />
                  Phone Number *
                </label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all" 
                  placeholder="0712345678"
                  required 
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-2">
                  <IdCard className="w-4 h-4 text-green-600" />
                  National ID *
                </label>
                <input 
                  type="text" 
                  name="nationalId" 
                  value={formData.nationalId} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all" 
                  placeholder="12345678"
                  required 
                  maxLength="8"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  Date of Birth
                </label>
                <input 
                  type="date" 
                  name="dob" 
                  value={formData.dob} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all" 
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-2">
                  Gender
                </label>
                <select 
                  name="gender" 
                  value={formData.gender} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all" 
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-green-600" />
                  Marital Status
                </label>
                <select 
                  name="maritalStatus" 
                  value={formData.maritalStatus} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all" 
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-red-500 to-pink-600 p-3 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Emergency Contact</h2>
                <p className="text-gray-600 text-sm">Person to contact in case of emergency</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold text-gray-800 mb-2 block">Contact Name *</label>
                <input 
                  type="text" 
                  name="emergencyContactName" 
                  value={formData.emergencyContactName} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all" 
                  placeholder="Jane Doe"
                  required 
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-800 mb-2 block">Relationship *</label>
                <input 
                  type="text" 
                  name="emergencyContactRelationship" 
                  value={formData.emergencyContactRelationship} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all" 
                  placeholder="Spouse"
                  required 
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-800 mb-2 block">Contact Phone *</label>
                <input 
                  type="tel" 
                  name="emergencyContactPhone" 
                  value={formData.emergencyContactPhone} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all" 
                  placeholder="0723456789"
                  required 
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-800 mb-2 block">Contact Email (Optional)</label>
                <input 
                  type="email" 
                  name="emergencyContactEmail" 
                  value={formData.emergencyContactEmail} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all" 
                  placeholder="jane@example.com"
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Professional Information</h2>
                <p className="text-gray-600 text-sm">Job details and credentials</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold text-gray-800 mb-2 block">Designation *</label>
                <input 
                  type="text" 
                  name="designation" 
                  value={formData.designation} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                  placeholder="Software Engineer"
                  required 
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  Department *
                </label>
                <select 
                  name="department" 
                  value={formData.department} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                  required 
                  disabled={loading}
                >
                  <option value="">Select department</option>
                  {departments.map(dep => (
                    <option key={dep._id} value={dep._id}>{dep.dep_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-800 mb-2 block">KRA PIN (Optional)</label>
                <input 
                  type="text" 
                  name="kraPIN" 
                  value={formData.kraPIN} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                  placeholder="A001234567Z"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-800 mb-2 block">NSSF Number (Optional)</label>
                <input 
                  type="text" 
                  name="nssfNumber" 
                  value={formData.nssfNumber} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                  placeholder="1234567890"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-800 mb-2 block">NHIF Number (Optional)</label>
                <input 
                  type="text" 
                  name="nhifNumber" 
                  value={formData.nhifNumber} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                  placeholder="1234567890"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  Role *
                </label>
                <select 
                  name="role" 
                  value={formData.role} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                  required
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  Password *
                </label>
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                  placeholder="Enter secure password"
                  required 
                />
              </div>
            </div>
          </div>

          {/* Salary & Deductions */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Salary & Deductions</h2>
                  <p className="text-gray-600 text-sm">Automatic KRA tax calculations</p>
                </div>
              </div>
              {salaryBreakdown && (
                <button
                  type="button"
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-semibold"
                >
                  {showBreakdown ? 'Hide' : 'Show'} Breakdown
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold text-gray-800 mb-2 block">Basic Salary (KES) *</label>
                <input 
                  type="number" 
                  name="basicSalary" 
                  value={formData.basicSalary} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" 
                  placeholder="50000"
                  required 
                  min="0"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-800 mb-2 block">Housing Allowance (KES)</label>
                <input 
                  type="number" 
                  name="housingAllowance" 
                  value={formData.housingAllowance} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" 
                  placeholder="15000"
                  min="0"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-800 mb-2 block">Transport Allowance (KES)</label>
                <input 
                  type="number" 
                  name="transportAllowance" 
                  value={formData.transportAllowance} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" 
                  placeholder="10000"
                  min="0"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-800 mb-2 block">Medical Allowance (KES)</label>
                <input 
                  type="number" 
                  name="medicalAllowance" 
                  value={formData.medicalAllowance} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" 
                  placeholder="5000"
                  min="0"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-bold text-gray-800 mb-2 block">Other Allowances (KES)</label>
                <input 
                  type="number" 
                  name="otherAllowance" 
                  value={formData.otherAllowance} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" 
                  placeholder="3000"
                  min="0"
                />
              </div>
            </div>

            {/* Salary Breakdown */}
            {showBreakdown && salaryBreakdown && (
              <div className="mt-6 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Salary Breakdown Preview</h3>
                
                <div className="space-y-4">
                  {/* Earnings */}
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">Earnings</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Basic Salary:</span>
                        <span className="font-semibold">KES {salaryBreakdown.basic.toLocaleString()}</span>
                      </div>
                      {salaryBreakdown.allowances.housing > 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span>Housing Allowance:</span>
                          <span>KES {salaryBreakdown.allowances.housing.toLocaleString()}</span>
                        </div>
                      )}
                      {salaryBreakdown.allowances.transport > 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span>Transport Allowance:</span>
                          <span>KES {salaryBreakdown.allowances.transport.toLocaleString()}</span>
                        </div>
                      )}
                      {salaryBreakdown.allowances.medical > 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span>Medical Allowance:</span>
                          <span>KES {salaryBreakdown.allowances.medical.toLocaleString()}</span>
                        </div>
                      )}
                      {salaryBreakdown.allowances.other > 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span>Other Allowances:</span>
                          <span>KES {salaryBreakdown.allowances.other.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t border-green-200 font-bold text-green-700">
                        <span>Gross Salary:</span>
                        <span>KES {salaryBreakdown.gross.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div>
                    <h4 className="font-semibold text-red-700 mb-2">Deductions</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>NHIF:</span>
                        <span>KES {salaryBreakdown.deductions.nhif.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>NSSF:</span>
                        <span>KES {salaryBreakdown.deductions.nssf.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Housing Levy (1.5%):</span>
                        <span>KES {salaryBreakdown.deductions.housingLevy.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>PAYE (Tax):</span>
                        <span>KES {salaryBreakdown.deductions.paye.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-red-200 font-bold text-red-700">
                        <span>Total Deductions:</span>
                        <span>KES {salaryBreakdown.totalDeductions.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Net Salary */}
                  <div className="pt-3 border-t-2 border-purple-300">
                    <div className="flex justify-between text-lg font-bold text-purple-700">
                      <span>Net Salary:</span>
                      <span>KES {salaryBreakdown.net.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800">
                      This is a preview calculation. Final amounts will be calculated by the server using official KRA tax rates for 2024/2025.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Image */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 p-3 rounded-xl">
                <Image className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Profile Image</h2>
                <p className="text-gray-600 text-sm">Upload employee photo (optional)</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border-2 border-orange-200">
              <div className="flex-shrink-0">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-xl" 
                  />
                ) : (
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-orange-100 to-red-100 flex flex-col items-center justify-center border-4 border-white shadow-xl">
                    <User className="w-12 h-12 text-orange-400 mb-2" />
                    <span className="text-xs text-orange-600 font-medium">No Image</span>
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
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl cursor-pointer hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                >
                  <Upload className="w-5 h-5" />
                  Choose Image
                </label>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl shadow-xl p-8">
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
                    <span>Add Employee with Auto Calculations</span>
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