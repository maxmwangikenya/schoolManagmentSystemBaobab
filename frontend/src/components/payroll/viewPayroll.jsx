// src/pages/admin-dashboard/PayrollList.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Calendar,
  FileText,
  Users,
  TrendingUp,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';

const PayrollList = () => {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_BACKENDAPI;

  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [loadingPeriods, setLoadingPeriods] = useState(true);
  const [loadingPayroll, setLoadingPayroll] = useState(false);
  const [error, setError] = useState('');

  // Fetch unique payroll periods (minimal: periodStart, periodEnd, label)
  const fetchPayrollPeriods = async () => {
    setLoadingPeriods(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/payroll/periods`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPeriods(response.data);
      if (response.data.length > 0) {
        handleSelectPeriod(response.data[0]); // auto-select latest
      }
    } catch (err) {
      setError('Failed to load payroll periods.');
      console.error(err);
    } finally {
      setLoadingPeriods(false);
    }
  };

  // Fetch payroll records for a specific period
  const handleSelectPeriod = async (period) => {
    setSelectedPeriod(period);
    setLoadingPayroll(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/payroll/by-periods`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          periodStart: period.periodStart,
          periodEnd: period.periodEnd
        }
      });
      setPayrollRecords(response.data);
    } catch (err) {
      console.error('Error loading payroll for period:', err);
      setPayrollRecords([]);
    } finally {
      setLoadingPayroll(false);
    }
  };

  useEffect(() => {
    fetchPayrollPeriods();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800 border-green-200';
      case 'PROCESSED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Payroll Management</h1>
            <p className="text-gray-600">View payroll by period</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={fetchPayrollPeriods}
            disabled={loadingPeriods}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loadingPeriods ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => navigate('/admin-dashboard/payroll')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:shadow-md transition"
          >
            <FileText className="w-4 h-4" />
            Generate New
          </button>
        </div>
      </div>

      {/* Stats Summary — only shown when a period is selected */}
      {selectedPeriod && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-green-100">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2.5 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Employees Processed</p>
                <p className="text-2xl font-bold text-gray-900">{payrollRecords.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2.5 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Period</p>
                <p className="text-2xl font-bold text-gray-900">{selectedPeriod.label}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg border border-purple-100">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2.5 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Net Pay</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    payrollRecords.reduce((sum, p) => sum + (p.netPay || 0), 0)
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Period Selector */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-5 h-fit">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-gray-600" />
              <h2 className="font-bold text-gray-800">Payroll Periods</h2>
            </div>

            {loadingPeriods ? (
              <div className="text-center py-4 text-gray-500">Loading...</div>
            ) : error ? (
              <div className="text-center py-4 text-red-600">{error}</div>
            ) : periods.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No payroll periods found.
                <button
                  onClick={() => navigate('/admin-dashboard/payroll/generate')}
                  className="mt-2 text-green-600 font-medium underline block"
                >
                  Generate Payroll
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {periods.map((period, index) => {
                  // Create a stable key for React (since no _id)
                  const periodKey = `${period.periodStart}_${period.periodEnd}`;
                  return (
                    <button
                      key={periodKey}
                      onClick={() => handleSelectPeriod(period)}
                      className={`w-full text-left p-3 rounded-xl transition-all ${
                        selectedPeriod?.periodStart === period.periodStart &&
                        selectedPeriod?.periodEnd === period.periodEnd
                          ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 shadow-sm'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{period.label}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Payroll Records Table */}
        <div className="lg:col-span-3">
          {selectedPeriod ? (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-5 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  Payroll Details: {selectedPeriod.label}
                </h2>
              </div>

              <div className="overflow-x-auto">
                {loadingPayroll ? (
                  <div className="p-12 text-center text-gray-500">
                    <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-2" />
                    Loading payroll records...
                  </div>
                ) : payrollRecords.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    No records found for this period.
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Employee</th>
                        <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Gross Pay</th>
                        <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Deductions</th>
                        <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Net Pay</th>
                        <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {payrollRecords.map((record) => (
                        <tr key={record._id} className="hover:bg-gray-50 transition">
                          <td className="py-4 px-6 font-medium text-gray-900">
                            {record.employee?.name || '—'}
                          </td>
                          <td className="py-4 px-6">{formatCurrency(record.grossPay)}</td>
                          <td className="py-4 px-6 text-red-600">
                            -{formatCurrency(record.totalDeductions)}
                          </td>
                          <td className="py-4 px-6 font-semibold">{formatCurrency(record.netPay)}</td>
                          <td className="py-4 px-6">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                                record.status
                              )}`}
                            >
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">Select a payroll period to view employee records</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayrollList;