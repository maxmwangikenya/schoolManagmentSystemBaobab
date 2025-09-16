import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../dashboard/AdminSidebar';
import Navbar from '../Navbar';
import DataTable from 'react-data-table-component';
import { columns, DepartmentButtonV2 } from "../../utils/DepartmentHelper";

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();

  // Debug: Log when component mounts and unmounts
  useEffect(() => {
    console.log('DepartmentList component mounted');
    
    return () => {
      console.log('DepartmentList component unmounted');
    };
  }, []);

  // Debug: Log token presence
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token present:', !!token);
    console.log('Token value:', token ? token.substring(0, 20) + '...' : 'No token');
    
    if (!token) {
      console.warn('No authentication token found');
      // Don't redirect immediately, let user see the error
      setError('No authentication token found. Please login.');
      setLoading(false);
      return;
    }
    
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      console.log('Fetching departments...');
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      console.log('Making API request to:', 'http://localhost:3000/api/departments');
      
      const response = await axios.get('http://localhost:3000/api/departments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        const formattedData = response.data.departments.map((dep, index) => ({
          id: dep._id,
          sno: index + 1,
          dep_name: dep.dep_name,
          description: dep.description,
          originalData: dep,
          action: (
            <DepartmentButtonV2 
              departmentId={dep._id}
              departmentData={dep}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )
        }));
        
        console.log('Formatted data:', formattedData);
        setDepartments(formattedData);
        setFilteredDepartments(formattedData);
      } else {
        console.error('API returned success: false', response.data);
        setError('Failed to fetch departments: ' + (response.data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
        // Optional: redirect to login after showing error
        setTimeout(() => {
          localStorage.removeItem('token');
          navigate('/login');
        }, 3000);
      } else {
        setError(err.response?.data?.error || 'Error fetching departments: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  useEffect(() => {
    console.log('Search term changed:', searchTerm);
    const filtered = departments.filter(department =>
      department.dep_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    console.log('Filtered results:', filtered.length);
    setFilteredDepartments(filtered);
  }, [searchTerm, departments]);

  const handleEdit = (departmentId, departmentData) => {
    console.log('Edit clicked - Department ID:', departmentId);
    console.log('Edit clicked - Department Data:', departmentData);
    
    try {
      navigate(`/admin-dashboard/edit-department/${departmentId}`, {
        state: { department: departmentData }
      });
    } catch (err) {
      console.error('Navigation error:', err);
      alert('Navigation failed: ' + err.message);
    }
  };

  const handleDelete = async (departmentId, departmentData) => {
    console.log('Delete clicked - Department ID:', departmentId);
    console.log('Delete clicked - Department Data:', departmentData);
    
    if (window.confirm(`Are you sure you want to delete "${departmentData?.dep_name}" department?`)) {
      try {
        const token = localStorage.getItem('token');
        console.log('Deleting department...');
        
        const response = await axios.delete(`http://localhost:3000/api/departments/${departmentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Delete response:', response.data);

        if (response.data.success) {
          const updatedDepartments = departments.filter(dep => dep.id !== departmentId);
          setDepartments(updatedDepartments);
          setFilteredDepartments(updatedDepartments);
          alert('Department deleted successfully!');
        } else {
          alert('Failed to delete department: ' + response.data.error);
        }
      } catch (err) {
        console.error('Error deleting department:', err);
        alert('Error deleting department: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Debug render
  console.log('Rendering DepartmentList - Loading:', loading, 'Error:', !!error, 'Departments:', departments.length);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Debug Info */}
      <div className="fixed top-0 right-0 bg-black text-white p-2 text-xs z-50 opacity-75">
        Loaded: {departments.length} | Loading: {loading ? 'Yes' : 'No'} | Error: {error ? 'Yes' : 'No'}
      </div>
      
      {/* Sidebar */}
      <AdminSidebar />
             
      {/* Main Content Area */}
      <div className="flex-1">
        {/* Navbar */}
        <div className="bg-white shadow-sm border-b">
          <Navbar />
        </div>
                 
        {/* Page Content */}
        <div className="p-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Departments</h1>
            <p className="text-gray-600">Create, edit, and organize your company departments</p>
          </div>
                     
          {/* Controls Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by Department Name"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full sm:w-80 px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <Link
                to="/admin-dashboard/add-department"
                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 rounded-lg text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Department
              </Link>
            </div>
          </div>
                     
          {/* Department List Content */}
          <div className="bg-white rounded-lg shadow-sm border">
            {error && (
              <div className="p-6 bg-red-50 border-l-4 border-red-400">
                <div className="text-red-700">
                  <strong>Error:</strong> {error}
                </div>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Reload Page
                </button>
              </div>
            )}
            
            {loading ? (
              <div className="p-6">
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                  <p className="mt-4 text-gray-500">Loading departments...</p>
                </div>
              </div>
            ) : filteredDepartments.length > 0 ? (
              <div className="p-6">
                <DataTable
                  columns={columns}
                  data={filteredDepartments}
                  pagination
                  responsive
                  highlightOnHover
                  striped
                  paginationPerPage={10}
                  paginationRowsPerPageOptions={[10, 25, 50]}
                />
              </div>
            ) : (
              <div className="p-6">
                <div className="text-center py-12 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-6m-2-5a2 2 0 11-4 0 2 2 0 014 0zm-8 0a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {searchTerm ? 'No matching departments found' : 'No departments found'}
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm ? 'Try adjusting your search criteria' : 'Get started by creating your first department.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentList;