import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Building,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Calendar
} from 'lucide-react';

const DepartmentList = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
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
  const itemsPerPage = 6;

  // Filter departments based on search term
  const filteredDepartments = departments.filter(department =>
    department?.dep_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (department?.description && department.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

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
      
      if (response.data.success && Array.isArray(response.data.departments)) {
        setDepartments(response.data.departments);
      } else {
        setError('Failed to fetch departments: Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError('Error loading departments: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (department) => {
    if (!department) {
      console.error('Department is undefined');
      setError('Cannot edit: Department data is missing');
      return;
    }

    if (!department._id || !department.dep_name) {
      console.error('Invalid department data:', department);
      setError('Cannot edit: Invalid department data');
      return;
    }

    setDepartmentToEdit(department);
    setEditFormData({
      dep_name: department.dep_name || '',
      description: department.description || ''
    });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editFormData.dep_name.trim()) {
      setError('Department name is required');
      return;
    }

    if (!departmentToEdit?._id) {
      setError('Invalid department data');
      return;
    }

    try {
      setEditLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.patch(
        `${API_BASE_URL}/api/departments/${departmentToEdit._id}`, 
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
        setDepartments(departments.map(dep => 
          dep._id === departmentToEdit._id 
            ? { ...dep, dep_name: editFormData.dep_name, description: editFormData.description }
            : dep
        ));
        
        setSuccessMessage('Department updated successfully!');
        setShowEditModal(false);
        
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

  const cancelEdit = () => {
    setShowEditModal(false);
    setDepartmentToEdit(null);
    setEditFormData({
      dep_name: '',
      description: ''
    });
  };

  const handleDeleteClick = (department) => {
    if (!department || !department._id) {
      console.error('Invalid department for deletion:', department);
      setError('Cannot delete: Invalid department data');
      return;
    }

    setDepartmentToDelete(department);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!departmentToDelete || !departmentToDelete._id) {
      setError('Invalid department data for deletion');
      setShowDeleteModal(false);
      return;
    }

    try {
      setDeleteLoading(departmentToDelete._id);
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(`${API_BASE_URL}/api/departments/${departmentToDelete._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setDepartments(departments.filter(dep => dep._id !== departmentToDelete._id));
        setSuccessMessage('Department deleted successfully!');
        
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

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDepartmentToDelete(null);
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-blue-600 mx-auto"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-blue-400 opacity-20 mx-auto"></div>
          </div>
          <p className="mt-6 text-lg text-gray-700 font-semibold">Loading departments...</p>
        </div>
      </div>
    );
  }

  // Pagination Logic
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDepartments = filteredDepartments.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
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
                      <Building className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                      Departments
                    </h1>
                  </div>
                  <p className="text-white/90 text-sm md:text-base mt-2">
                    Manage your organization's departments • {departments.length} Total
                  </p>
                </div>
              </div>

              <Link
                to="/admin-dashboard/add-department"
                className="bg-white hover:bg-gray-50 text-indigo-600 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Add Department
              </Link>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search departments by name or description..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400 font-medium"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4 shadow-lg">
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

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-red-800 font-semibold">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Departments Grid */}
        {filteredDepartments.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {searchTerm ? 'No departments found' : 'No departments yet'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm 
                ? 'Try adjusting your search criteria to find what you\'re looking for.' 
                : 'Get started by creating your first department to organize your organization.'
              }
            </p>
            {!searchTerm && (
              <Link
                to="/admin-dashboard/add-department"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
              >
                <Plus className="w-5 h-5" />
                Add First Department
              </Link>
            )}
          </div>
        ) : (
          <div>
            {/* Department Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentDepartments.map((department, index) => {
                if (!department || !department._id) {
                  return null;
                }
                
                return (
                  <div 
                    key={department._id} 
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden"
                  >
                    {/* Gradient Header */}
                    <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-24 relative">
                      <div className="absolute inset-0 bg-black/5"></div>
                      <div className="absolute -bottom-12 left-6">
                        <div className="relative">
                          <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center border-4 border-white shadow-xl">
                            <span className="text-white font-bold text-3xl">
                              {(department.dep_name?.charAt(0) || 'D').toUpperCase()}
                            </span>
                          </div>
                          <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="pt-16 px-6 pb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{department.dep_name || 'Unnamed Department'}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">
                        {department.description || 'No description provided'}
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg px-3 py-2">
                          <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Created
                          </span>
                          <span className="text-xs font-bold text-blue-700">
                            {department.createdAt ? new Date(department.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(department)}
                          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(department)}
                          disabled={deleteLoading === department._id}
                          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-semibold rounded-xl hover:from-red-600 hover:to-rose-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {deleteLoading === department._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-md hover:shadow-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`w-12 h-12 rounded-xl font-bold transition-all ${
                            currentPage === pageNumber
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-110'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-md hover:shadow-lg"
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="text-center mt-4 text-sm text-gray-600 font-medium">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredDepartments.length)} of {filteredDepartments.length} departments
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={cancelEdit}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 rounded-t-3xl relative overflow-hidden">
              <div className="absolute inset-0 bg-black/5"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/30">
                    <Edit className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white">Edit Department</h3>
                    <p className="text-blue-100 mt-1">Update department information</p>
                  </div>
                </div>
                <button
                  onClick={cancelEdit}
                  className="bg-white/20 backdrop-blur-md hover:bg-white/30 p-3 rounded-xl transition-all border border-white/30"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="p-8">
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    name="dep_name"
                    value={editFormData.dep_name}
                    onChange={handleEditInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                    placeholder="Enter department name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none font-medium"
                    placeholder="Enter department description (optional)"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={editLoading}
                    className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {editLoading && (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    )}
                    <span>{editLoading ? 'Updating...' : 'Update Department'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={cancelDelete}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full transform transition-all" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-red-100 p-4 rounded-2xl">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Confirm Deletion</h3>
                  <p className="text-gray-600">This action cannot be undone</p>
                </div>
              </div>

              <div className="mb-6 p-4 bg-red-50 rounded-xl border-l-4 border-red-500">
                <p className="text-gray-700 leading-relaxed">
                  Are you sure you want to delete{' '}
                  <span className="font-bold text-red-800">
                    "{departmentToDelete?.dep_name || 'Unknown Department'}"
                  </span>
                  ?
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl hover:from-red-700 hover:to-rose-800 transition-all font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Department
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentList;