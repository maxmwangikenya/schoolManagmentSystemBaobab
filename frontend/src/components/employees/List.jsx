import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Users, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  X, 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase, 
  Building,
  DollarSign,
  User,
  Heart,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from 'lucide-react'

// Add base URL for your API
const API_BASE_URL = import.meta.env.VITE_BACKENDAPI;

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
  const [currentPage, setCurrentPage] = useState(1)
  const navigate = useNavigate()

  const EMPLOYEES_PER_PAGE = 6

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const response = await fetch(`${API_BASE_URL}/api/employees`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Check if the API endpoint exists.')
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
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

  const filteredEmployees = employees.filter(employee =>
    employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredEmployees.length / EMPLOYEES_PER_PAGE)
  const startIndex = (currentPage - 1) * EMPLOYEES_PER_PAGE
  const endIndex = startIndex + EMPLOYEES_PER_PAGE
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex)

  const goToPage = (page) => {
    setCurrentPage(page)
  }

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
      const employee = data.employee || data
      
      if (!employee || !employee._id) {
        throw new Error('Invalid employee data received')
      }
      
      setSelectedEmployee(employee)
      setShowViewModal(true)
    } catch (err) {
      console.error('Error fetching employee:', err)
      alert(`Failed to fetch employee details: ${err.message}`)
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
      const employee = data.employee || data
      
      if (!employee || !employee._id) {
        throw new Error('Invalid employee data received')
      }
      
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
      alert(`Failed to fetch employee details: ${err.message}`)
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-blue-600 mx-auto"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-blue-400 opacity-20 mx-auto"></div>
          </div>
          <p className="mt-6 text-lg text-gray-700 font-semibold">Loading employees...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6 md:p-8">
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
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                    Employee Management
                  </h1>
                </div>
                <p className="text-white/90 text-sm md:text-base mt-2">
                  Manage and organize your workforce efficiently • {employees.length} Total Employees
                </p>
              </div>
            </div>

            <Link
              to="/admin-dashboard/employees/add"
              className="bg-white hover:bg-gray-50 text-indigo-600 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Add New Employee
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
            placeholder="Search by name, email, ID, or department..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400 font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('')
                setCurrentPage(1)
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <X className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-red-800 font-semibold">Error: {error}</p>
              <button 
                onClick={fetchEmployees}
                className="text-sm text-red-600 underline hover:no-underline mt-1"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employees Grid */}
      {filteredEmployees.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
          <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-12 h-12 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {searchTerm ? 'No employees found' : 'No employees yet'}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchTerm 
              ? 'Try adjusting your search criteria to find what you\'re looking for.' 
              : 'Get started by adding your first employee to begin building your team.'
            }
          </p>
          {!searchTerm && (
            <Link
              to="/admin-dashboard/employees/add"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add First Employee
            </Link>
          )}
        </div>
      ) : (
        <div>
          {/* Employee Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {currentEmployees.map((employee) => (
              <div 
                key={employee._id} 
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden"
              >
                {/* Gradient Header */}
                <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-24 relative">
                  <div className="absolute inset-0 bg-black/5"></div>
                  <div className="absolute -bottom-12 left-6">
                    <div className="relative">
                      <img
                        className="h-24 w-24 rounded-2xl object-cover border-4 border-white shadow-xl"
                        src={employee.profileImage 
                          ? `${API_BASE_URL}/public/uploads/${employee.profileImage}` 
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name || 'Unknown')}&background=6366f1&color=fff&size=128`
                        }
                        alt={employee.name || 'Employee'}
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name || 'Unknown')}&background=6366f1&color=fff&size=128`
                        }}
                      />
                      <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="pt-16 px-6 pb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{employee.name || 'N/A'}</h3>
                  <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {employee.email || 'N/A'}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg px-3 py-2">
                      <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        Department
                      </span>
                      <span className="text-xs font-bold text-blue-700">{employee.department || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg px-3 py-2">
                      <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        Role
                      </span>
                      <span className="text-xs font-bold text-purple-700">{employee.designation || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg px-3 py-2">
                      <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        Salary
                      </span>
                      <span className="text-xs font-bold text-green-700">${employee.salary ? employee.salary.toLocaleString() : 'N/A'}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(employee._id)}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(employee._id)}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(employee._id)}
                      className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-semibold rounded-xl hover:from-red-600 hover:to-rose-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  onClick={() => goToPage(Math.max(1, currentPage - 1))}
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
                        onClick={() => goToPage(pageNumber)}
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
                  onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-md hover:shadow-lg"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center mt-4 text-sm text-gray-600 font-medium">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredEmployees.length)} of {filteredEmployees.length} employees
              </div>
            </div>
          )}
        </div>
      )}

      {/* View Employee Modal */}
      {showViewModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeViewModal}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto transform transition-all" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 rounded-t-3xl relative overflow-hidden">
              <div className="absolute inset-0 bg-black/5"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/30">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white">Employee Profile</h3>
                    <p className="text-blue-100 mt-1">Complete employee information</p>
                  </div>
                </div>
                <button
                  onClick={closeViewModal}
                  className="bg-white/20 backdrop-blur-md hover:bg-white/30 p-3 rounded-xl transition-all border border-white/30"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Employee Info */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Profile Section */}
                <div className="lg:col-span-1 flex flex-col items-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-50"></div>
                    <img
                      className="relative h-48 w-48 rounded-3xl object-cover border-4 border-white shadow-2xl"
                      src={selectedEmployee.profileImage 
                        ? `${API_BASE_URL}/public/uploads/${selectedEmployee.profileImage}` 
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedEmployee.name || 'Unknown')}&background=6366f1&color=fff&size=256`
                      }
                      alt={selectedEmployee.name || 'Employee'}
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedEmployee.name || 'Unknown')}&background=6366f1&color=fff&size=256`
                      }}
                    />
                    <div className="absolute -bottom-2 -right-2 bg-green-500 w-12 h-12 rounded-full border-4 border-white shadow-lg"></div>
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 text-center mb-2">{selectedEmployee.name}</h4>
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-xl mb-4">
                    <p className="text-sm font-bold text-blue-800">{selectedEmployee.designation}</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-xl">
                    <p className="text-lg font-bold text-green-800">${selectedEmployee.salary ? selectedEmployee.salary.toLocaleString() : 'N/A'}</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <label className="text-xs font-bold text-gray-600 uppercase">Email</label>
                    </div>
                    <p className="text-sm text-gray-900 font-semibold">{selectedEmployee.email || 'N/A'}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-2xl border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-purple-600" />
                      <label className="text-xs font-bold text-gray-600 uppercase">Employee ID</label>
                    </div>
                    <p className="text-sm text-gray-900 font-semibold">{selectedEmployee.employeeId || 'N/A'}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="w-4 h-4 text-green-600" />
                      <label className="text-xs font-bold text-gray-600 uppercase">Department</label>
                    </div>
                    <p className="text-sm text-gray-900 font-semibold">{selectedEmployee.department || 'N/A'}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 p-5 rounded-2xl border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="w-4 h-4 text-orange-600" />
                      <label className="text-xs font-bold text-gray-600 uppercase">Designation</label>
                    </div>
                    <p className="text-sm text-gray-900 font-semibold">{selectedEmployee.designation || 'N/A'}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-5 rounded-2xl border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-yellow-600" />
                      <label className="text-xs font-bold text-gray-600 uppercase">Gender</label>
                    </div>
                    <p className="text-sm text-gray-900 font-semibold">{selectedEmployee.gender || 'N/A'}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-5 rounded-2xl border border-pink-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-4 h-4 text-pink-600" />
                      <label className="text-xs font-bold text-gray-600 uppercase">Marital Status</label>
                    </div>
                    <p className="text-sm text-gray-900 font-semibold">{selectedEmployee.maritalStatus || 'N/A'}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-2xl border border-indigo-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      <label className="text-xs font-bold text-gray-600 uppercase">Date of Birth</label>
                    </div>
                    <p className="text-sm text-gray-900 font-semibold">
                      {selectedEmployee.dob ? new Date(selectedEmployee.dob).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-5 rounded-2xl border border-teal-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-teal-600" />
                      <label className="text-xs font-bold text-gray-600 uppercase">Joined Date</label>
                    </div>
                    <p className="text-sm text-gray-900 font-semibold">
                      {selectedEmployee.createdAt ? new Date(selectedEmployee.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    closeViewModal()
                    handleEdit(selectedEmployee._id)
                  }}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Edit className="w-5 h-5" />
                  Edit Employee
                </button>
                <button
                  onClick={closeViewModal}
                  className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold"
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeEditModal}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto transform transition-all" onClick={(e) => e.stopPropagation()}>
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 rounded-t-3xl relative overflow-hidden">
              <div className="absolute inset-0 bg-black/5"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/30">
                    <Edit className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white">Edit Employee</h3>
                    <p className="text-purple-100 mt-1">Update employee information</p>
                  </div>
                </div>
                <button
                  onClick={closeEditModal}
                  className="bg-white/20 backdrop-blur-md hover:bg-white/30 p-3 rounded-xl transition-all border border-white/30"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Image */}
                <div className="lg:col-span-1 flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-2xl opacity-50"></div>
                    <img
                      className="relative h-40 w-40 rounded-3xl object-cover border-4 border-white shadow-2xl"
                      src={selectedEmployee.profileImage 
                        ? `${API_BASE_URL}/public/uploads/${selectedEmployee.profileImage}` 
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(editFormData.name || 'Unknown')}&background=6366f1&color=fff&size=256`
                      }
                      alt={editFormData.name || 'Employee'}
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(editFormData.name || 'Unknown')}&background=6366f1&color=fff&size=256`
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Profile Picture</p>
                </div>

                {/* Form Fields */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => handleEditInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Email</label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => handleEditInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                      placeholder="Enter email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Employee ID</label>
                    <input
                      type="text"
                      value={editFormData.employeeId}
                      onChange={(e) => handleEditInputChange('employeeId', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                      placeholder="Enter ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Department</label>
                    <select
                      value={editFormData.department}
                      onChange={(e) => handleEditInputChange('department', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
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

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Designation</label>
                    <input
                      type="text"
                      value={editFormData.designation}
                      onChange={(e) => handleEditInputChange('designation', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                      placeholder="Enter designation"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Salary</label>
                    <input
                      type="number"
                      value={editFormData.salary}
                      onChange={(e) => handleEditInputChange('salary', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Gender</label>
                    <select
                      value={editFormData.gender}
                      onChange={(e) => handleEditInputChange('gender', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Marital Status</label>
                    <select
                      value={editFormData.maritalStatus}
                      onChange={(e) => handleEditInputChange('maritalStatus', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                    >
                      <option value="">Select Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-800 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={editFormData.dob}
                      onChange={(e) => handleEditInputChange('dob', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={closeEditModal}
                  disabled={updating}
                  className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={updating}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {updating && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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