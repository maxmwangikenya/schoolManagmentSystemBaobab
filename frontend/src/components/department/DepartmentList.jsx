import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../dashboard/AdminSidebar';
import Navbar from '../dashboard/Navbar';

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const API_BASE_URL = import.meta.env.VITE_BACKENDAPI;
  
  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [departmentToEdit, setDepartmentToEdit] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    dep_name: '',
    description: ''
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Show 5 departments per page

  // Filter departments based on search term
  const filteredDepartments = departments.filter(department =>
    department.dep_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (department.description && department.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Fetch departments
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/departments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setDepartments(response.data.departments);
      } else {
        setError('Failed to fetch departments');
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError('Error loading departments');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit - open modal with department data
  const handleEdit = (department) => {
    setDepartmentToEdit(department);
    setEditFormData({
      dep_name: department.dep_name,
      description: department.description || ''
    });
    setShowEditModal(true);
  };

  // Handle edit form input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit edit form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!editFormData.dep_name.trim()) {
      setError('Department name is required');
      return;
    }

    try {
      setEditLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.patch(
        `${API_BASE_URL}/api/departments/add/${departmentToEdit._id}`, 
        {
          dep_name: editFormData.dep_name.trim(),
          description: editFormData.description.trim()
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Update the department in the state
        setDepartments(departments.map(dep => 
          dep._id === departmentToEdit._id 
            ? { ...dep, dep_name: editFormData.dep_name, description: editFormData.description }
            : dep
        ));
        
        setSuccessMessage('Department updated successfully!');
        setShowEditModal(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response.data.error || 'Failed to update department');
      }
    } catch (err) {
      console.error('Error updating department:', err);
      setError(err.response?.data?.error || 'Error updating department');
    } finally {
      setEditLoading(false);
    }
  };

  // Cancel edit
  const cancelEdit = () => {
    setShowEditModal(false);
    setDepartmentToEdit(null);
    setEditFormData({
      dep_name: '',
      description: ''
    });
  };

  // Handle delete confirmation
  const handleDeleteClick = (department) => {
    setDepartmentToDelete(department);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!departmentToDelete) return;

    try {
      setDeleteLoading(departmentToDelete._id);
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(`${API_BASE_URL}/api/departments/add/${departmentToDelete._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Remove department from state
        setDepartments(departments.filter(dep => dep._id !== departmentToDelete._id));
        setSuccessMessage('Department deleted successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response.data.error || 'Failed to delete department');
      }
    } catch (err) {
      console.error('Error deleting department:', err);
      setError(err.response?.data?.error || 'Error deleting department');
    } finally {
      setDeleteLoading(null);
      setShowDeleteModal(false);
      setDepartmentToDelete(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDepartmentToDelete(null);
  };

  // Clear messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (loading) {
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
              <p className="mt-6 text-slate-600 text-lg font-medium">Loading departments...</p>
              <p className="mt-2 text-slate-400">Please wait while we fetch your data</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pagination Logic - now using filtered departments
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDepartments = filteredDepartments.slice(startIndex, startIndex + itemsPerPage);

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generate page numbers (show max 5 pages, with ellipsis if needed)
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
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
      <div className="mb-8">
        <div className="flex justify-between items-center mb-8">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-10 blur-xl"></div>
            <div className="relative">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                Departments
              </h1>
              <p className="text-slate-600 text-lg">Manage your organization's departments with ease</p>
            </div>
          </div>
          <Link
            to="/admin-dashboard/add-department"
            className="group px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-800 rounded-2xl text-white font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 flex items-center gap-3"
          >
            <div className="p-1 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all duration-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span>Add Department</span>
            <div className="w-2 h-2 bg-white/40 rounded-full group-hover:bg-white/60 transition-all duration-300"></div>
          </Link>
        </div>
        
        {/* Enhanced Search Bar with functionality */}
        <div className="flex justify-center mb-6">
          <div className="relative w-full max-w-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-20 blur-sm"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="block w-full pl-12 pr-12 py-4 border-0 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:outline-none bg-transparent text-slate-900 placeholder-slate-500 text-lg font-medium transition-all duration-300"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                {searchTerm ? (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="p-2 text-slate-400 hover:text-red-600 transition-all duration-300 hover:bg-red-50 rounded-lg group"
                    title="Clear search"
                  >
                    <svg className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                ) : (
                  <div className="p-2 text-slate-300">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div className="flex justify-center mb-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
              <p className="text-slate-600 text-sm font-medium">
                {filteredDepartments.length === 0 ? (
                  <>No departments found for "<span className="font-bold text-slate-800">{searchTerm}</span>"</>
                ) : filteredDepartments.length === 1 ? (
                  <>Found 1 department matching "<span className="font-bold text-slate-800">{searchTerm}</span>"</>
                ) : (
                  <>Found {filteredDepartments.length} departments matching "<span className="font-bold text-slate-800">{searchTerm}</span>"</>
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl opacity-20 blur-sm"></div>
          <div className="relative p-6 bg-white/80 backdrop-blur-sm border-l-4 border-emerald-500 rounded-2xl shadow-xl">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-emerald-800 font-semibold text-lg">{successMessage}</p>
                <p className="text-emerald-600 text-sm">Operation completed successfully</p>
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
                <div className="p-2 bg-red-100 rounded-xl">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-red-800 font-semibold text-lg">{error}</p>
                <p className="text-red-600 text-sm">Please try again or contact support</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Departments Table */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl opacity-10 blur-2xl"></div>
        <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {filteredDepartments.length === 0 ? (
            <div className="text-center py-20">
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-400 to-slate-600 rounded-full opacity-20 blur-xl"></div>
                <div className="relative p-6 bg-slate-100 rounded-full">
                  {searchTerm ? (
                    <svg className="w-20 h-20 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  ) : (
                    <svg className="w-20 h-20 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  )}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                {searchTerm ? 'No matching departments found' : 'No departments found'}
              </h3>
              <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto">
                {searchTerm ? (
                  <>Try adjusting your search criteria or <button onClick={clearSearch} className="text-indigo-600 hover:text-indigo-800 font-semibold underline">clear the search</button> to see all departments.</>
                ) : (
                  'Start building your organization structure by creating your first department.'
                )}
              </p>
              {!searchTerm && (
                <Link
                  to="/admin-dashboard/add-department"
                  className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  <svg className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create First Department
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <tr>
                      <th className="px-8 py-6 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                        Department Name
                      </th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                        Created Date
                      </th>
                      <th className="px-8 py-6 text-right text-sm font-bold text-slate-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentDepartments.map((department, index) => (
                      <tr key={department._id} className="group hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300">
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-lg">
                                  {department.dep_name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition-colors duration-300">
                                {department.dep_name}
                              </div>
                              <div className="text-sm text-slate-500">Department #{startIndex + index + 1}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-slate-600 max-w-xs">
                            <p className="truncate font-medium">
                              {department.description || (
                                <span className="text-slate-400 italic">No description provided</span>
                              )}
                            </p>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="text-sm font-semibold text-slate-900">
                              {new Date(department.createdAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </div>
                            <div className="text-xs text-slate-500">
                              {new Date(department.createdAt).toLocaleDateString('en-US', { weekday: 'long' })}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-3">
                            {/* Edit Button */}
                            <button
                              onClick={() => handleEdit(department)}
                              className="group inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                              <svg className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteClick(department)}
                              disabled={deleteLoading === department._id}
                              className="group inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                              {deleteLoading === department._id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                              ) : (
                                <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Enhanced Pagination - only show if there are results */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center py-8 bg-gradient-to-r from-slate-50 to-slate-100 border-t border-slate-200">
                  <div className="flex items-center space-x-2">
                    {/* Previous Arrow */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="group p-3 rounded-2xl border-2 border-slate-200 bg-white hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-200 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
                      aria-label="Previous Page"
                    >
                      <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {getPageNumbers().map((page, index) => (
                        <button
                          key={index}
                          onClick={() => typeof page === 'number' && handlePageChange(page)}
                          className={`min-w-[3rem] h-12 rounded-2xl text-sm font-bold transition-all duration-300 transform hover:-translate-y-0.5 ${
                            currentPage === page
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl scale-110'
                              : 'bg-white border-2 border-slate-200 text-slate-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-300 hover:text-indigo-700 shadow-md hover:shadow-lg'
                          } ${page === '...' ? 'cursor-default hover:transform-none hover:shadow-md' : 'cursor-pointer'}`}
                          disabled={page === '...'}
                          aria-label={typeof page === 'number' ? `Page ${page}` : undefined}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    {/* Next Arrow */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="group p-3 rounded-2xl border-2 border-slate-200 bg-white hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-200 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
                      aria-label="Next Page"
                    >
                      <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  </div>

      {/* Enhanced Edit Department Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={cancelEdit}>
          <div className="relative max-w-2xl w-full transform transition-all duration-300 scale-100" onClick={(e) => e.stopPropagation()}>
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl opacity-20 blur-2xl animate-pulse"></div>
            
            <div className="relative bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl border border-white/20 overflow-hidden">
              {/* Enhanced Header */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Edit Department</h3>
                      <p className="text-blue-100 text-lg">Update department information and settings</p>
                    </div>
                  </div>
                  <button
                    onClick={cancelEdit}
                    className="group text-white/80 hover:text-white transition-all duration-300 p-3 hover:bg-white/10 rounded-2xl"
                  >
                    <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Enhanced Form Content */}
              <div className="p-10">
                <form onSubmit={handleEditSubmit} className="space-y-8">
                  {/* Department Name */}
                  <div className="relative">
                    <label htmlFor="dep_name" className="block text-sm font-bold text-slate-800 mb-4 flex items-center">
                      <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                        Department Name
                      </span>
                      <span className="text-red-500 ml-2 text-lg">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-20 blur-sm group-focus-within:opacity-30 transition-opacity duration-300"></div>
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <svg className="h-6 w-6 text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        id="dep_name"
                        name="dep_name"
                        value={editFormData.dep_name}
                        onChange={handleEditInputChange}
                        required
                        className="relative w-full pl-14 pr-6 py-5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 text-lg font-semibold bg-white/80 backdrop-blur-sm shadow-lg focus:shadow-xl"
                        placeholder="Enter department name"
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
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-20 blur-sm group-focus-within:opacity-30 transition-opacity duration-300"></div>
                      <div className="absolute top-5 left-5 pointer-events-none">
                        <svg className="h-6 w-6 text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                      </div>
                      <textarea
                        id="description"
                        name="description"
                        value={editFormData.description}
                        onChange={handleEditInputChange}
                        rows={4}
                        className="relative w-full pl-14 pr-6 py-5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 resize-none bg-white/80 backdrop-blur-sm shadow-lg focus:shadow-xl"
                        placeholder="Enter department description (optional)"
                      />
                    </div>
                  </div>

                  {/* Enhanced Action Buttons */}
                  <div className="flex justify-end space-x-4 pt-8 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={editLoading}
                      className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all duration-300 font-semibold disabled:opacity-50 border-2 border-slate-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editLoading}
                      className="group px-10 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white rounded-2xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800 transition-all duration-300 font-semibold disabled:opacity-50 flex items-center space-x-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
                    >
                      {editLoading && (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      )}
                      <span>{editLoading ? 'Updating...' : 'Update Department'}</span>
                      {!editLoading && (
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={cancelDelete}>
          <div className="relative max-w-md w-full transform transition-all duration-300 scale-100" onClick={(e) => e.stopPropagation()}>
            {/* Animated danger background */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-rose-600 rounded-3xl opacity-20 blur-2xl animate-pulse"></div>
            
            <div className="relative bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl border border-white/20 overflow-hidden">
              <div className="p-8">
                {/* Enhanced Modal Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="p-4 bg-red-100 rounded-2xl">
                      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Confirm Deletion</h3>
                      <p className="text-slate-600">This action cannot be undone</p>
                    </div>
                  </div>
                  <button
                    onClick={cancelDelete}
                    className="group text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg"
                  >
                    <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Enhanced Content */}
                <div className="mb-8 p-6 bg-red-50 rounded-2xl border-l-4 border-red-500">
                  <p className="text-slate-700 text-lg leading-relaxed">
                    Are you sure you want to delete the department{' '}
                    <span className="font-bold text-red-800 bg-red-100 px-2 py-1 rounded-lg">
                      "{departmentToDelete?.dep_name}"
                    </span>
                    ?
                  </p>
                  <p className="text-red-600 font-semibold mt-3">This action is permanent and cannot be reversed.</p>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={cancelDelete}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="group px-6 py-3 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white rounded-2xl transition-all duration-300 font-semibold flex items-center space-x-2 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
                  >
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete Department</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentList;