// src/pages/admin-dashboard/EmployeePayslipsList.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FileText, Calendar, DollarSign, ArrowLeft, Download } from 'lucide-react';
import axios from 'axios'


const EmployeePayslipsList = () => {
  // Safely parse user from localStorage
  const [employeeId, setEmployeeId] = useState(null);
  const [employeeName, setEmployeeName] = useState('');
  
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_BACKENDAPI;
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Parse user from localStorage ONCE when component mounts
    let parsedUser = null;
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        parsedUser = JSON.parse(userStr);
      }
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
    }

    if (parsedUser && parsedUser.employeeId) {
      setEmployeeId(parsedUser.employeeId);
      setEmployeeName(parsedUser.name || '');
    } else {
      setError('Employee ID not found. Please log in again.');
      setLoading(false);
    }
  }, []); // Run only once on mount

  // Fetch payslips when employeeId is available
  useEffect(() => {
    if (!employeeId) return;

    const fetchPayslips = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/api/payroll/employee/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setPayslips(res.data);
        // If name wasn't in localStorage, try to get it from the first payslip
        if (!employeeName && res.data.length > 0 && res.data[0].employee?.name) {
          setEmployeeName(res.data[0].employee.name);
        }
      } catch (err) {
        setError('Failed to load payslips');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayslips();
  }, [employeeId, employeeName, API_BASE_URL]); // Only re-run if employeeId changes


  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewPayslip = (payrollId) => {
  navigate(`/employee-dashboard/payslip-view/${payrollId}`);
};

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount || 0);
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Payslips for {employeeName || 'Employee'}
          </h1>
          <p className="text-gray-600">View and download payroll records</p>
        </div>
      </div>

      {/* Payslip List */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 md:p-6">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Payslip History
          </h2>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading payslips...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">{error}</div>
          ) : payslips.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              No payslips found for this employee.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Period</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Gross Pay</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Net Pay</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payslips.map((payslip) => (
                  <tr key={payslip._id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>
                          {formatDate(payslip.periodStart)} – {formatDate(payslip.periodEnd)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">{formatCurrency(payslip.grossPay)}</td>
                    <td className="py-4 px-6 font-semibold">{formatCurrency(payslip.netPay)}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payslip.status === 'PAID'
                          ? 'bg-green-100 text-green-800'
                          : payslip.status === 'PROCESSED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payslip.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {/* <button
                        onClick={() => navigate(`/admin-dashboard/payslip/${payslip._id}`)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <Download className="w-4 h-4" />
                        View
                      </button> */}
                      <Link to={`/employee-dashboard/payslip-view/${payslip._id}`}>
                        View Payslip
                        </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeePayslipsList;