// src/pages/admin-dashboard/PayslipViewer.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, Calendar, Building, ArrowLeft, Printer } from 'lucide-react';
import axios from 'axios';

const PayslipViewer = () => {
  const { payrollId } = useParams();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_BACKENDAPI;

  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayslip = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/api/payroll/${payrollId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPayslip(res.data);
      } catch (err) {
        console.error(err);
        alert('Failed to load payslip');
        navigate('/admin-dashboard/payroll');
      } finally {
        setLoading(false);
      }
    };

    if (payrollId) fetchPayslip();
  }, [payrollId]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <FileText className="w-12 h-12 mx-auto animate-pulse text-gray-400" />
        <p className="mt-4 text-gray-600">Loading payslip...</p>
      </div>
    );
  }

  if (!payslip) return null;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
      </div>

      {/* Payslip */}
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-90" />
          <h1 className="text-2xl font-bold">Payslip</h1>
          <p className="opacity-90">Period: {formatDate(payslip.periodStart)} – {formatDate(payslip.periodEnd)}</p>
        </div>

        {/* Employee Info */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{payslip.employee?.name}</h2>
          <div className="flex flex-wrap gap-4 text-gray-600">
            <div className="flex items-center gap-1">
              <Building className="w-4 h-4" />
              <span>{payslip.employee?.department || '—'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Issued: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Earnings & Deductions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Earnings */}
          <div>
            <h3 className="font-bold text-lg text-gray-800 mb-3">Earnings</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Gross Pay</span>
                <span className="font-medium">{formatCurrency(payslip.grossPay)}</span>
              </div>
              {/* Add more earnings if you store them */}
            </div>
          </div>

          {/* Deductions */}
          <div>
            <h3 className="font-bold text-lg text-gray-800 mb-3">Deductions</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Deductions</span>
                <span className="font-medium text-red-600">
                  -{formatCurrency(payslip.totalDeductions)}
                </span>
              </div>
              {/* You can expand this with PAYE, NSSF, etc. if stored */}
            </div>
          </div>
        </div>

        {/* Net Pay */}
        <div className="bg-gray-50 p-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">Net Pay</span>
            <span className="text-2xl font-bold text-green-700">
              {formatCurrency(payslip.netPay)}
            </span>
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">Amount credited to your account</p>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 p-4 text-center text-xs text-gray-500">
          This is a computer-generated payslip and does not require a signature.
        </div>
      </div>
    </div>
  );
};

export default PayslipViewer;