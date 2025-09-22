import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AdminSidebar from '../dashboard/AdminSidebar'
import Navbar from '../dashboard/Navbar'

// Add base URL for your API
const API_BASE_URL = 'http://localhost:3000'

const List = () => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState({})
  const [updating, setUpdating] = useState(false)
  const navigate = useNavigate()

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      // Updated API endpoint - make sure this matches your backend route
      const response = await fetch(`${API_BASE_URL}/api/employees`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Check if the API endpoint exists.')
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Handle different response structures
      if (data.success) {
        setEmployees(data.employees || [])
      } else {
        setEmployees(data.employees || data || [])
      }
      
      setError('')
    } catch (err) {
      console.error('Error fetching employees:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Filter employees based on search term
  const filteredEmployees = employees.filter(employee =>
    employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/employees/${employeeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to delete employee: ${response.status}`)
      }

      // Remove employee from local state
      setEmployees(employees.filter(emp => emp._id !== employeeId))
      alert('Employee deleted successfully')
    } catch (err) {
      console.error('Error deleting employee:', err)
      alert(`Failed to delete employee: ${err.message}`)
    }
  }

  const handleView = async (employeeId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/employees/${employeeId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch employee details')
      }

      const data = await response.json()
      setSelectedEmployee(data.employee)
      setShowViewModal(true)
    } catch (err) {
      console.error('Error fetching employee:', err)
      alert('Failed to fetch employee details')
    }
  }

  const handleEdit = async (employeeId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/employees/${employeeId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch employee details')
      }

      const data = await response.json()
      const employee = data.employee
      
      setEditFormData({
        name: employee.name || '',
        email: employee.email || '',
        employeeId: employee.employeeId || '',
        department: employee.department || '',
        designation: employee.designation || '',
        salary: employee.salary || '',
        gender: employee.gender || '',
        maritalStatus: employee.maritalStatus || '',
        dob: employee.dob ? employee.dob.split('T')[0] : ''
      })
      setSelectedEmployee(employee)
      setShowEditModal(true)
    } catch (err) {
      console.error('Error fetching employee:', err)
      alert('Failed to fetch employee details')
    }
  }

  const handleEditInputChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveEdit = async () => {
    setUpdating(true)
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(`${API_BASE_URL}/api/employees/${selectedEmployee._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editFormData)
      })

      if (!response.ok) {
        throw new Error('Failed to update employee')
      }

      const result = await response.json()
      
      if (result.success) {
        // Update the employee in the local state
        setEmployees(employees.map(emp => 
          emp._id === selectedEmployee._id 
            ? { ...emp, ...editFormData }
            : emp
        ))
        setShowEditModal(false)
        setSelectedEmployee(null)
        setEditFormData({})
        alert('Employee updated successfully!')
      }
    } catch (err) {
      console.error('Error updating employee:', err)
      alert(`Failed to update employee: ${err.message}`)
    } finally {
      setUpdating(false)
    }
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setSelectedEmployee(null)
    setEditFormData({})
  }

  const closeViewModal = () => {
    setShowViewModal(false)
    setSelectedEmployee(null)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1">
          <div className="bg-white shadow-sm border-b">
            <Navbar />
          </div>
          <div className="p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading employees...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex min-h-screen bg-gray-50">
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
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Manage Employees</h1>
                  <p className="text-gray-600">Manage your organization's employees ({employees.length} total)</p>
                </div>
                <Link
                  to="/admin-dashboard/add-employee"
                  className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 rounded-lg text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Employee
                </Link>
              </div>
              
              {/* Search Bar */}
              <div className="flex justify-center">
                <div className="relative w-full max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm text-gray-900 placeholder-gray-500 transition-all duration-200"
                  />
                  {searchTerm && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="p-1 text-gray-400 hover:text-teal-600 transition-colors duration-200"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Error: {error}
                </div>
                <button 
                  onClick={fetchEmployees}
                  className="mt-2 text-sm underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            )}
            
            {/* Employees List */}
            {filteredEmployees.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No employees found' : 'No employees yet'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm 
                    ? 'Try adjusting your search criteria.' 
                    : 'Get started by adding your first employee.'
                  }
                </p>
                {!searchTerm && (
                  <Link
                    to="/admin-dashboard/add-employee"
                    className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    Add First Employee
                  </Link>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* Mobile Card View for small screens */}
                <div className="block md:hidden">
                  {filteredEmployees.map((employee) => (
                    <div key={employee._id} className="p-4 border-b border-gray-200 hover:bg-gray-50">
                      <div className="flex items-center space-x-3 mb-3">
                        <img
                          className="h-12 w-12 rounded-full object-cover flex-shrink-0"
                          src={employee.profileImage 
                            ? `${API_BASE_URL}/public/uploads/${employee.profileImage}` 
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name || 'Unknown')}&background=0f766e&color=fff`
                          }
                          alt={employee.name || 'Employee'}
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name || 'Unknown')}&background=0f766e&color=fff`
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{employee.name || 'N/A'}</p>
                          <p className="text-sm text-gray-500 truncate">{employee.email || 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">ID:</span> 
                          <span className="ml-1">{employee.employeeId || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="font-medium">Dept:</span> 
                          <span className="ml-1">{employee.department || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="font-medium">Role:</span> 
                          <span className="ml-1">{employee.designation || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="font-medium">Salary:</span> 
                          <span className="ml-1">${employee.salary ? employee.salary.toLocaleString() : 'N/A'}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(employee._id)}
                          className="flex-1 text-xs px-3 py-2 text-teal-600 hover:text-teal-900 hover:bg-teal-50 rounded border border-teal-200 transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(employee._id)}
                          className="flex-1 text-xs px-3 py-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded border border-blue-200 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(employee._id)}
                          className="flex-1 text-xs px-3 py-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded border border-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View for larger screens */}
                <div className="hidden md:block">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employee
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Designation
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Salary
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredEmployees.map((employee) => (
                        <tr key={employee._id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={employee.profileImage 
                                    ? `${API_BASE_URL}/public/uploads/${employee.profileImage}` 
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name || 'Unknown')}&background=0f766e&color=fff`
                                  }
                                  alt={employee.name || 'Employee'}
                                  onError={(e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name || 'Unknown')}&background=0f766e&color=fff`
                                  }}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                                  {employee.name || 'N/A'}
                                </div>
                                <div className="text-sm text-gray-500 truncate max-w-[150px]">
                                  {employee.email || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="max-w-[100px] truncate">{employee.employeeId || 'N/A'}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="max-w-[120px] truncate">{employee.department || 'N/A'}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="max-w-[120px] truncate">{employee.designation || 'N/A'}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>${employee.salary ? employee.salary.toLocaleString() : 'N/A'}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleView(employee._id)}
                                className="text-teal-600 hover:text-teal-900 transition-colors px-2 py-1 rounded hover:bg-teal-50"
                                title="View Details"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleEdit(employee._id)}
                                className="text-blue-600 hover:text-blue-900 transition-colors px-2 py-1 rounded hover:bg-blue-50"
                                title="Edit Employee"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(employee._id)}
                                className="text-red-600 hover:text-red-900 transition-colors px-2 py-1 rounded hover:bg-red-50"
                                title="Delete Employee"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Employee Modal */}
      {showViewModal && selectedEmployee && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={closeViewModal}>
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Employee Details</h3>
                <button
                  onClick={closeViewModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Employee Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Profile Image */}
                <div className="col-span-1 flex flex-col items-center">
                  <img
                    className="h-32 w-32 rounded-full object-cover border-4 border-gray-200"
                    src={selectedEmployee.profileImage 
                      ? `${API_BASE_URL}/public/uploads/${selectedEmployee.profileImage}` 
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedEmployee.name || 'Unknown')}&background=0f766e&color=fff`
                    }
                    alt={selectedEmployee.name || 'Employee'}
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedEmployee.name || 'Unknown')}&background=0f766e&color=fff`
                    }}
                  />
                  <h4 className="mt-2 text-lg font-semibold text-gray-900">{selectedEmployee.name}</h4>
                  <p className="text-sm text-gray-500">{selectedEmployee.designation}</p>
                </div>

                {/* Employee Details */}
                <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
                    <p className="text-sm text-gray-900">{selectedEmployee.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Employee ID</label>
                    <p className="text-sm text-gray-900">{selectedEmployee.employeeId || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Department</label>
                    <p className="text-sm text-gray-900">{selectedEmployee.department || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Designation</label>
                    <p className="text-sm text-gray-900">{selectedEmployee.designation || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Salary</label>
                    <p className="text-sm text-gray-900">${selectedEmployee.salary ? selectedEmployee.salary.toLocaleString() : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Gender</label>
                    <p className="text-sm text-gray-900">{selectedEmployee.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Marital Status</label>
                    <p className="text-sm text-gray-900">{selectedEmployee.maritalStatus || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Date of Birth</label>
                    <p className="text-sm text-gray-900">
                      {selectedEmployee.dob ? new Date(selectedEmployee.dob).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-gray-500 uppercase">Joined Date</label>
                    <p className="text-sm text-gray-900">
                      {selectedEmployee.createdAt ? new Date(selectedEmployee.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => {
                    closeViewModal()
                    handleEdit(selectedEmployee._id)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Employee
                </button>
                <button
                  onClick={closeViewModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={closeEditModal}>
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-3xl shadow-xl rounded-xl bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Edit Employee</h3>
                    <p className="text-sm text-gray-500">Update employee information</p>
                  </div>
                </div>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form Content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Image Section */}
                <div className="col-span-1 flex flex-col items-center">
                  <img
                    className="h-32 w-32 rounded-full object-cover border-4 border-blue-200 mb-4"
                    src={selectedEmployee.profileImage 
                      ? `${API_BASE_URL}/public/uploads/${selectedEmployee.profileImage}` 
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(editFormData.name || 'Unknown')}&background=3b82f6&color=fff`
                    }
                    alt={editFormData.name || 'Employee'}
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(editFormData.name || 'Unknown')}&background=3b82f6&color=fff`
                    }}
                  />
                  <p className="text-sm text-gray-500 text-center">Profile Image</p>
                </div>

                {/* Form Fields */}
                <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => handleEditInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter full name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => handleEditInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter email address"
                    />
                  </div>

                  {/* Employee ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                    <input
                      type="text"
                      value={editFormData.employeeId}
                      onChange={(e) => handleEditInputChange('employeeId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter employee ID"
                    />
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select
                      value={editFormData.department}
                      onChange={(e) => handleEditInputChange('department', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Select Department</option>
                      <option value="hr">Human Resources</option>
                      <option value="it">Information Technology</option>
                      <option value="finance">Finance</option>
                      <option value="marketing">Marketing</option>
                      <option value="operations">Operations</option>
                      <option value="sales">Sales</option>
                      <option value="support">Customer Support</option>
                      <option value="admin">Administration</option>
                      <option value="security">Security</option>
                    </select>
                  </div>

                  {/* Designation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                    <input
                      type="text"
                      value={editFormData.designation}
                      onChange={(e) => handleEditInputChange('designation', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter designation"
                    />
                  </div>

                  {/* Salary */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        value={editFormData.salary}
                        onChange={(e) => handleEditInputChange('salary', e.target.value)}
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      value={editFormData.gender}
                      onChange={(e) => handleEditInputChange('gender', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Marital Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                    <select
                      value={editFormData.maritalStatus}
                      onChange={(e) => handleEditInputChange('maritalStatus', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Select Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>

                  {/* Date of Birth */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={editFormData.dob}
                      onChange={(e) => handleEditInputChange('dob', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={closeEditModal}
                  disabled={updating}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={updating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {updating && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>{updating ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default List