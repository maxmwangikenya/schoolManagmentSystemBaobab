import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { DollarSign, Calendar, TrendingUp, FileText, Download, ChevronDown, ChevronUp } from 'lucide-react';

const EmployeeSalary = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [currentSalary, setCurrentSalary] = useState(null);
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const API_BASE_URL = 'http://localhost:3000';

  useEffect(() => {
    fetchSalaryData();
  }, [id]);

  const fetchSalaryData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch employee data
      const employeeResponse = await axios.get(`${API_BASE_URL}/api/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployee(employeeResponse.data);

      // Fetch current salary
      const salaryResponse = await axios.get(`${API_BASE_URL}/api/salary/employee/${id}/current`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (salaryResponse.data.success) {
        setCurrentSalary(salaryResponse.data.salary);
      }

      // Fetch salary history
      const historyResponse = await axios.get(`${API_BASE_URL}/api/salary/employee/${id}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (historyResponse.data.success) {
        setSalaryHistory(historyResponse.data.salaries);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching salary data:', err);
      setError(err.response?.data?.error || 'Failed to load salary data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatMonth = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const downloadPayslip = async (salaryId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/salary/${salaryId}/payslip`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payslip_${formatMonth(currentSalary.payPeriod)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading payslip:', err);
      alert('Failed to download payslip');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading salary information...</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <p className="text-gray-600 text-lg">{error || 'Employee data not found'}</p>
        </div>
      </div>
    );
  }

  if (!currentSalary) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <DollarSign className="w-24 h-24 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Salary Information</h3>
            <p className="text-gray-600">Your salary details have not been set up yet. Please contact HR.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Employee Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-lg"
                  src={employee.profileImage 
                    ? `${API_BASE_URL}/public/uploads/${employee.profileImage}` 
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name || 'Unknown')}&background=059669&color=fff&size=80`
                  }
                  alt={employee.name || 'Employee'}
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name || 'Unknown')}&background=059669&color=fff&size=80`;
                  }}
                />
                <div>
                  <h3 className="text-2xl font-bold text-white">{employee.name || 'N/A'}</h3>
                  <p className="text-green-100">{employee.designation || 'N/A'}</p>
                  <p className="text-green-200 text-sm">{employee.department || 'N/A'} • {employee.employeeId || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Salary Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Current Salary</h3>
                <p className="text-green-100 text-sm">Pay Period: {formatMonth(currentSalary.payPeriod)}</p>
              </div>
              <div className="text-right">
                <p className="text-green-100 text-sm">Net Salary</p>
                <p className="text-4xl font-bold text-white">{formatCurrency(currentSalary.netSalary)}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Salary Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Basic Salary */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-blue-700">Basic Salary</span>
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(currentSalary.basicSalary)}</p>
              </div>

              {/* Allowances */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-green-700">Total Allowances</span>
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(currentSalary.allowances)}</p>
              </div>

              {/* Deductions */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-red-700">Total Deductions</span>
                  <FileText className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-red-900">{formatCurrency(currentSalary.deductions)}</p>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Detailed Breakdown</h4>
              
              <div className="space-y-3">
                {/* Basic Salary */}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700 font-medium">Basic Salary</span>
                  <span className="text-gray-900 font-semibold">{formatCurrency(currentSalary.basicSalary)}</span>
                </div>

                {/* Allowances Breakdown */}
                {currentSalary.allowances > 0 && (
                  <>
                    <div className="flex justify-between items-center py-2 text-green-700">
                      <span className="font-medium">+ Allowances</span>
                      <span className="font-semibold">{formatCurrency(currentSalary.allowances)}</span>
                    </div>
                    {currentSalary.allowanceBreakdown && Object.entries(currentSalary.allowanceBreakdown).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-1 pl-6 text-sm text-gray-600">
                        <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span>{formatCurrency(value)}</span>
                      </div>
                    ))}
                  </>
                )}

                {/* Deductions Breakdown */}
                {currentSalary.deductions > 0 && (
                  <>
                    <div className="flex justify-between items-center py-2 text-red-700">
                      <span className="font-medium">- Deductions</span>
                      <span className="font-semibold">{formatCurrency(currentSalary.deductions)}</span>
                    </div>
                    {currentSalary.deductionBreakdown && Object.entries(currentSalary.deductionBreakdown).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-1 pl-6 text-sm text-gray-600">
                        <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span>{formatCurrency(value)}</span>
                      </div>
                    ))}
                  </>
                )}

                {/* Net Salary */}
                <div className="flex justify-between items-center py-3 border-t-2 border-gray-300 mt-2">
                  <span className="text-lg font-bold text-gray-800">Net Salary</span>
                  <span className="text-2xl font-bold text-green-600">{formatCurrency(currentSalary.netSalary)}</span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="mt-6 bg-gray-50 p-4 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600 block mb-1">Payment Date</span>
                  <p className="font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(currentSalary.paymentDate)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 block mb-1">Payment Status</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    currentSalary.status === 'paid' 
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                  }`}>
                    {currentSalary.status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Download Payslip Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => downloadPayslip(currentSalary._id)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl font-medium"
              >
                <Download className="w-5 h-5" />
                Download Payslip
              </button>
            </div>
          </div>
        </div>

        {/* Salary History */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-5 flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6" />
              <div className="text-left">
                <h3 className="font-bold text-lg">Salary History</h3>
                <p className="text-sm text-indigo-100">View your previous salary records</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {salaryHistory.length > 0 && (
                <span className="bg-white text-indigo-600 px-3 py-1 rounded-full text-sm font-bold">
                  {salaryHistory.length}
                </span>
              )}
              {showHistory ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
            </div>
          </button>

          {showHistory && (
            <div className="p-6 bg-gray-50">
              {salaryHistory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No salary history available</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {salaryHistory.map((salary) => (
                    <div key={salary._id} className="bg-white rounded-xl p-5 shadow hover:shadow-md transition-shadow border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-lg text-gray-800">{formatMonth(salary.payPeriod)}</h4>
                          <p className="text-sm text-gray-600">Paid on {formatDate(salary.paymentDate)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Net Salary</p>
                          <p className="text-2xl font-bold text-green-600">{formatCurrency(salary.netSalary)}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                        <div>
                          <span className="text-xs text-gray-600 block">Basic</span>
                          <p className="font-semibold text-gray-900">{formatCurrency(salary.basicSalary)}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-600 block">Allowances</span>
                          <p className="font-semibold text-green-700">{formatCurrency(salary.allowances)}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-600 block">Deductions</span>
                          <p className="font-semibold text-red-700">{formatCurrency(salary.deductions)}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => downloadPayslip(salary._id)}
                          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeSalary;