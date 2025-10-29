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
  ArrowLeft,
  IdCard,
  AlertCircle,
  UserCircle,
  Shield
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
    employee.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.nationalId?.toLowerCase().includes(searchTerm.toLowerCase())
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
        phone: employee.phone || '',
        nationalId: employee.nationalId || '',
        department: employee.department || '',
        designation: employee.designation || '',
        basicSalary: employee.salary?.basicSalary || employee.salary || '',
        housingAllowance: employee.salary?.allowances?.housing || 0,
        transportAllowance: employee.salary?.allowances?.transport || 0,
        medicalAllowance: employee.salary?.allowances?.medical || 0,
        otherAllowance: employee.salary?.allowances?.other || 0,
        gender: employee.gender || '',
        maritalStatus: employee.maritalStatus || '',
        dob: employee.dob ? new Date(employee.dob).toISOString().split('T')[0] : '',
        emergencyContactName: employee.emergencyContact?.name || '',
        emergencyContactRelationship: employee.emergencyContact?.relationship || '',
        emergencyContactPhone: employee.emergencyContact?.phone || '',
        emergencyContactEmail: employee.emergencyContact?.email || '',
        kraPIN: employee.kraPIN || '',
        nssfNumber: employee.nssfNumber || '',
        nhifNumber: employee.nhifNumber || ''
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
    if (updating) return

    try {
      setUpdating(true)
      const token = localStorage.getItem('token')
      
      const updatePayload = {
        name: editFormData.name,
        email: editFormData.email,
        employeeId: editFormData.employeeId,
        phone: editFormData.phone,
        nationalId: editFormData.nationalId,
        department: editFormData.department,
        designation: editFormData.designation,
        gender: editFormData.gender,
        maritalStatus: editFormData.maritalStatus,
        dob: editFormData.dob,
        emergencyContactName: editFormData.emergencyContactName,
        emergencyContactRelationship: editFormData.emergencyContactRelationship,
        emergencyContactPhone: editFormData.emergencyContactPhone,
        emergencyContactEmail: editFormData.emergencyContactEmail,
        kraPIN: editFormData.kraPIN,
        nssfNumber: editFormData.nssfNumber,
        nhifNumber: editFormData.nhifNumber
      }

      const response = await fetch(`${API_BASE_URL}/api/employees/${selectedEmployee._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatePayload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update employee')
      }

      const result = await response.json()
      
      setEmployees(employees.map(emp => 
        emp._id === selectedEmployee._id ? result.employee : emp
      ))

      alert('Employee updated successfully!')
      closeEditModal()
      fetchEmployees()
    } catch (err) {
      console.error('Error updating employee:', err)
      alert(`Failed to update employee: ${err.message}`)
    } finally {
      setUpdating(false)
    }
  }

  const closeViewModal = () => {
    setShowViewModal(false)
    setSelectedEmployee(null)
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setSelectedEmployee(null)
    setEditFormData({})
  }

  // Helper function to get salary value (handles both old and new structure)
  const getSalaryValue = (employee) => {
    if (typeof employee.salary === 'object' && employee.salary !== null) {
      return employee.salary.netSalary || employee.salary.basicSalary || 0
    }
    return employee.salary || 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium text-lg">Loading employees...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Employees</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchEmployees}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="absolute inset-0 bg-black/5"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative px-8 py-12">
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
                    <h1 className="text-4xl lg:text-5xl font-bold text-white">
                      Employee Management
                    </h1>
                  </div>
                  <p className="text-white/90 text-lg">
                    Manage your team with complete information
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
                      <span className="text-white font-semibold">{employees.length} Employees</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Link 
                to="/admin-dashboard/add-employee"
                className="bg-white hover:bg-white/90 text-indigo-600 px-6 py-4 rounded-xl font-semibold flex items-center gap-2 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                <Plus className="w-5 h-5" />
                Add Employee
              </Link>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, ID, phone, or national ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 placeholder-gray-400 font-medium"
            />
          </div>
        </div>

        {/* Employee Cards Grid */}
        {currentEmployees.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <Users className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Employees Found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first employee'}
            </p>
            <Link
              to="/admin-dashboard/add-employee"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add Employee
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentEmployees.map((employee) => (
                <div
                  key={employee._id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden group border border-gray-100"
                >
                  {/* Card Header with Image */}
                  <div className="relative h-32 bg-gradient-to-r from-indigo-500 to-purple-600">
                    <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                      <img
                        className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-xl"
                        src={employee.profileImage 
                          ? `${API_BASE_URL}/public/uploads/${employee.profileImage}` 
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name || 'Unknown')}&background=6366f1&color=fff&size=256`
                        }
                        alt={employee.name || 'Employee'}
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name || 'Unknown')}&background=6366f1&color=fff&size=256`
                        }}
                      />
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="pt-16 px-6 pb-6">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {employee.name || 'Unknown'}
                      </h3>
                      <p className="text-indigo-600 font-semibold text-sm mb-1">
                        {employee.designation || 'N/A'}
                      </p>
                      <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                        {employee.employeeId || 'N/A'}
                      </span>
                    </div>

                    {/* Employee Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-indigo-500" />
                        <span className="truncate">{employee.email || 'N/A'}</span>
                      </div>
                      
                      {employee.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4 text-green-500" />
                          <span>{employee.phone}</span>
                        </div>
                      )}
                      
                      {employee.nationalId && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <IdCard className="w-4 h-4 text-blue-500" />
                          <span>ID: {employee.nationalId}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building className="w-4 h-4 text-orange-500" />
                        <span>{employee.department || 'N/A'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="font-semibold">
                          KES {getSalaryValue(employee).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleView(employee._id)}
                        className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all font-semibold text-sm flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(employee._id)}
                        className="flex-1 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all font-semibold text-sm flex items-center justify-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(employee._id)}
                        className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all font-semibold text-sm flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white border-2 border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-50 hover:border-indigo-300 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToPage(index + 1)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      currentPage === index + 1
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white border-2 border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-50 hover:border-indigo-300 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-t-3xl">
              <div className="absolute inset-0 bg-black/5"></div>
              <div className="relative px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/30">
                      <Eye className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white">Employee Details</h3>
                      <p className="text-purple-100 mt-1">Complete employee information</p>
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
            </div>

            {/* Modal Content */}
            <div className="p-8">
              {/* Profile Section */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 pb-8 border-b border-gray-200">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-2xl opacity-50"></div>
                  <img
                    className="relative h-32 w-32 rounded-3xl object-cover border-4 border-white shadow-2xl"
                    src={selectedEmployee.profileImage 
                      ? `${API_BASE_URL}/public/uploads/${selectedEmployee.profileImage}` 
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedEmployee.name || 'Unknown')}&background=6366f1&color=fff&size=256`
                    }
                    alt={selectedEmployee.name || 'Employee'}
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedEmployee.name || 'Unknown')}&background=6366f1&color=fff&size=256`
                    }}
                  />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {selectedEmployee.name || 'Unknown'}
                  </h2>
                  <p className="text-xl text-indigo-600 font-semibold mb-2">
                    {selectedEmployee.designation || 'N/A'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                    <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                      {selectedEmployee.employeeId || 'N/A'}
                    </span>
                    <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      {selectedEmployee.department || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Personal Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Email</p>
                      <p className="text-gray-900 font-medium">{selectedEmployee.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Phone</p>
                      <p className="text-gray-900 font-medium">{selectedEmployee.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">National ID</p>
                      <p className="text-gray-900 font-medium">{selectedEmployee.nationalId || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Gender</p>
                      <p className="text-gray-900 font-medium">{selectedEmployee.gender || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Marital Status</p>
                      <p className="text-gray-900 font-medium">{selectedEmployee.maritalStatus || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Date of Birth</p>
                      <p className="text-gray-900 font-medium">
                        {selectedEmployee.dob 
                          ? new Date(selectedEmployee.dob).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    Emergency Contact
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Name</p>
                      <p className="text-gray-900 font-medium">
                        {selectedEmployee.emergencyContact?.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Relationship</p>
                      <p className="text-gray-900 font-medium">
                        {selectedEmployee.emergencyContact?.relationship || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Phone</p>
                      <p className="text-gray-900 font-medium">
                        {selectedEmployee.emergencyContact?.phone || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Email</p>
                      <p className="text-gray-900 font-medium">
                        {selectedEmployee.emergencyContact?.email || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Statutory Information */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                    Statutory Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">KRA PIN</p>
                      <p className="text-gray-900 font-medium">{selectedEmployee.kraPIN || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">NSSF Number</p>
                      <p className="text-gray-900 font-medium">{selectedEmployee.nssfNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">NHIF Number</p>
                      <p className="text-gray-900 font-medium">{selectedEmployee.nhifNumber || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Salary Information */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Salary Information
                  </h4>
                  {selectedEmployee.salary && typeof selectedEmployee.salary === 'object' ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">Basic Salary</p>
                        <p className="text-gray-900 font-bold">
                          KES {(selectedEmployee.salary.basicSalary || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">Gross Salary</p>
                        <p className="text-gray-900 font-bold text-lg text-green-600">
                          KES {(selectedEmployee.salary.grossSalary || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-green-200">
                        <p className="text-sm text-gray-600 font-semibold mb-2">Deductions</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">NHIF:</span>
                            <span className="text-gray-900 font-medium">
                              KES {(selectedEmployee.salary.deductions?.nhif || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">NSSF:</span>
                            <span className="text-gray-900 font-medium">
                              KES {(selectedEmployee.salary.deductions?.nssf || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Housing Levy:</span>
                            <span className="text-gray-900 font-medium">
                              KES {(selectedEmployee.salary.deductions?.housingLevy || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">PAYE:</span>
                            <span className="text-gray-900 font-medium">
                              KES {(selectedEmployee.salary.deductions?.paye || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="pt-2 border-t-2 border-green-300">
                        <p className="text-sm text-gray-600 font-semibold">Net Salary</p>
                        <p className="text-gray-900 font-bold text-2xl text-green-600">
                          KES {(selectedEmployee.salary.netSalary || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Salary</p>
                      <p className="text-gray-900 font-bold text-xl">
                        KES {(selectedEmployee.salary || 0).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={closeViewModal}
                  className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-t-3xl">
              <div className="absolute inset-0 bg-black/5"></div>
              <div className="relative px-8 py-6">
                <div className="flex items-center justify-between">
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
            </div>

            {/* Form Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
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
                  {/* Personal Info */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => handleEditInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Email *</label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => handleEditInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                      placeholder="Enter email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Employee ID *</label>
                    <input
                      type="text"
                      value={editFormData.employeeId}
                      onChange={(e) => handleEditInputChange('employeeId', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                      placeholder="EMP001"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Phone *</label>
                    <input
                      type="tel"
                      value={editFormData.phone}
                      onChange={(e) => handleEditInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                      placeholder="0712345678"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">National ID *</label>
                    <input
                      type="text"
                      value={editFormData.nationalId}
                      onChange={(e) => handleEditInputChange('nationalId', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                      placeholder="12345678"
                      required
                      maxLength="8"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Department *</label>
                    <input
                      type="text"
                      value={editFormData.department}
                      onChange={(e) => handleEditInputChange('department', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                      placeholder="IT Department"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Designation *</label>
                    <input
                      type="text"
                      value={editFormData.designation}
                      onChange={(e) => handleEditInputChange('designation', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                      placeholder="Software Engineer"
                      required
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

                  <div>
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

              {/* Emergency Contact Section */}
              <div className="mb-8 p-6 bg-red-50 rounded-2xl">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Emergency Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Contact Name</label>
                    <input
                      type="text"
                      value={editFormData.emergencyContactName}
                      onChange={(e) => handleEditInputChange('emergencyContactName', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-medium"
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Relationship</label>
                    <input
                      type="text"
                      value={editFormData.emergencyContactRelationship}
                      onChange={(e) => handleEditInputChange('emergencyContactRelationship', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-medium"
                      placeholder="Spouse"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Contact Phone</label>
                    <input
                      type="tel"
                      value={editFormData.emergencyContactPhone}
                      onChange={(e) => handleEditInputChange('emergencyContactPhone', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-medium"
                      placeholder="0723456789"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Contact Email</label>
                    <input
                      type="email"
                      value={editFormData.emergencyContactEmail}
                      onChange={(e) => handleEditInputChange('emergencyContactEmail', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-medium"
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Statutory Information */}
              <div className="mb-8 p-6 bg-purple-50 rounded-2xl">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Statutory Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">KRA PIN</label>
                    <input
                      type="text"
                      value={editFormData.kraPIN}
                      onChange={(e) => handleEditInputChange('kraPIN', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium"
                      placeholder="A001234567Z"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">NSSF Number</label>
                    <input
                      type="text"
                      value={editFormData.nssfNumber}
                      onChange={(e) => handleEditInputChange('nssfNumber', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium"
                      placeholder="1234567890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">NHIF Number</label>
                    <input
                      type="text"
                      value={editFormData.nhifNumber}
                      onChange={(e) => handleEditInputChange('nhifNumber', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium"
                      placeholder="0987654321"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
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