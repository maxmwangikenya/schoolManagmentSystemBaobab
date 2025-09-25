import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../dashboard/AdminSidebar';
import Navbar from '../dashboard/Navbar';
import { useParams } from 'react-router-dom';

const AddDepartment = () => {
  const [formData, setFormData] = useState({
    dep_name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.dep_name.trim()) {
      setError('Department name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/api/departments/add', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          dep_name: '',
          description: ''
        });
        
        // Show success message and redirect after 2 seconds
        setTimeout(() => {
          navigate('/admin-dashboard/departments');
        }, 2000);
      } else {
        setError(response.data.error || 'Failed to add department');
      }
    } catch (err) {
      console.error('Error adding department:', err);
      setError(err.response?.data?.error || 'Error adding department');
    } finally {
      setLoading(false);
    }
  };

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
                to="/admin-dashboard/departments"
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
                    Add New Department
                  </h1>
                  <p className="text-slate-600 text-lg">Create a new department for your organization</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 rounded-3xl opacity-10 blur-2xl"></div>
              
              <div className="relative bg-white/85 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                {/* Form Header */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-8">
                  <div className="flex items-center space-x-4">
                    <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Department Information</h2>
                      <p className="text-blue-100 text-lg">Fill in the details to create a new department</p>
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
                            <p className="text-emerald-800 font-bold text-lg">Department added successfully!</p>
                            <p className="text-emerald-600 text-sm">Redirecting to departments list...</p>
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
                    {/* Department Name */}
                    <div className="relative">
                      <label htmlFor="dep_name" className="block text-sm font-bold text-slate-800 mb-4 flex items-center">
                        <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                          Department Name
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
                        <input
                          type="text"
                          id="dep_name"
                          name="dep_name"
                          value={formData.dep_name}
                          onChange={handleInputChange}
                          placeholder="Enter department name"
                          className="relative w-full pl-14 pr-6 py-5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 text-lg font-semibold bg-white/80 backdrop-blur-sm shadow-lg focus:shadow-xl placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="relative">
                      <label htmlFor="description" className="block text-sm font-bold text-slate-800 mb-4">
                        <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                          Description
                        </span>
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-20 blur-sm group-focus-within:opacity-30 transition-opacity duration-300"></div>
                        <div className="absolute top-5 left-5 pointer-events-none">
                          <svg className="h-6 w-6 text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                          </svg>
                        </div>
                        <textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Enter department description (optional)"
                          rows={5}
                          className="relative w-full pl-14 pr-6 py-5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 resize-none bg-white/80 backdrop-blur-sm shadow-lg focus:shadow-xl placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={loading}
                        />
                      </div>
                    </div>

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
                            <span>Adding Department...</span>
                          </>
                        ) : success ? (
                          <>
                            <div className="p-1 bg-white/20 rounded-lg">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span>Department Created!</span>
                          </>
                        ) : (
                          <>
                            <div className="p-1 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all duration-300">
                              <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                              </svg>
                            </div>
                            <span>Add Department</span>
                            <div className="w-2 h-2 bg-white/40 rounded-full group-hover:bg-white/60 transition-all duration-300"></div>
                          </>
                        )}
                      </button>
                      
                      <Link
                        to="/admin-dashboard/departments"
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

export default AddDepartment;